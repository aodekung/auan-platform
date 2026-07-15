import { describe, it, expect, vi, beforeEach } from "vitest"

// ─────────────────────────────────────────────────────────────
// vi.hoisted: define mock objects + constructors that are hoisted
// alongside vi.mock factories so they are available when factories run.
// ─────────────────────────────────────────────────────────────

const {
  mockCustomerRepo,
  MockCustomerRepository,
  mockRefreshTokenRepo,
  MockRefreshTokenRepository,
  mockStaffRepo,
  MockStaffRepository,
  mockStaffSessionRepo,
  MockStaffSessionRepository,
} = vi.hoisted(() => {
  const mockCustomerRepo = {
    findOrCreateByLineUserId: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
  }
  const MockCustomerRepository = vi.fn(function () { return mockCustomerRepo })

  const mockRefreshTokenRepo = {
    findByHash: vi.fn(),
    save: vi.fn(),
    deleteByHash: vi.fn(),
    deleteAllForUser: vi.fn(),
  }
  const MockRefreshTokenRepository = vi.fn(function () { return mockRefreshTokenRepo })

  const mockStaffRepo = {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    updateLastLogin: vi.fn(),
  }
  const MockStaffRepository = vi.fn(function () { return mockStaffRepo })

  const mockStaffSessionRepo = {
    findByHash: vi.fn(),
    save: vi.fn(),
    deleteByHash: vi.fn(),
    deleteAllForStaff: vi.fn(),
  }
  const MockStaffSessionRepository = vi.fn(function () { return mockStaffSessionRepo })

  return {
    mockCustomerRepo,
    MockCustomerRepository,
    mockRefreshTokenRepo,
    MockRefreshTokenRepository,
    mockStaffRepo,
    MockStaffRepository,
    mockStaffSessionRepo,
    MockStaffSessionRepository,
  }
})

vi.mock("@/database/repositories/customer.repository.js", () => ({
  CustomerRepository: MockCustomerRepository,
}))

vi.mock("@/database/repositories/refresh-token.repository.js", () => ({
  RefreshTokenRepository: MockRefreshTokenRepository,
}))

vi.mock("@/database/repositories/staff.repository.js", () => ({
  StaffRepository: MockStaffRepository,
}))

vi.mock("@/database/repositories/staff-session.repository.js", () => ({
  StaffSessionRepository: MockStaffSessionRepository,
}))

vi.mock("@/config/env.js", () => ({
  env: {
    OWNER_LINE_USER_IDS: "U-owner-001",
    REFRESH_TOKEN_EXPIRY_DAYS: 30,
    STAFF_JWT_EXPIRY_HOURS: 8,
    STAFF_SESSION_EXPIRY_DAYS: 30,
  },
}))

vi.mock("@/modules/auth/utils/line.utils.js", () => ({
  verifyLineIdToken: vi.fn(),
}))

vi.mock("@/modules/auth/utils/jwt.utils.js", () => ({
  generateAccessToken: vi.fn().mockReturnValue("mock-access-token"),
}))

vi.mock("@/modules/auth/utils/hash.utils.js", () => ({
  generateOpaqueToken: vi.fn().mockReturnValue("mock-opaque-token"),
  hashToken: vi.fn().mockResolvedValue("mock-hashed-token"),
}))

vi.mock("@/modules/auth/staff-auth.utils.js", () => ({
  verifyPassword: vi.fn(),
  generateStaffAccessToken: vi.fn().mockReturnValue("mock-staff-access-token"),
  hashSessionToken: vi.fn().mockResolvedValue("mock-hashed-session"),
  generateSessionToken: vi.fn().mockReturnValue("mock-session-token"),
}))

// Import after mocks are set up
import { AppError } from "@/common/errors.js"
import {
  loginWithLine,
  refreshTokens,
  logout,
  getMe,
  loginWithStaff,
  refreshStaffToken,
  staffLogout,
  getStaffMe,
} from "@/modules/auth/auth.service.js"
import { verifyLineIdToken } from "@/modules/auth/utils/line.utils.js"
import { generateAccessToken } from "@/modules/auth/utils/jwt.utils.js"
import { hashToken } from "@/modules/auth/utils/hash.utils.js"
import { verifyPassword, generateStaffAccessToken, hashSessionToken } from "@/modules/auth/staff-auth.utils.js"

// ─────────────────────────────────────────────────────────────
// Setup / Helpers
// ─────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
})

const mockApp = {} as any // FastifyInstance — only needed as a pass-through arg

function makeCustomer(overrides: Record<string, unknown> = {}) {
  return {
    id: "cust-001",
    lineUserId: "U-owner-001",
    displayName: "John Doe",
    pictureUrl: "https://pic.url/john.jpg",
    phone: "0812345678",
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    ...overrides,
  }
}

function makeStaff(overrides: Record<string, unknown> = {}) {
  return {
    id: "staff-001",
    email: "admin@auan.com",
    displayName: "Admin",
    passwordHash: "$hashed",
    isActive: true,
    role: "ADMIN",
    phoneNumber: null,
    avatarUrl: null,
    lastLoginAt: null,
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    ...overrides,
  }
}

// ─────────────────────────────────────────────────────────────
// loginWithLine
// ─────────────────────────────────────────────────────────────

describe("loginWithLine", () => {
  it("calls verifyLineIdToken with the provided idToken", async () => {
    vi.mocked(verifyLineIdToken).mockResolvedValue({
      sub: "U-001",
      name: "John",
      picture: "https://pic.url",
    } as any)
    mockCustomerRepo.findOrCreateByLineUserId.mockResolvedValue({
      customer: makeCustomer({ lineUserId: "U-001" }),
      isNew: false,
    })

    await loginWithLine(mockApp, "line-id-token-xyz")

    expect(verifyLineIdToken).toHaveBeenCalledWith("line-id-token-xyz")
  })

  it("creates new customer when first login (isNew = true)", async () => {
    vi.mocked(verifyLineIdToken).mockResolvedValue({
      sub: "U-new",
      name: "New User",
      picture: "https://pic.url",
    } as any)

    const newCustomer = makeCustomer({ id: "cust-new", lineUserId: "U-new", displayName: "New User" })
    mockCustomerRepo.findOrCreateByLineUserId.mockResolvedValue({
      customer: newCustomer,
      isNew: true,
    })

    const result = await loginWithLine(mockApp, "id-token")

    expect(result.customer.id).toBe("cust-new")
    // No update call for new users — profile is fresh
    expect(mockCustomerRepo.update).not.toHaveBeenCalled()
  })

  it("returns existing customer when returning user (isNew = false)", async () => {
    vi.mocked(verifyLineIdToken).mockResolvedValue({
      sub: "U-owner-001",
      name: "John Doe",
      picture: "https://pic.url/john.jpg",
    } as any)

    const existing = makeCustomer()
    mockCustomerRepo.findOrCreateByLineUserId.mockResolvedValue({
      customer: existing,
      isNew: false,
    })

    const result = await loginWithLine(mockApp, "id-token")

    expect(result.customer.id).toBe("cust-001")
    expect(result.customer.displayName).toBe("John Doe")
  })

  it("updates profile when display name or picture changed", async () => {
    vi.mocked(verifyLineIdToken).mockResolvedValue({
      sub: "U-owner-001",
      name: "Updated Name",
      picture: "https://pic.url/new.jpg",
    } as any)

    mockCustomerRepo.findOrCreateByLineUserId.mockResolvedValue({
      customer: makeCustomer({
        displayName: "Old Name",
        pictureUrl: "https://pic.url/old.jpg",
      }),
      isNew: false,
    })

    await loginWithLine(mockApp, "id-token")

    expect(mockCustomerRepo.update).toHaveBeenCalledWith("cust-001", {
      displayName: "Updated Name",
      pictureUrl: "https://pic.url/new.jpg",
    })
  })

  it("does not update profile when display name and picture are unchanged", async () => {
    vi.mocked(verifyLineIdToken).mockResolvedValue({
      sub: "U-owner-001",
      name: "John Doe",
      picture: "https://pic.url/john.jpg",
    } as any)

    mockCustomerRepo.findOrCreateByLineUserId.mockResolvedValue({
      customer: makeCustomer(),
      isNew: false,
    })

    await loginWithLine(mockApp, "id-token")

    expect(mockCustomerRepo.update).not.toHaveBeenCalled()
  })

  it("generates access token with correct payload (userId, lineUserId, role)", async () => {
    vi.mocked(verifyLineIdToken).mockResolvedValue({
      sub: "U-owner-001",
      name: "John Doe",
      picture: undefined,
    } as any)

    mockCustomerRepo.findOrCreateByLineUserId.mockResolvedValue({
      customer: makeCustomer({ lineUserId: "U-owner-001" }),
      isNew: false,
    })

    await loginWithLine(mockApp, "id-token")

    expect(generateAccessToken).toHaveBeenCalledWith(mockApp, {
      userId: "cust-001",
      lineUserId: "U-owner-001",
      role: "OWNER",
    })
  })

  it("generates refresh token (opaque) and stores hash", async () => {
    vi.mocked(verifyLineIdToken).mockResolvedValue({
      sub: "U-owner-001",
      name: "John Doe",
    } as any)

    mockCustomerRepo.findOrCreateByLineUserId.mockResolvedValue({
      customer: makeCustomer(),
      isNew: false,
    })

    await loginWithLine(mockApp, "id-token")

    expect(hashToken).toHaveBeenCalledWith("mock-opaque-token")
    expect(mockRefreshTokenRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        tokenHash: "mock-hashed-token",
        userId: "cust-001",
      }),
    )
  })

  it("returns accessToken, refreshToken, expiresIn, and customer", async () => {
    vi.mocked(verifyLineIdToken).mockResolvedValue({
      sub: "U-owner-001",
      name: "John Doe",
    } as any)

    mockCustomerRepo.findOrCreateByLineUserId.mockResolvedValue({
      customer: makeCustomer(),
      isNew: false,
    })

    const result = await loginWithLine(mockApp, "id-token")

    expect(result).toEqual({
      accessToken: "mock-access-token",
      refreshToken: "mock-opaque-token",
      expiresIn: 86400,
      customer: expect.objectContaining({
        id: "cust-001",
        lineUserId: "U-owner-001",
        displayName: "John Doe",
        pictureUrl: "https://pic.url/john.jpg",
      }),
    })
  })
})

// ─────────────────────────────────────────────────────────────
// refreshTokens
// ─────────────────────────────────────────────────────────────

describe("refreshTokens", () => {
  it("hashes the plaintext token before lookup", async () => {
    mockRefreshTokenRepo.findByHash.mockResolvedValue(null)

    await expect(refreshTokens(mockApp, "plaintext-token")).rejects.toThrow(AppError)

    expect(hashToken).toHaveBeenCalledWith("plaintext-token")
  })

  it("throws 401 when token not found", async () => {
    mockRefreshTokenRepo.findByHash.mockResolvedValue(null)

    try {
      await refreshTokens(mockApp, "bad-token")
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(401)
      expect((err as AppError).code).toBe("AUTHENTICATION_ERROR")
    }
  })

  it("throws 401 and deletes expired token when expired", async () => {
    const pastDate = new Date(Date.now() - 60_000)
    mockRefreshTokenRepo.findByHash.mockResolvedValue({
      tokenHash: "hash",
      userId: "cust-001",
      expiresAt: pastDate,
    })

    try {
      await refreshTokens(mockApp, "expired-token")
    } catch (err) {
      expect((err as AppError).statusCode).toBe(401)
      expect((err as AppError).message).toContain("expired")
    }

    expect(mockRefreshTokenRepo.deleteByHash).toHaveBeenCalledWith("mock-hashed-token")
  })

  it("throws 401 and deletes all user tokens when user deleted", async () => {
    const futureDate = new Date(Date.now() + 60_000)
    mockRefreshTokenRepo.findByHash.mockResolvedValue({
      tokenHash: "hash",
      userId: "cust-deleted",
      expiresAt: futureDate,
    })
    mockCustomerRepo.findById.mockResolvedValue(null)

    try {
      await refreshTokens(mockApp, "token")
    } catch (err) {
      expect((err as AppError).statusCode).toBe(401)
    }

    expect(mockRefreshTokenRepo.deleteAllForUser).toHaveBeenCalledWith("cust-deleted")
  })

  it("rotates old token (deletes old, creates new) and returns new tokens", async () => {
    const futureDate = new Date(Date.now() + 60_000)
    mockRefreshTokenRepo.findByHash.mockResolvedValue({
      tokenHash: "old-hash",
      userId: "cust-001",
      expiresAt: futureDate,
    })
    mockCustomerRepo.findById.mockResolvedValue(
      makeCustomer({ id: "cust-001", lineUserId: "U-001" }),
    )

    const result = await refreshTokens(mockApp, "old-plaintext")

    // Old token was deleted
    expect(mockRefreshTokenRepo.deleteByHash).toHaveBeenCalledWith("mock-hashed-token")
    // New token was saved
    expect(mockRefreshTokenRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "cust-001",
      }),
    )
    // Returns new tokens
    expect(result).toEqual({
      accessToken: "mock-access-token",
      refreshToken: "mock-opaque-token",
      expiresIn: 86400,
    })
  })
})

// ─────────────────────────────────────────────────────────────
// logout
// ─────────────────────────────────────────────────────────────

describe("logout", () => {
  it("deletes specific token when refreshTokenPlaintext provided", async () => {
    await logout("cust-001", "my-refresh-token")

    expect(mockRefreshTokenRepo.deleteByHash).toHaveBeenCalledWith("mock-hashed-token")
    expect(mockRefreshTokenRepo.deleteAllForUser).not.toHaveBeenCalled()
  })

  it("deletes all user tokens when refreshTokenPlaintext omitted", async () => {
    await logout("cust-001")

    expect(mockRefreshTokenRepo.deleteAllForUser).toHaveBeenCalledWith("cust-001")
    expect(mockRefreshTokenRepo.deleteByHash).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────
// getMe
// ─────────────────────────────────────────────────────────────

describe("getMe", () => {
  it("returns customer profile with dynamically resolved role", async () => {
    mockCustomerRepo.findById.mockResolvedValue(makeCustomer({ lineUserId: "U-owner-001" }))

    const result = await getMe("cust-001")

    expect(result.id).toBe("cust-001")
    expect(result.lineUserId).toBe("U-owner-001")
    expect(result.role).toBe("OWNER")
  })

  it("returns OWNER role when lineUserId is in OWNER_LINE_USER_IDS", async () => {
    mockCustomerRepo.findById.mockResolvedValue(
      makeCustomer({ lineUserId: "U-owner-001" }),
    )

    const result = await getMe("cust-001")
    expect(result.role).toBe("OWNER")
  })

  it("returns CUSTOMER role for non-owner", async () => {
    mockCustomerRepo.findById.mockResolvedValue(
      makeCustomer({ lineUserId: "U-customer-002" }),
    )

    const result = await getMe("cust-002")
    expect(result.role).toBe("CUSTOMER")
  })

  it("throws 404 when customer not found", async () => {
    mockCustomerRepo.findById.mockResolvedValue(null)

    try {
      await getMe("nonexistent")
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(404)
    }
  })
})

// ─────────────────────────────────────────────────────────────
// loginWithStaff
// ─────────────────────────────────────────────────────────────

describe("loginWithStaff", () => {
  it("throws 401 when email not found (INVALID_CREDENTIALS)", async () => {
    mockStaffRepo.findByEmail.mockResolvedValue(null)

    try {
      await loginWithStaff(mockApp, "bad@auan.com", "password")
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(401)
      expect((err as AppError).code).toBe("INVALID_CREDENTIALS")
    }
  })

  it("throws 401 when staff disabled (STAFF_DISABLED)", async () => {
    mockStaffRepo.findByEmail.mockResolvedValue(
      makeStaff({ isActive: false }),
    )

    try {
      await loginWithStaff(mockApp, "admin@auan.com", "password")
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(401)
      expect((err as AppError).code).toBe("STAFF_DISABLED")
    }
  })

  it("throws 401 when password wrong (INVALID_CREDENTIALS)", async () => {
    vi.mocked(verifyPassword).mockResolvedValue(false)
    mockStaffRepo.findByEmail.mockResolvedValue(makeStaff())

    try {
      await loginWithStaff(mockApp, "admin@auan.com", "wrong")
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(401)
      expect((err as AppError).code).toBe("INVALID_CREDENTIALS")
    }
  })

  it("generates staff access token with correct payload", async () => {
    vi.mocked(verifyPassword).mockResolvedValue(true)
    mockStaffRepo.findByEmail.mockResolvedValue(makeStaff())

    await loginWithStaff(mockApp, "admin@auan.com", "correct")

    expect(generateStaffAccessToken).toHaveBeenCalledWith({
      staffId: "staff-001",
      email: "admin@auan.com",
      role: "ADMIN",
    })
  })

  it("generates session token and stores hash", async () => {
    vi.mocked(verifyPassword).mockResolvedValue(true)
    mockStaffRepo.findByEmail.mockResolvedValue(makeStaff())

    await loginWithStaff(mockApp, "admin@auan.com", "correct")

    expect(hashSessionToken).toHaveBeenCalledWith("mock-session-token")
    expect(mockStaffSessionRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        staffId: "staff-001",
        tokenHash: "mock-hashed-session",
      }),
    )
  })

  it("updates lastLoginAt", async () => {
    vi.mocked(verifyPassword).mockResolvedValue(true)
    mockStaffRepo.findByEmail.mockResolvedValue(makeStaff())

    await loginWithStaff(mockApp, "admin@auan.com", "correct")

    expect(mockStaffRepo.updateLastLogin).toHaveBeenCalledWith("staff-001")
  })

  it("returns accessToken, sessionToken, expiresIn, and staff info", async () => {
    vi.mocked(verifyPassword).mockResolvedValue(true)
    mockStaffRepo.findByEmail.mockResolvedValue(makeStaff())

    const result = await loginWithStaff(mockApp, "admin@auan.com", "correct")

    expect(result).toEqual({
      accessToken: "mock-staff-access-token",
      sessionToken: "mock-session-token",
      expiresIn: 8 * 60 * 60,
      staff: {
        id: "staff-001",
        email: "admin@auan.com",
        displayName: "Admin",
        role: "ADMIN",
      },
    })
  })
})

// ─────────────────────────────────────────────────────────────
// refreshStaffToken
// ─────────────────────────────────────────────────────────────

describe("refreshStaffToken", () => {
  it("throws 401 when session not found", async () => {
    mockStaffSessionRepo.findByHash.mockResolvedValue(null)

    try {
      await refreshStaffToken(mockApp, "bad-session")
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(401)
      expect((err as AppError).code).toBe("INVALID_STAFF_TOKEN")
    }
  })

  it("throws 401 and deletes when session expired", async () => {
    const pastDate = new Date(Date.now() - 60_000)
    mockStaffSessionRepo.findByHash.mockResolvedValue({
      tokenHash: "session-hash",
      staffId: "staff-001",
      expiresAt: pastDate,
    })

    try {
      await refreshStaffToken(mockApp, "expired-session")
    } catch (err) {
      expect((err as AppError).statusCode).toBe(401)
      expect((err as AppError).code).toBe("STAFF_TOKEN_EXPIRED")
    }

    expect(mockStaffSessionRepo.deleteByHash).toHaveBeenCalledWith("mock-hashed-session")
  })

  it("throws 401 and deletes all sessions when staff inactive", async () => {
    const futureDate = new Date(Date.now() + 60_000)
    mockStaffSessionRepo.findByHash.mockResolvedValue({
      tokenHash: "session-hash",
      staffId: "staff-001",
      expiresAt: futureDate,
    })
    mockStaffRepo.findById.mockResolvedValue(null)

    try {
      await refreshStaffToken(mockApp, "session-token")
    } catch (err) {
      expect((err as AppError).statusCode).toBe(401)
    }

    expect(mockStaffSessionRepo.deleteAllForStaff).toHaveBeenCalledWith("staff-001")
  })

  it("rotates session token (deletes old, creates new) and returns new tokens", async () => {
    const futureDate = new Date(Date.now() + 60_000)
    mockStaffSessionRepo.findByHash.mockResolvedValue({
      tokenHash: "old-hash",
      staffId: "staff-001",
      expiresAt: futureDate,
    })
    mockStaffRepo.findById.mockResolvedValue(makeStaff())

    const result = await refreshStaffToken(mockApp, "old-session")

    expect(mockStaffSessionRepo.deleteByHash).toHaveBeenCalledWith("mock-hashed-session")
    expect(mockStaffSessionRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        staffId: "staff-001",
      }),
    )
    expect(result).toEqual({
      accessToken: "mock-staff-access-token",
      sessionToken: "mock-session-token",
      expiresIn: 8 * 60 * 60,
    })
  })
})

// ─────────────────────────────────────────────────────────────
// staffLogout
// ─────────────────────────────────────────────────────────────

describe("staffLogout", () => {
  it("deletes specific session when sessionTokenPlaintext provided", async () => {
    await staffLogout("staff-001", "session-token")

    expect(mockStaffSessionRepo.deleteByHash).toHaveBeenCalledWith("mock-hashed-session")
    expect(mockStaffSessionRepo.deleteAllForStaff).not.toHaveBeenCalled()
  })

  it("deletes all sessions when sessionTokenPlaintext omitted", async () => {
    await staffLogout("staff-001")

    expect(mockStaffSessionRepo.deleteAllForStaff).toHaveBeenCalledWith("staff-001")
    expect(mockStaffSessionRepo.deleteByHash).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────
// getStaffMe
// ─────────────────────────────────────────────────────────────

describe("getStaffMe", () => {
  it("returns staff profile", async () => {
    mockStaffRepo.findById.mockResolvedValue(
      makeStaff({ lastLoginAt: new Date("2025-06-01T10:00:00.000Z") }),
    )

    const result = await getStaffMe("staff-001")

    expect(result).toEqual({
      id: "staff-001",
      email: "admin@auan.com",
      displayName: "Admin",
      phoneNumber: null,
      avatarUrl: null,
      role: "ADMIN",
      lastLoginAt: "2025-06-01T10:00:00.000Z",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    })
  })

  it("throws 404 when staff not found", async () => {
    mockStaffRepo.findById.mockResolvedValue(null)

    try {
      await getStaffMe("nonexistent")
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(404)
      expect((err as AppError).code).toBe("STAFF_NOT_FOUND")
    }
  })
})
