import { describe, it, expect, vi, beforeEach } from "vitest"

// ─────────────────────────────────────────────────────────────
// vi.hoisted: define mock prisma client + tx that are hoisted
// alongside vi.mock factories so they are available when factories run.
// ─────────────────────────────────────────────────────────────

const { mockPrisma, mockTx } = vi.hoisted(() => {
  const mockTx = {
    customerAddress: {
      updateMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
  }

  const mockPrisma = {
    customerAddress: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn((fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
  }

  return { mockPrisma, mockTx }
})

vi.mock("@/database/client.js", () => ({
  prisma: mockPrisma,
}))

// Imports
import { AppError } from "@/common/errors.js"
import {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/modules/addresses/addresses.service.js"

// ─────────────────────────────────────────────────────────────
// Setup / Helpers
// ─────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
})

function makeAddress(overrides: Record<string, unknown> = {}) {
  return {
    id: "addr-001",
    customerId: "cust-001",
    building: "A",
    roomNumber: "101",
    note: "Near elevator",
    isDefault: true,
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    ...overrides,
  }
}

// ─────────────────────────────────────────────────────────────
// listAddresses
// ─────────────────────────────────────────────────────────────

describe("listAddresses", () => {
  it("returns addresses ordered by isDefault desc, createdAt desc", async () => {
    const addresses = [
      makeAddress({ id: "addr-001", isDefault: true, createdAt: new Date("2025-01-01") }),
      makeAddress({ id: "addr-002", isDefault: false, createdAt: new Date("2025-01-05") }),
      makeAddress({ id: "addr-003", isDefault: false, createdAt: new Date("2025-01-03") }),
    ]
    mockPrisma.customerAddress.findMany.mockResolvedValue(addresses)

    const result = await listAddresses("cust-001")

    expect(result).toHaveLength(3)
    expect(result[0].id).toBe("addr-001") // default first
    expect(mockPrisma.customerAddress.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { customerId: "cust-001" },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      }),
    )
  })
})

// ─────────────────────────────────────────────────────────────
// createAddress
// ─────────────────────────────────────────────────────────────

describe("createAddress", () => {
  it("first address auto-sets as default", async () => {
    mockPrisma.customerAddress.count.mockResolvedValue(0)
    mockTx.customerAddress.updateMany.mockResolvedValue({ count: 0 })
    mockTx.customerAddress.create.mockResolvedValue(
      makeAddress({ building: "B", roomNumber: "202", isDefault: true }),
    )

    const result = await createAddress("cust-001", {
      building: "B",
      roomNumber: "202",
    })

    expect(result.isDefault).toBe(true)
    // Should have used a transaction
    expect(mockPrisma.$transaction).toHaveBeenCalled()
    // Should have unset all existing defaults first
    expect(mockTx.customerAddress.updateMany).toHaveBeenCalledWith({
      where: { customerId: "cust-001", isDefault: true },
      data: { isDefault: false },
    })
  })

  it("when isDefault=true, unsets other addresses' defaults (transaction)", async () => {
    mockPrisma.customerAddress.count.mockResolvedValue(3) // already has addresses
    mockTx.customerAddress.updateMany.mockResolvedValue({ count: 2 })
    mockTx.customerAddress.create.mockResolvedValue(
      makeAddress({ id: "addr-new", building: "C", isDefault: true }),
    )

    const result = await createAddress("cust-001", {
      building: "C",
      roomNumber: "303",
      isDefault: true,
    })

    expect(result.isDefault).toBe(true)
    expect(mockPrisma.$transaction).toHaveBeenCalled()
    expect(mockTx.customerAddress.updateMany).toHaveBeenCalledWith({
      where: { customerId: "cust-001", isDefault: true },
      data: { isDefault: false },
    })
  })

  it("subsequent addresses with isDefault=false do not change others", async () => {
    mockPrisma.customerAddress.count.mockResolvedValue(2)
    mockPrisma.customerAddress.create.mockResolvedValue(
      makeAddress({ id: "addr-new", building: "D", isDefault: false }),
    )

    const result = await createAddress("cust-001", {
      building: "D",
      roomNumber: "404",
      isDefault: false,
    })

    expect(result.isDefault).toBe(false)
    // No transaction — direct create
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
    expect(mockPrisma.customerAddress.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        building: "D",
        isDefault: false,
      }),
    })
  })
})

// ─────────────────────────────────────────────────────────────
// updateAddress
// ─────────────────────────────────────────────────────────────

describe("updateAddress", () => {
  it("updates address fields after ownership validation", async () => {
    mockPrisma.customerAddress.findUnique.mockResolvedValue(
      makeAddress({ id: "addr-001", customerId: "cust-001" }),
    )
    mockPrisma.customerAddress.update.mockResolvedValue(
      makeAddress({ building: "B", roomNumber: "999" }),
    )

    const result = await updateAddress("addr-001", "cust-001", {
      building: "B",
      roomNumber: "999",
    })

    expect(result.building).toBe("B")
    expect(result.roomNumber).toBe("999")
  })

  it("throws 404 for wrong customer (ownership check)", async () => {
    mockPrisma.customerAddress.findUnique.mockResolvedValue(
      makeAddress({ id: "addr-001", customerId: "cust-OTHER" }),
    )

    try {
      await updateAddress("addr-001", "cust-001", { building: "B" })
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(404)
    }
  })
})

// ─────────────────────────────────────────────────────────────
// deleteAddress
// ─────────────────────────────────────────────────────────────

describe("deleteAddress", () => {
  it("throws 404 for wrong customer", async () => {
    mockPrisma.customerAddress.findUnique.mockResolvedValue(
      makeAddress({ id: "addr-001", customerId: "cust-OTHER" }),
    )

    try {
      await deleteAddress("addr-001", "cust-001")
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(404)
    }
  })

  it("when deleted address was default, promotes oldest remaining to default", async () => {
    mockPrisma.customerAddress.findUnique.mockResolvedValue(
      makeAddress({ id: "addr-001", isDefault: true }),
    )
    mockTx.customerAddress.delete.mockResolvedValue(undefined)
    mockTx.customerAddress.findFirst.mockResolvedValue(
      makeAddress({ id: "addr-002", isDefault: false, createdAt: new Date("2025-01-02") }),
    )
    mockTx.customerAddress.update.mockResolvedValue(
      makeAddress({ id: "addr-002", isDefault: true }),
    )

    const result = await deleteAddress("addr-001", "cust-001")

    expect(result).toEqual({ id: "addr-001" })
    expect(mockPrisma.$transaction).toHaveBeenCalled()
    // Find oldest remaining
    expect(mockTx.customerAddress.findFirst).toHaveBeenCalledWith({
      where: { customerId: "cust-001" },
      orderBy: { createdAt: "asc" },
    })
    // Promote it
    expect(mockTx.customerAddress.update).toHaveBeenCalledWith({
      where: { id: "addr-002" },
      data: { isDefault: true },
    })
  })

  it("does not promote when no remaining addresses exist", async () => {
    mockPrisma.customerAddress.findUnique.mockResolvedValue(
      makeAddress({ id: "addr-001", isDefault: true }),
    )
    mockTx.customerAddress.delete.mockResolvedValue(undefined)
    mockTx.customerAddress.findFirst.mockResolvedValue(null) // no remaining

    await deleteAddress("addr-001", "cust-001")

    // Should not attempt to update since no oldest exists
    expect(mockTx.customerAddress.update).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────
// setDefaultAddress
// ─────────────────────────────────────────────────────────────

describe("setDefaultAddress", () => {
  it("unsets all others and sets target as default (transaction)", async () => {
    mockPrisma.customerAddress.findUnique.mockResolvedValue(
      makeAddress({ id: "addr-002", customerId: "cust-001", isDefault: false }),
    )
    mockTx.customerAddress.updateMany.mockResolvedValue({ count: 1 })
    mockTx.customerAddress.update.mockResolvedValue(
      makeAddress({ id: "addr-002", isDefault: true }),
    )

    const result = await setDefaultAddress("addr-002", "cust-001")

    expect(result.isDefault).toBe(true)
    expect(mockPrisma.$transaction).toHaveBeenCalled()
    expect(mockTx.customerAddress.updateMany).toHaveBeenCalledWith({
      where: { customerId: "cust-001", isDefault: true },
      data: { isDefault: false },
    })
    expect(mockTx.customerAddress.update).toHaveBeenCalledWith({
      where: { id: "addr-002" },
      data: { isDefault: true },
    })
  })

  it("throws 404 for wrong customer", async () => {
    mockPrisma.customerAddress.findUnique.mockResolvedValue(
      makeAddress({ id: "addr-002", customerId: "cust-OTHER" }),
    )

    try {
      await setDefaultAddress("addr-002", "cust-001")
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(404)
    }
  })
})
