/**
 * Auth Service — business logic for authentication.
 *
 * Responsibilities:
 * - LINE ID Token verification
 * - Customer auto-registration (first login)
 * - Profile update on subsequent logins
 * - JWT access token generation
 * - Refresh token generation, rotation, and revocation
 * - Role resolution (Customer vs Owner via env)
 *
 * Business rules from 175-authentication-authorization.md:
 * - First Login → Create Customer → Active
 * - Authentication exclusively through LINE LIFF Login
 * - JWT payload: userId, role, lineUserId (no secrets)
 *
 * All database access goes through repository layer.
 */

import type { FastifyInstance } from "fastify"

import { AppError, ErrorCode } from "../../common/errors.js"
import { env } from "../../config/env.js"
import { CustomerRepository } from "../../database/repositories/customer.repository.js"
import { RefreshTokenRepository } from "../../database/repositories/refresh-token.repository.js"
import { StaffSessionRepository } from "../../database/repositories/staff-session.repository.js"
import { StaffRepository } from "../../database/repositories/staff.repository.js"

import type {
  JwtPayload,
  LoginResponse,
  MeResponse,
  RefreshResponse,
  StaffJwtPayload,
  StaffLoginResponse,
  StaffMeResponse,
  StaffRefreshResponse,
} from "./auth.types.js"
import { verifyPassword, generateStaffAccessToken, hashSessionToken, generateSessionToken } from "./staff-auth.utils.js"
import {
  generateOpaqueToken,
  hashToken,
} from "./utils/hash.utils.js"
import { generateAccessToken } from "./utils/jwt.utils.js"
import { verifyLineIdToken } from "./utils/line.utils.js"

// ─────────────────────────────────────────────────────────────
// Repository instances (singleton per module)
// ─────────────────────────────────────────────────────────────

const customerRepo = new CustomerRepository()
const refreshTokenRepo = new RefreshTokenRepository()
const staffRepo = new StaffRepository()
const staffSessionRepo = new StaffSessionRepository()

// ─────────────────────────────────────────────────────────────
// Role Resolution
// ─────────────────────────────────────────────────────────────

/**
 * Determine user role based on LINE User ID.
 *
 * Owner IDs are configured via OWNER_LINE_USER_IDS env var.
 * Everyone else is a Customer.
 *
 * Authorization must ALWAYS be enforced by the backend (per 175-auth).
 */
function resolveRole(lineUserId: string): "CUSTOMER" | "OWNER" {
  const ownerIds = env.OWNER_LINE_USER_IDS
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)

  return ownerIds.includes(lineUserId) ? "OWNER" : "CUSTOMER"
}

// ─────────────────────────────────────────────────────────────
// Token Pair Generation
// ─────────────────────────────────────────────────────────────

interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

/**
 * Generate a new access token + refresh token pair.
 * The refresh token is hashed and stored in the database.
 */
async function generateTokenPair(
  app: FastifyInstance,
  userId: string,
  lineUserId: string,
  oldRefreshTokenHash?: string,
): Promise<TokenPair> {
  const role = resolveRole(lineUserId)
  const payload: JwtPayload = { userId, lineUserId, role }

  const accessToken = generateAccessToken(app, payload)
  const refreshTokenPlaintext = generateOpaqueToken()
  const refreshTokenHash = await hashToken(refreshTokenPlaintext)

  // Calculate refresh token expiry
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRY_DAYS)

  // Delete old refresh token (token rotation)
  if (oldRefreshTokenHash) {
    await refreshTokenRepo.deleteByHash(oldRefreshTokenHash)
  }

  // Store new hashed refresh token
  await refreshTokenRepo.save({
    tokenHash: refreshTokenHash,
    userId,
    expiresAt,
  })

  return {
    accessToken,
    refreshToken: refreshTokenPlaintext,
    expiresIn: 24 * 60 * 60, // Access token: 24h in seconds
  }
}

// ─────────────────────────────────────────────────────────────
// LINE Login
// ─────────────────────────────────────────────────────────────

/**
 * Authenticate a user via LINE Login.
 *
 * Flow:
 *   1. Verify LINE ID Token with LINE API
 *   2. Find or create Customer record
 *   3. Update profile if display name / picture changed
 *   4. Generate access token + refresh token pair
 *   5. Return tokens + customer data
 */
export async function loginWithLine(
  app: FastifyInstance,
  idToken: string,
): Promise<LoginResponse> {
  // Step 1: Verify with LINE Platform
  const lineProfile = await verifyLineIdToken(idToken)

  // Step 2: Find or create customer
  const { customer, isNew } = await customerRepo.findOrCreateByLineUserId(
    lineProfile.sub,
    lineProfile.name,
    lineProfile.picture ?? "",
  )

  // Step 3: Update profile if data changed (for returning users)
  if (!isNew) {
    const needsUpdate =
      customer.displayName !== lineProfile.name ||
      (lineProfile.picture !== undefined &&
        customer.pictureUrl !== lineProfile.picture)

    if (needsUpdate) {
      await customerRepo.update(customer.id, {
        displayName: lineProfile.name,
        ...(lineProfile.picture !== undefined && {
          pictureUrl: lineProfile.picture,
        }),
      })
    }
  }

  // Step 4: Generate token pair
  const tokens = await generateTokenPair(
    app,
    customer.id,
    customer.lineUserId,
  )

  // Step 5: Return
  return {
    ...tokens,
    customer: {
      id: customer.id,
      lineUserId: customer.lineUserId,
      displayName: customer.displayName,
      pictureUrl: customer.pictureUrl,
    },
  }
}

// ─────────────────────────────────────────────────────────────
// Refresh Token
// ─────────────────────────────────────────────────────────────

/**
 * Refresh an access token using a refresh token.
 *
 * Flow:
 *   1. Hash the plaintext refresh token
 *   2. Look up the stored hash
 *   3. Verify not expired
 *   4. Generate new token pair (rotate old token)
 *   5. Return new tokens
 */
export async function refreshTokens(
  app: FastifyInstance,
  refreshTokenPlaintext: string,
): Promise<RefreshResponse> {
  // Step 1: Hash and lookup
  const tokenHash = await hashToken(refreshTokenPlaintext)
  const storedToken = await refreshTokenRepo.findByHash(tokenHash)

  if (!storedToken) {
    throw new AppError(
      401,
      ErrorCode.AUTHENTICATION_ERROR,
      "Invalid refresh token",
    )
  }

  // Step 2: Check expiry
  if (storedToken.expiresAt < new Date()) {
    // Delete expired token
    await refreshTokenRepo.deleteByHash(tokenHash)
    throw new AppError(
      401,
      ErrorCode.AUTHENTICATION_ERROR,
      "Refresh token has expired",
    )
  }

  // Step 3: Verify user still exists
  const customer = await customerRepo.findById(storedToken.userId)
  if (!customer) {
    // User deleted — remove their tokens
    await refreshTokenRepo.deleteAllForUser(storedToken.userId)
    throw new AppError(
      401,
      ErrorCode.AUTHENTICATION_ERROR,
      "User no longer exists",
    )
  }

  // Step 4: Generate new pair (rotates old token)
  const tokens = await generateTokenPair(
    app,
    customer.id,
    customer.lineUserId,
    tokenHash,
  )

  return tokens
}

// ─────────────────────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────────────────────

/**
 * Logout: invalidate all refresh tokens for a user.
 *
 * If a specific refresh token is provided, only that one is deleted.
 * Otherwise, all tokens for the user are deleted (full logout).
 */
export async function logout(
  userId: string,
  refreshTokenPlaintext?: string,
): Promise<void> {
  if (refreshTokenPlaintext) {
    const tokenHash = await hashToken(refreshTokenPlaintext)
    await refreshTokenRepo.deleteByHash(tokenHash)
  } else {
    await refreshTokenRepo.deleteAllForUser(userId)
  }
}

// ─────────────────────────────────────────────────────────────
// Profile
// ─────────────────────────────────────────────────────────────

/**
 * Get the current authenticated user's full profile.
 *
 * Resolves role dynamically from env (Owner IDs) since
 * the Customer model does not store a role field.
 */
export async function getMe(userId: string): Promise<MeResponse> {
  const customer = await customerRepo.findById(userId)

  if (!customer) {
    throw new AppError(404, ErrorCode.NOT_FOUND, "Customer not found")
  }

  return {
    id: customer.id,
    lineUserId: customer.lineUserId,
    displayName: customer.displayName,
    pictureUrl: customer.pictureUrl,
    phone: customer.phone,
    role: resolveRole(customer.lineUserId),
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
  }
}

/**
 * Update the current authenticated user's phone number.
 *
 * Only phone is editable — displayName and pictureUrl come from LINE
 * and are synced on each login.
 */
export async function updateMe(
  userId: string,
  data: { phone?: string },
): Promise<MeResponse> {
  const customer = await customerRepo.findById(userId)

  if (!customer) {
    throw new AppError(404, ErrorCode.NOT_FOUND, "Customer not found")
  }

  const updated = await customerRepo.update(userId, {
    ...(data.phone !== undefined && { phone: data.phone }),
  })

  return {
    id: updated.id,
    lineUserId: updated.lineUserId,
    displayName: updated.displayName,
    pictureUrl: updated.pictureUrl,
    phone: updated.phone,
    role: resolveRole(updated.lineUserId),
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  }
}

// ─────────────────────────────────────────────────────────────
// Staff Login / Logout / Refresh
// ─────────────────────────────────────────────────────────────

/**
 * Authenticate a staff member via email + password.
 *
 * Flow:
 *   1. Find staff by email (active, not soft-deleted)
 *   2. Verify password
 *   3. Generate access token + session token pair
 *   4. Update lastLoginAt
 *   5. Return tokens + staff data
 */
export async function loginWithStaff(
  app: FastifyInstance,
  email: string,
  password: string,
): Promise<StaffLoginResponse> {
  const staff = await staffRepo.findByEmail(email)

  if (!staff) {
    throw new AppError(
      401,
      ErrorCode.INVALID_CREDENTIALS,
      "Invalid email or password",
    )
  }

  if (!staff.isActive) {
    throw new AppError(
      401,
      ErrorCode.STAFF_DISABLED,
      "Staff account is disabled",
    )
  }

  const isValid = await verifyPassword(password, staff.passwordHash)
  if (!isValid) {
    throw new AppError(
      401,
      ErrorCode.INVALID_CREDENTIALS,
      "Invalid email or password",
    )
  }

  const role = staff.role
  const payload: StaffJwtPayload = { staffId: staff.id, email: staff.email, role }

  const accessToken = generateStaffAccessToken(payload)
  const sessionTokenPlaintext = generateSessionToken()
  const sessionTokenHash = await hashSessionToken(sessionTokenPlaintext)

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + env.STAFF_SESSION_EXPIRY_DAYS)

  await staffSessionRepo.save({
    staffId: staff.id,
    tokenHash: sessionTokenHash,
    expiresAt,
  })

  await staffRepo.updateLastLogin(staff.id)

  return {
    accessToken,
    sessionToken: sessionTokenPlaintext,
    expiresIn: env.STAFF_JWT_EXPIRY_HOURS * 60 * 60,
    staff: {
      id: staff.id,
      email: staff.email,
      displayName: staff.displayName,
      role: staff.role,
    },
  }
}

/**
 * Refresh a staff access token using a session token.
 */
export async function refreshStaffToken(
  app: FastifyInstance,
  sessionTokenPlaintext: string,
): Promise<StaffRefreshResponse> {
  const tokenHash = await hashSessionToken(sessionTokenPlaintext)
  const session = await staffSessionRepo.findByHash(tokenHash)

  if (!session) {
    throw new AppError(
      401,
      ErrorCode.INVALID_STAFF_TOKEN,
      "Invalid session token",
    )
  }

  if (session.expiresAt < new Date()) {
    await staffSessionRepo.deleteByHash(tokenHash)
    throw new AppError(
      401,
      ErrorCode.STAFF_TOKEN_EXPIRED,
      "Session token has expired",
    )
  }

  const staff = await staffRepo.findById(session.staffId)
  if (!staff || !staff.isActive) {
    await staffSessionRepo.deleteAllForStaff(session.staffId)
    throw new AppError(
      401,
      ErrorCode.STAFF_DISABLED,
      "Staff account is no longer active",
    )
  }

  const payload: StaffJwtPayload = { staffId: staff.id, email: staff.email, role: staff.role }
  const accessToken = generateStaffAccessToken(payload)

  const newSessionToken = generateSessionToken()
  const newHash = await hashSessionToken(newSessionToken)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + env.STAFF_SESSION_EXPIRY_DAYS)

  await staffSessionRepo.deleteByHash(tokenHash)
  await staffSessionRepo.save({
    staffId: staff.id,
    tokenHash: newHash,
    expiresAt,
  })

  return {
    accessToken,
    sessionToken: newSessionToken,
    expiresIn: env.STAFF_JWT_EXPIRY_HOURS * 60 * 60,
  }
}

/**
 * Logout: invalidate staff session(s).
 */
export async function staffLogout(
  staffId: string,
  sessionTokenPlaintext?: string,
): Promise<void> {
  if (sessionTokenPlaintext) {
    const tokenHash = await hashSessionToken(sessionTokenPlaintext)
    await staffSessionRepo.deleteByHash(tokenHash)
  } else {
    await staffSessionRepo.deleteAllForStaff(staffId)
  }
}

/**
 * Get the current authenticated staff member's full profile.
 */
export async function getStaffMe(staffId: string): Promise<StaffMeResponse> {
  const staff = await staffRepo.findById(staffId)

  if (!staff) {
    throw new AppError(404, ErrorCode.STAFF_NOT_FOUND, "Staff not found")
  }

  return {
    id: staff.id,
    email: staff.email,
    displayName: staff.displayName,
    phoneNumber: staff.phoneNumber,
    avatarUrl: staff.avatarUrl,
    role: staff.role,
    lastLoginAt: staff.lastLoginAt?.toISOString() ?? null,
    createdAt: staff.createdAt.toISOString(),
    updatedAt: staff.updatedAt.toISOString(),
  }
}
