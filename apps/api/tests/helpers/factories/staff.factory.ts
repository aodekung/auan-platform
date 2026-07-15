/**
 * Factory functions for creating mock Staff, StaffRole, and
 * StaffSession objects.
 */

import { faker } from "@faker-js/faker/locale/th"

// ── Types ──────────────────────────────────────────────────────

export interface MockStaffRole {
  id: string
  name: string
  description: string | null
  permissions: unknown
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MockStaff {
  id: string
  email: string
  passwordHash: string
  displayName: string
  phoneNumber: string | null
  avatarUrl: string | null
  role: string
  isActive: boolean
  lastLoginAt: Date | null
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
  staffRole: MockStaffRole | null
}

export interface MockStaffSession {
  id: string
  staffId: string
  tokenHash: string
  expiresAt: Date
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
}

// ── Factories ──────────────────────────────────────────────────

/**
 * Create a mock StaffRole object with sensible defaults.
 */
export function createMockStaffRole(
  overrides: Partial<MockStaffRole> = {},
): MockStaffRole {
  return {
    id: faker.string.uuid(),
    name: "STAFF",
    description: null,
    permissions: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Create a mock Staff object with sensible defaults.
 * The password hash is a placeholder string — not a real bcrypt hash.
 */
export function createMockStaff(
  overrides: Partial<MockStaff> = {},
): MockStaff {
  const role = "STAFF"

  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    passwordHash: "$hashed",
    displayName: faker.person.firstName(),
    phoneNumber: null,
    avatarUrl: null,
    role,
    isActive: true,
    lastLoginAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    staffRole: createMockStaffRole({ name: role }),
    ...overrides,
  }
}

/**
 * Create a mock StaffSession object with sensible defaults.
 */
export function createMockStaffSession(
  overrides: Partial<MockStaffSession> = {},
): MockStaffSession {
  return {
    id: faker.string.uuid(),
    staffId: faker.string.uuid(),
    tokenHash: faker.string.hexadecimal({ length: 64 }),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    ipAddress: null,
    userAgent: null,
    createdAt: new Date(),
    ...overrides,
  }
}
