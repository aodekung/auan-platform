/**
 * Mock Prisma Client for testing.
 *
 * Provides mock implementations for all Prisma models used in the
 * Auan-Auan-Platform API. Each model exposes the standard CRUD methods
 * backed by `vi.fn()`. Use `resetMocks()` in `beforeEach` to clear
 * call history between tests.
 */

import { vi } from "vitest"

/** Standard set of mock methods shared by every Prisma delegate. */
function createModelDelegate() {
  return {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
  }
}

/** Collect every mock function across all model delegates. */
function collectMockFns(client: Record<string, unknown>): vi.Mock[] {
  const mocks: vi.Mock[] = []
  for (const value of Object.values(client)) {
    if (value && typeof value === "object" && "$transaction" in value === false) {
      for (const fn of Object.values(value as Record<string, unknown>)) {
        if (typeof fn === "function" && "mockClear" in fn) {
          mocks.push(fn as vi.Mock)
        }
      }
    }
  }
  return mocks
}

export const mockPrismaClient = {
  // ── Customer domain ──────────────────────────────────────────
  customer: createModelDelegate(),
  customerAddress: createModelDelegate(),
  cart: createModelDelegate(),
  cartItem: createModelDelegate(),
  refreshToken: createModelDelegate(),

  // ── Product domain ───────────────────────────────────────────
  product: createModelDelegate(),
  category: createModelDelegate(),
  productOptionGroup: createModelDelegate(),
  productOption: createModelDelegate(),

  // ── Order domain ─────────────────────────────────────────────
  order: createModelDelegate(),
  orderItem: createModelDelegate(),
  orderItemOption: createModelDelegate(),
  orderStatusHistory: createModelDelegate(),

  // ── Payment domain ───────────────────────────────────────────
  payment: createModelDelegate(),

  // ── Notification domain ───────────────────────────────────────
  notification: createModelDelegate(),
  notificationTemplate: createModelDelegate(),
  notificationPreference: createModelDelegate(),

  // ── Settings domain ──────────────────────────────────────────
  setting: createModelDelegate(),

  // ── Audit domain ─────────────────────────────────────────────
  auditLog: createModelDelegate(),

  // ── Staff domain ──────────────────────────────────────────────
  staff: createModelDelegate(),
  staffRole: createModelDelegate(),
  staffSession: createModelDelegate(),

  // ── Prisma utility ──────────────────────────────────────────
  $transaction: vi.fn(async (callback: (tx: typeof mockPrismaClient) => unknown) => {
    return callback(mockPrismaClient)
  }),

  // ── Lifecycle helpers (no-ops) ───────────────────────────────
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  $on: vi.fn(),
  $use: vi.fn(),
}

/**
 * Clear every mock function on the mock Prisma Client.
 *
 * Call this in `beforeEach` so each test starts with a clean slate:
 *
 * ```ts
 * beforeEach(() => { resetMocks() })
 * ```
 */
export function resetMocks(): void {
  vi.clearAllMocks()
  for (const fn of collectMockFns(mockPrismaClient)) {
    fn.mockClear()
  }
}
