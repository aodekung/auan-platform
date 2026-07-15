/**
 * Admin Staff Management Service.
 *
 * Business logic for admin staff operations:
 * - List/search staff with pagination
 * - Create staff accounts
 * - Update staff profiles and roles
 * - Enable/disable staff accounts
 * - Reset staff passwords
 *
 * Business rules:
 * - Only OWNER/ADMIN can manage staff
 * - Cannot disable yourself
 * - Only OWNER can manage ADMIN roles
 * - Role hierarchy enforced for promotions
 *
 * Per 60-architecture.md: business logic in services, NOT controllers.
 * Per 100-security-rules.md: audit all administrative actions.
 */

import { randomBytes } from "node:crypto"

import { STAFF_ROLE_HIERARCHY } from "@auan/types"

import { AppError, ErrorCode } from "../../common/errors.js"
import { AuditLogRepository } from "../../database/repositories/audit-log.repository.js"
import { StaffRepository } from "../../database/repositories/staff.repository.js"
import { hashPassword } from "../auth/staff-auth.utils.js"

import type { CreateStaffRequest, ResetPasswordResponse, StaffDetailResponse, StaffListQuery, UpdateStaffRequest } from "./admin.types.js"

const staffRepo = new StaffRepository()
const auditLogRepo = new AuditLogRepository()

// ─────────────────────────────────────────────────────────────
// List & View
// ─────────────────────────────────────────────────────────────

/**
 * List staff with pagination, search, and filter.
 */
export async function listStaff(query: StaffListQuery) {
  return staffRepo.findAll(query)
}

/**
 * Get staff member details by ID.
 */
export async function getStaff(id: string): Promise<StaffDetailResponse> {
  const staff = await staffRepo.findById(id)
  if (!staff) {
    throw new AppError(404, ErrorCode.STAFF_NOT_FOUND, "Staff not found")
  }

  return mapToStaffDetail(staff)
}

// ─────────────────────────────────────────────────────────────
// Create
// ─────────────────────────────────────────────────────────────

/**
 * Create a new staff member.
 *
 * Validates:
 * - Unique email (including soft-deleted)
 * - Valid role (exists in StaffRole hierarchy)
 * - Minimum password length
 *
 * Business rule: Only OWNER/ADMIN can create staff.
 */
export async function createStaff(
  data: CreateStaffRequest,
  actorId: string,
  actorName: string,
): Promise<StaffDetailResponse> {
  // Validate unique email
  const existing = await staffRepo.findByEmailIncludeDeleted(data.email)
  if (existing) {
    throw new AppError(409, ErrorCode.STAFF_EMAIL_DUPLICATE, "A staff member with this email already exists")
  }

  // Validate role
  const roleHierarchy = STAFF_ROLE_HIERARCHY[data.role as keyof typeof STAFF_ROLE_HIERARCHY]
  if (roleHierarchy === undefined) {
    throw new AppError(400, ErrorCode.INVALID_STAFF_ROLE, `Invalid staff role: ${data.role}`)
  }

  // Hash password
  const passwordHash = await hashPassword(data.password)

  // Create
  const staff = await staffRepo.create({
    email: data.email,
    passwordHash,
    displayName: data.displayName,
    phoneNumber: data.phoneNumber ?? null,
    staffRole: { connect: { name: data.role } },
  } as Parameters<typeof staffRepo.create>[0])

  // Audit log
  await auditLogRepo.log({
    action: "STAFF_CREATED",
    entityType: "Staff",
    entityId: staff.id,
    actorId,
    actorName,
    details: { email: staff.email, displayName: staff.displayName, role: staff.role },
  })

  return getStaff(staff.id)
}

// ─────────────────────────────────────────────────────────────
// Update
// ─────────────────────────────────────────────────────────────

/**
 * Update staff member profile and/or role.
 *
 * Business rule: Cannot modify yourself.
 * Business rule: Only OWNER can assign ADMIN role.
 * Business rule: Role hierarchy check — cannot promote above own level.
 */
export async function updateStaff(
  id: string,
  data: UpdateStaffRequest,
  actorId: string,
  actorName: string,
  actorRole: string,
): Promise<StaffDetailResponse> {
  const staff = await staffRepo.findById(id)
  if (!staff) {
    throw new AppError(404, ErrorCode.STAFF_NOT_FOUND, "Staff not found")
  }

  // Cannot modify yourself
  if (id === actorId) {
    throw new AppError(400, ErrorCode.CANNOT_MODIFY_SELF, "Cannot modify your own account through this endpoint")
  }

  // Role change validation
  if (data.role && data.role !== staff.role) {
    // Only OWNER can manage ADMIN
    if (data.role === "ADMINISTRATOR" && actorRole !== "OWNER") {
      throw new AppError(403, ErrorCode.INSUFFICIENT_PRIVILEGE, "Only the owner can assign administrator role")
    }

    // Cannot promote above own level
    const actorLevel = STAFF_ROLE_HIERARCHY[actorRole as keyof typeof STAFF_ROLE_HIERARCHY] ?? 0
    const targetLevel = STAFF_ROLE_HIERARCHY[data.role as keyof typeof STAFF_ROLE_HIERARCHY] ?? 0
    if (targetLevel >= actorLevel) {
      throw new AppError(403, ErrorCode.INSUFFICIENT_PRIVILEGE, "Cannot promote staff to equal or higher level than yourself")
    }

    // Validate target role exists
    if (targetLevel === undefined) {
      throw new AppError(400, ErrorCode.INVALID_STAFF_ROLE, `Invalid staff role: ${data.role}`)
    }
  }

  // Build update data
  const updateData: Record<string, unknown> = {}
  if (data.displayName !== undefined) updateData.displayName = data.displayName
  if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber
  if (data.role !== undefined) updateData.role = data.role

  await staffRepo.update(id, updateData)

  // Audit log
  const changes: Array<{ field: string; oldValue: unknown; newValue: unknown }> = []
  if (data.displayName !== undefined && data.displayName !== staff.displayName) {
    changes.push({ field: "displayName", oldValue: staff.displayName, newValue: data.displayName })
  }
  if (data.role !== undefined && data.role !== staff.role) {
    changes.push({ field: "role", oldValue: staff.role, newValue: data.role })
  }

  if (changes.length > 0) {
    await auditLogRepo.log({
      action: "STAFF_UPDATED",
      entityType: "Staff",
      entityId: id,
      actorId,
      actorName,
      details: { changes },
    })
  }

  return getStaff(id)
}

// ─────────────────────────────────────────────────────────────
// Enable / Disable
// ─────────────────────────────────────────────────────────────

/**
 * Toggle staff active status (enable or disable).
 *
 * Business rule: Cannot disable yourself.
 * Business rule: Cannot disable staff with higher role than yourself.
 */
export async function toggleStaffStatus(
  id: string,
  actorId: string,
  actorName: string,
  actorRole: string,
): Promise<StaffDetailResponse> {
  const staff = await staffRepo.findById(id)
  if (!staff) {
    throw new AppError(404, ErrorCode.STAFF_NOT_FOUND, "Staff not found")
  }

  // Cannot disable yourself
  if (id === actorId) {
    throw new AppError(400, ErrorCode.CANNOT_MODIFY_SELF, "Cannot disable your own account")
  }

  // Cannot disable staff with higher or equal role
  const actorLevel = STAFF_ROLE_HIERARCHY[actorRole as keyof typeof STAFF_ROLE_HIERARCHY] ?? 0
  const targetLevel = STAFF_ROLE_HIERARCHY[staff.role as keyof typeof STAFF_ROLE_HIERARCHY] ?? 0
  if (targetLevel >= actorLevel) {
    throw new AppError(403, ErrorCode.INSUFFICIENT_PRIVILEGE, "Cannot disable staff with equal or higher privilege level")
  }

  if (staff.isActive) {
    await staffRepo.softDelete(id)
    await auditLogRepo.log({
      action: "STAFF_DISABLED",
      entityType: "Staff",
      entityId: id,
      actorId,
      actorName,
      details: { email: staff.email, displayName: staff.displayName },
    })
  } else {
    await staffRepo.reactivate(id)
    await auditLogRepo.log({
      action: "STAFF_ENABLED",
      entityType: "Staff",
      entityId: id,
      actorId,
      actorName,
      details: { email: staff.email, displayName: staff.displayName },
    })
  }

  return getStaff(id)
}

// ─────────────────────────────────────────────────────────────
// Reset Password
// ─────────────────────────────────────────────────────────────

/**
 * Reset a staff member's password.
 * Generates a temporary password, hashes it, and updates the record.
 * Returns the temporary password (only shown once to the admin).
 *
 * Business rule: Cannot reset your own password through this endpoint.
 * Business rule: Only OWNER/ADMIN can reset passwords.
 */
export async function resetStaffPassword(
  id: string,
  actorId: string,
  actorName: string,
): Promise<ResetPasswordResponse> {
  const staff = await staffRepo.findById(id)
  if (!staff) {
    throw new AppError(404, ErrorCode.STAFF_NOT_FOUND, "Staff not found")
  }

  // Cannot reset your own password here
  if (id === actorId) {
    throw new AppError(400, ErrorCode.CANNOT_MODIFY_SELF, "Cannot reset your own password through this endpoint")
  }

  // Generate temp password (16 chars, alphanumeric)
  const tempPassword = randomBytes(16).toString("base64url").slice(0, 16)
  const passwordHash = await hashPassword(tempPassword)

  await staffRepo.update(id, { passwordHash })

  await auditLogRepo.log({
    action: "STAFF_PASSWORD_RESET",
    entityType: "Staff",
    entityId: id,
    actorId,
    actorName,
    details: { email: staff.email },
  })

  return { tempPassword }
}

// ─────────────────────────────────────────────────────────────
// Mapper
// ─────────────────────────────────────────────────────────────

function mapToStaffDetail(staff: Awaited<ReturnType<typeof staffRepo.findById>>): StaffDetailResponse {
  if (!staff) throw new Error("Staff not found")
  return {
    id: staff.id,
    email: staff.email,
    displayName: staff.displayName,
    phoneNumber: staff.phoneNumber,
    avatarUrl: staff.avatarUrl,
    role: staff.role,
    isActive: staff.isActive,
    lastLoginAt: staff.lastLoginAt?.toISOString() ?? null,
    createdAt: staff.createdAt.toISOString(),
    updatedAt: staff.updatedAt.toISOString(),
  }
}
