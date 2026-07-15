import { describe, it, expect, vi, beforeEach } from "vitest"

// ─────────────────────────────────────────────────────────────
// Mock setup (hoisted — must be defined before vi.mock factory runs)
// ─────────────────────────────────────────────────────────────

const {
  mockOrderRepo,
  mockOrderStatusHistoryRepo,
  mockSettingRepo,
  mockTx,
  mockPrisma,
  MockOrderRepository,
  MockOrderStatusHistoryRepository,
  MockSettingRepository,
} = vi.hoisted(() => {
  const tx = {
    payment: {
      update: vi.fn(),
    },
    order: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    orderStatusHistory: {
      create: vi.fn(),
    },
  }

  const prisma = {
    $transaction: vi.fn().mockImplementation((fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
    setting: {
      findUnique: vi.fn(),
    },
    payment: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    order: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    orderStatusHistory: {
      create: vi.fn(),
    },
  }

  const orderRepo = {
    findById: vi.fn(),
    findByIdWithDetails: vi.fn(),
  }
  const orderStatusHistoryRepo = {
    create: vi.fn(),
    findByOrderId: vi.fn(),
    findLatestByOrderId: vi.fn(),
  }
  const settingRepo = {
    findByKey: vi.fn(),
  }

  return {
    mockOrderRepo: orderRepo,
    mockOrderStatusHistoryRepo: orderStatusHistoryRepo,
    mockSettingRepo: settingRepo,
    mockTx: tx,
    mockPrisma: prisma,
    MockOrderRepository: vi.fn(function () { return orderRepo }),
    MockOrderStatusHistoryRepository: vi.fn(function () { return orderStatusHistoryRepo }),
    MockSettingRepository: vi.fn(function () { return settingRepo }),
  }
})

vi.mock("@/database/client.js", () => ({
  prisma: mockPrisma,
}))

vi.mock("@/database/repositories/order.repository.js", () => ({
  OrderRepository: MockOrderRepository,
}))

vi.mock("@/database/repositories/order-status-history.repository.js", () => ({
  OrderStatusHistoryRepository: MockOrderStatusHistoryRepository,
}))

vi.mock("@/database/repositories/setting.repository.js", () => ({
  SettingRepository: MockSettingRepository,
}))

// Imports
import { AppError, ErrorCode } from "@/common/errors.js"
import {
  createPayment,
  getPaymentByOrderId,
  confirmPayment,
  verifyPayment,
  rejectPayment,
} from "@/modules/payments/payments.service.js"

// ─────────────────────────────────────────────────────────────
// Setup / Helpers
// ─────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
})

function makeOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: "order-001",
    orderNumber: "ORD-20250601-000001",
    customerId: "cust-001",
    addressId: null,
    subtotal: 300,
    total: 300,
    orderStatus: "AWAITING_PAYMENT",
    paymentStatus: "UNPAID",
    note: null,
    createdAt: new Date("2025-06-01T12:00:00.000Z"),
    updatedAt: new Date("2025-06-01T12:00:00.000Z"),
    ...overrides,
  }
}

function makeOrderWithDetails(overrides: Record<string, unknown> = {}) {
  return {
    id: "order-001",
    orderNumber: "ORD-20250601-000001",
    orderStatus: "AWAITING_PAYMENT",
    items: [
      {
        productName: "Product A",
        quantity: 2,
        unitPrice: 150,
      },
    ],
    ...overrides,
  }
}

function makePayment(overrides: Record<string, unknown> = {}) {
  return {
    id: "pay-001",
    orderId: "order-001",
    method: "PROMPTPAY",
    amount: 300,
    paymentStatus: "PENDING",
    slipImage: null,
    paidAt: null,
    verifiedAt: null,
    verifiedBy: null,
    rejectReason: null,
    createdAt: new Date("2025-06-01T12:00:00.000Z"),
    updatedAt: new Date("2025-06-01T12:00:00.000Z"),
    ...overrides,
  }
}

// ─────────────────────────────────────────────────────────────
// createPayment
// ─────────────────────────────────────────────────────────────

describe("createPayment", () => {
  it("should throw 404 when order not found", async () => {
    mockOrderRepo.findById.mockResolvedValue(null)

    await expect(
      createPayment("cust-001", { orderId: "order-001" }),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: ErrorCode.ORDER_NOT_FOUND,
    })
  })

  it("should throw 404 when order belongs to different customer", async () => {
    mockOrderRepo.findById.mockResolvedValue(
      makeOrder({ customerId: "cust-other" }),
    )

    await expect(
      createPayment("cust-001", { orderId: "order-001" }),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: ErrorCode.ORDER_NOT_FOUND,
    })
  })

  it("should throw 400 when order status is not AWAITING_PAYMENT", async () => {
    mockOrderRepo.findById.mockResolvedValue(
      makeOrder({ orderStatus: "PAID" }),
    )

    await expect(
      createPayment("cust-001", { orderId: "order-001" }),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: ErrorCode.INVALID_STATUS_TRANSITION,
    })
  })

  it("should throw 409 when payment already exists for the order", async () => {
    mockOrderRepo.findById.mockResolvedValue(makeOrder())
    mockPrisma.payment.findUnique.mockResolvedValue(makePayment())

    await expect(
      createPayment("cust-001", { orderId: "order-001" }),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: ErrorCode.CONFLICT,
    })
  })

  it("should create PENDING payment with correct amount from order total", async () => {
    mockOrderRepo.findById.mockResolvedValue(makeOrder({ total: 450 }))
    mockPrisma.payment.findUnique.mockResolvedValue(null) // no existing payment
    mockPrisma.payment.create.mockResolvedValue(
      makePayment({ amount: 450 }),
    )
    mockOrderRepo.findByIdWithDetails.mockResolvedValue(makeOrderWithDetails())
    mockSettingRepo.findByKey.mockResolvedValue(null)

    const result = await createPayment("cust-001", { orderId: "order-001" })

    expect(mockPrisma.payment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: "order-001",
          method: "PROMPTPAY",
          amount: 450,
          paymentStatus: "PENDING",
        }),
      }),
    )
    expect(result.paymentStatus).toBe("PENDING")
    expect(result.amount).toBe("450")
  })

  it("should return PromptPay details from settings", async () => {
    mockOrderRepo.findById.mockResolvedValue(makeOrder())
    mockPrisma.payment.findUnique.mockResolvedValue(null)
    mockPrisma.payment.create.mockResolvedValue(makePayment())
    mockOrderRepo.findByIdWithDetails.mockResolvedValue(makeOrderWithDetails())

    mockSettingRepo.findByKey.mockImplementation(async (key: string) => {
      if (key === "payment.promptpay.number") return { key, value: "0812345678" }
      if (key === "payment.promptpay.qrcode") return { key, value: "https://qr.example.com/123" }
      return null
    })

    const result = await createPayment("cust-001", { orderId: "order-001" })

    expect(result.promptPayNumber).toBe("0812345678")
    expect(result.promptPayQrUrl).toBe("https://qr.example.com/123")
  })
})

// ─────────────────────────────────────────────────────────────
// getPaymentByOrderId
// ─────────────────────────────────────────────────────────────

describe("getPaymentByOrderId", () => {
  it("should throw 404 when order not found or wrong customer", async () => {
    mockOrderRepo.findById.mockResolvedValue(null)

    await expect(
      getPaymentByOrderId("order-001", "cust-001"),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: ErrorCode.ORDER_NOT_FOUND,
    })
  })

  it("should throw 404 when payment not found", async () => {
    mockOrderRepo.findById.mockResolvedValue(makeOrder())
    mockPrisma.payment.findUnique.mockResolvedValue(null)

    await expect(
      getPaymentByOrderId("order-001", "cust-001"),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: ErrorCode.PAYMENT_NOT_FOUND,
    })
  })

  it("should transition to EXPIRED atomically when PENDING payment is expired (lazy expiry)", async () => {
    // Payment created 600 seconds ago, timeout is 300 seconds
    const expiredPayment = makePayment({
      id: "pay-expired",
      paymentStatus: "PENDING",
      createdAt: new Date(Date.now() - 600_000), // 10 minutes ago
    })
    mockOrderRepo.findById.mockResolvedValue(makeOrder({ orderStatus: "AWAITING_PAYMENT" }))
    mockPrisma.payment.findUnique
      .mockResolvedValueOnce(expiredPayment) // first call: get payment
      .mockResolvedValueOnce(makePayment({ id: "pay-expired", paymentStatus: "EXPIRED" })) // re-fetch after expiry

    // Mock setting for payment timeout
    mockSettingRepo.findByKey.mockResolvedValue({ key: "payment.timeout", value: "300" })

    // Transaction mocks
    mockTx.payment.update.mockResolvedValue(expiredPayment)
    mockTx.order.update.mockResolvedValue(makeOrder())
    mockTx.orderStatusHistory.create.mockResolvedValue({ id: "osh-001" })

    mockOrderRepo.findByIdWithDetails.mockResolvedValue(makeOrderWithDetails())

    const result = await getPaymentByOrderId("order-001", "cust-001")

    expect(mockTx.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "pay-expired" },
        data: { paymentStatus: "EXPIRED" },
      }),
    )
  })

  it("should update order status to EXPIRED during lazy expiry", async () => {
    const expiredPayment = makePayment({
      id: "pay-expired",
      paymentStatus: "PENDING",
      createdAt: new Date(Date.now() - 600_000),
    })
    mockOrderRepo.findById.mockResolvedValue(makeOrder({ orderStatus: "AWAITING_PAYMENT" }))
    mockPrisma.payment.findUnique
      .mockResolvedValueOnce(expiredPayment)
      .mockResolvedValueOnce(makePayment({ id: "pay-expired", paymentStatus: "EXPIRED" }))

    mockSettingRepo.findByKey.mockResolvedValue({ key: "payment.timeout", value: "300" })

    mockTx.payment.update.mockResolvedValue(expiredPayment)
    mockTx.order.update.mockResolvedValue(makeOrder())
    mockTx.orderStatusHistory.create.mockResolvedValue({ id: "osh-001" })

    mockOrderRepo.findByIdWithDetails.mockResolvedValue(makeOrderWithDetails())

    await getPaymentByOrderId("order-001", "cust-001")

    expect(mockTx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "order-001" },
        data: { orderStatus: "EXPIRED" },
      }),
    )
  })

  it("should create OrderStatusHistory during lazy expiry", async () => {
    const expiredPayment = makePayment({
      id: "pay-expired",
      paymentStatus: "PENDING",
      createdAt: new Date(Date.now() - 600_000),
    })
    mockOrderRepo.findById.mockResolvedValue(makeOrder({ orderStatus: "AWAITING_PAYMENT" }))
    mockPrisma.payment.findUnique
      .mockResolvedValueOnce(expiredPayment)
      .mockResolvedValueOnce(makePayment({ id: "pay-expired", paymentStatus: "EXPIRED" }))

    mockSettingRepo.findByKey.mockResolvedValue({ key: "payment.timeout", value: "300" })

    mockTx.payment.update.mockResolvedValue(expiredPayment)
    mockTx.order.update.mockResolvedValue(makeOrder())
    mockTx.orderStatusHistory.create.mockResolvedValue({ id: "osh-001" })

    mockOrderRepo.findByIdWithDetails.mockResolvedValue(makeOrderWithDetails())

    await getPaymentByOrderId("order-001", "cust-001")

    expect(mockTx.orderStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: "order-001",
          fromStatus: "AWAITING_PAYMENT",
          toStatus: "EXPIRED",
          reason: "Payment timed out",
        }),
      }),
    )
  })

  it("should return payment when not expired", async () => {
    // Payment created 60 seconds ago, timeout is 300 seconds
    const activePayment = makePayment({
      paymentStatus: "PENDING",
      createdAt: new Date(Date.now() - 60_000),
    })
    mockOrderRepo.findById.mockResolvedValue(makeOrder())
    mockPrisma.payment.findUnique.mockResolvedValue(activePayment)
    mockSettingRepo.findByKey.mockResolvedValue({ key: "payment.timeout", value: "300" })
    mockOrderRepo.findByIdWithDetails.mockResolvedValue(makeOrderWithDetails())

    const result = await getPaymentByOrderId("order-001", "cust-001")

    // Should NOT have called $transaction for expiry
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
    expect(result.paymentStatus).toBe("PENDING")
    expect(result.id).toBe("pay-001")
  })
})

// ─────────────────────────────────────────────────────────────
// confirmPayment
// ─────────────────────────────────────────────────────────────

describe("confirmPayment", () => {
  it("should throw 404 when payment not found", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue(null)

    await expect(
      confirmPayment("pay-001", "cust-001"),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: ErrorCode.PAYMENT_NOT_FOUND,
    })
  })

  it("should throw 404 when order belongs to different customer", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue(
      makePayment({ orderId: "order-001" }),
    )
    mockOrderRepo.findById.mockResolvedValue(
      makeOrder({ customerId: "cust-other" }),
    )

    await expect(
      confirmPayment("pay-001", "cust-001"),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: ErrorCode.PAYMENT_NOT_FOUND,
    })
  })

  it("should transition PENDING to AWAITING_VERIFICATION", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue(
      makePayment({ paymentStatus: "PENDING" }),
    )
    mockOrderRepo.findById.mockResolvedValue(makeOrder())
    mockPrisma.payment.update.mockResolvedValue(
      makePayment({ paymentStatus: "AWAITING_VERIFICATION" }),
    )

    const result = await confirmPayment("pay-001", "cust-001")

    expect(mockPrisma.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "pay-001" },
        data: { paymentStatus: "AWAITING_VERIFICATION" },
      }),
    )
    expect(result.paymentStatus).toBe("AWAITING_VERIFICATION")
  })

  it("should return as-is when already AWAITING_VERIFICATION (idempotent)", async () => {
    const payment = makePayment({ paymentStatus: "AWAITING_VERIFICATION" })
    mockPrisma.payment.findUnique.mockResolvedValue(payment)
    mockOrderRepo.findById.mockResolvedValue(makeOrder())

    const result = await confirmPayment("pay-001", "cust-001")

    expect(mockPrisma.payment.update).not.toHaveBeenCalled()
    expect(result.paymentStatus).toBe("AWAITING_VERIFICATION")
  })

  it("should throw 400 for non-confirmable statuses", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue(
      makePayment({ paymentStatus: "PAID" }),
    )
    mockOrderRepo.findById.mockResolvedValue(makeOrder())

    await expect(
      confirmPayment("pay-001", "cust-001"),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: ErrorCode.INVALID_PAYMENT_STATUS,
    })
  })
})

// ─────────────────────────────────────────────────────────────
// verifyPayment
// ─────────────────────────────────────────────────────────────

describe("verifyPayment", () => {
  it("should throw 404 when payment not found", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue(null)

    await expect(
      verifyPayment("pay-001", "staff-001"),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: ErrorCode.PAYMENT_NOT_FOUND,
    })
  })

  it("should throw 400 when payment status is not AWAITING_VERIFICATION", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue(
      makePayment({ paymentStatus: "PENDING" }),
    )

    await expect(
      verifyPayment("pay-001", "staff-001"),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: ErrorCode.INVALID_PAYMENT_STATUS,
    })
  })

  it("should transition paymentStatus to PAID", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue(
      makePayment({ paymentStatus: "AWAITING_VERIFICATION", orderId: "order-001" }),
    )

    const now = new Date()
    vi.useFakeTimers()
    vi.setSystemTime(now)

    try {
      mockTx.payment.update.mockResolvedValue(makePayment({ paymentStatus: "PAID" }))
      mockTx.order.findUnique.mockResolvedValue(
        makeOrder({ orderStatus: "AWAITING_VERIFICATION" }),
      )
      mockTx.order.update.mockResolvedValue(makeOrder())
      mockTx.orderStatusHistory.create.mockResolvedValue({ id: "osh-001" })
      mockPrisma.payment.findUnique
        .mockResolvedValueOnce(makePayment({ paymentStatus: "AWAITING_VERIFICATION", orderId: "order-001" }))
        .mockResolvedValueOnce(makePayment({
          id: "pay-001",
          paymentStatus: "PAID",
          paidAt: now,
          verifiedAt: now,
          verifiedBy: "staff-001",
        }))

      const result = await verifyPayment("pay-001", "staff-001")

      expect(mockTx.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "pay-001" },
          data: expect.objectContaining({
            paymentStatus: "PAID",
          }),
        }),
      )
      expect(result.paymentStatus).toBe("PAID")
    } finally {
      vi.useRealTimers()
    }
  })

  it("should update orderStatus to PAID and paymentStatus to PAID", async () => {
    mockPrisma.payment.findUnique
      .mockResolvedValueOnce(makePayment({ paymentStatus: "AWAITING_VERIFICATION", orderId: "order-001" }))
      .mockResolvedValueOnce(makePayment({ paymentStatus: "PAID" }))

    mockTx.payment.update.mockResolvedValue(makePayment({ paymentStatus: "PAID" }))
    mockTx.order.findUnique.mockResolvedValue(
      makeOrder({ orderStatus: "AWAITING_VERIFICATION" }),
    )
    mockTx.order.update.mockResolvedValue(makeOrder())
    mockTx.orderStatusHistory.create.mockResolvedValue({ id: "osh-001" })

    await verifyPayment("pay-001", "staff-001")

    expect(mockTx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "order-001" },
        data: expect.objectContaining({
          orderStatus: "PAID",
          paymentStatus: "PAID",
        }),
      }),
    )
  })

  it("should create OrderStatusHistory entry", async () => {
    mockPrisma.payment.findUnique
      .mockResolvedValueOnce(makePayment({ paymentStatus: "AWAITING_VERIFICATION", orderId: "order-001" }))
      .mockResolvedValueOnce(makePayment({ paymentStatus: "PAID" }))

    mockTx.payment.update.mockResolvedValue(makePayment({ paymentStatus: "PAID" }))
    mockTx.order.findUnique.mockResolvedValue(
      makeOrder({ orderStatus: "AWAITING_VERIFICATION" }),
    )
    mockTx.order.update.mockResolvedValue(makeOrder())
    mockTx.orderStatusHistory.create.mockResolvedValue({ id: "osh-001" })

    await verifyPayment("pay-001", "staff-001")

    expect(mockTx.orderStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: "order-001",
          fromStatus: "AWAITING_VERIFICATION",
          toStatus: "PAID",
          changedBy: "staff-001",
        }),
      }),
    )
  })

  it("should set paidAt, verifiedAt, and verifiedBy", async () => {
    const now = new Date("2025-06-01T12:00:00.000Z")

    mockPrisma.payment.findUnique
      .mockResolvedValueOnce(makePayment({ paymentStatus: "AWAITING_VERIFICATION", orderId: "order-001" }))
      .mockResolvedValueOnce(makePayment({
        id: "pay-001",
        paymentStatus: "PAID",
        paidAt: now,
        verifiedAt: now,
        verifiedBy: "staff-001",
      }))

    vi.useFakeTimers()
    vi.setSystemTime(now)

    try {
      mockTx.payment.update.mockResolvedValue(makePayment({ paymentStatus: "PAID" }))
      mockTx.order.findUnique.mockResolvedValue(
        makeOrder({ orderStatus: "AWAITING_VERIFICATION" }),
      )
      mockTx.order.update.mockResolvedValue(makeOrder())
      mockTx.orderStatusHistory.create.mockResolvedValue({ id: "osh-001" })

      const result = await verifyPayment("pay-001", "staff-001")

      expect(mockTx.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            paidAt: now,
            verifiedAt: now,
            verifiedBy: "staff-001",
          }),
        }),
      )
      expect(result.paidAt).toBe(now.toISOString())
      expect(result.verifiedAt).toBe(now.toISOString())
      expect(result.verifiedBy).toBe("staff-001")
    } finally {
      vi.useRealTimers()
    }
  })
})

// ─────────────────────────────────────────────────────────────
// rejectPayment
// ─────────────────────────────────────────────────────────────

describe("rejectPayment", () => {
  it("should throw 404 when payment not found", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue(null)

    await expect(
      rejectPayment("pay-001", { reason: "Invalid slip" }),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: ErrorCode.PAYMENT_NOT_FOUND,
    })
  })

  it("should throw 400 when payment status is not AWAITING_VERIFICATION", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue(
      makePayment({ paymentStatus: "PENDING" }),
    )

    await expect(
      rejectPayment("pay-001", { reason: "Invalid slip" }),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: ErrorCode.INVALID_PAYMENT_STATUS,
    })
  })

  it("should transition paymentStatus to REJECTED with rejectReason", async () => {
    mockPrisma.payment.findUnique
      .mockResolvedValueOnce(makePayment({ paymentStatus: "AWAITING_VERIFICATION", orderId: "order-001" }))
      .mockResolvedValueOnce(makePayment({
        id: "pay-001",
        paymentStatus: "REJECTED",
        rejectReason: "Slip is not clear",
      }))

    mockTx.payment.update.mockResolvedValue(
      makePayment({ paymentStatus: "REJECTED", rejectReason: "Slip is not clear" }),
    )
    mockTx.order.findUnique.mockResolvedValue(
      makeOrder({ orderStatus: "AWAITING_VERIFICATION" }),
    )
    mockTx.order.update.mockResolvedValue(makeOrder())
    mockTx.orderStatusHistory.create.mockResolvedValue({ id: "osh-001" })

    const result = await rejectPayment("pay-001", { reason: "Slip is not clear" })

    expect(mockTx.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "pay-001" },
        data: expect.objectContaining({
          paymentStatus: "REJECTED",
          rejectReason: "Slip is not clear",
        }),
      }),
    )
    expect(result.paymentStatus).toBe("REJECTED")
    expect(result.rejectReason).toBe("Slip is not clear")
  })

  it("should update orderStatus to PAYMENT_REJECTED", async () => {
    mockPrisma.payment.findUnique
      .mockResolvedValueOnce(makePayment({ paymentStatus: "AWAITING_VERIFICATION", orderId: "order-001" }))
      .mockResolvedValueOnce(makePayment({ paymentStatus: "REJECTED" }))

    mockTx.payment.update.mockResolvedValue(
      makePayment({ paymentStatus: "REJECTED" }),
    )
    mockTx.order.findUnique.mockResolvedValue(
      makeOrder({ orderStatus: "AWAITING_VERIFICATION" }),
    )
    mockTx.order.update.mockResolvedValue(makeOrder())
    mockTx.orderStatusHistory.create.mockResolvedValue({ id: "osh-001" })

    await rejectPayment("pay-001", { reason: "Wrong amount" })

    expect(mockTx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "order-001" },
        data: { orderStatus: "PAYMENT_REJECTED" },
      }),
    )
  })

  it("should create OrderStatusHistory entry", async () => {
    mockPrisma.payment.findUnique
      .mockResolvedValueOnce(makePayment({ paymentStatus: "AWAITING_VERIFICATION", orderId: "order-001" }))
      .mockResolvedValueOnce(makePayment({ paymentStatus: "REJECTED" }))

    mockTx.payment.update.mockResolvedValue(
      makePayment({ paymentStatus: "REJECTED" }),
    )
    mockTx.order.findUnique.mockResolvedValue(
      makeOrder({ orderStatus: "AWAITING_VERIFICATION" }),
    )
    mockTx.order.update.mockResolvedValue(makeOrder())
    mockTx.orderStatusHistory.create.mockResolvedValue({ id: "osh-001" })

    await rejectPayment("pay-001", { reason: "Wrong amount" })

    expect(mockTx.orderStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderId: "order-001",
          fromStatus: "AWAITING_VERIFICATION",
          toStatus: "PAYMENT_REJECTED",
          reason: "Wrong amount",
        }),
      }),
    )
  })
})
