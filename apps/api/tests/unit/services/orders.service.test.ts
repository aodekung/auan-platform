import { describe, it, expect, vi, beforeEach } from "vitest"

// ─────────────────────────────────────────────────────────────
// Mock setup (hoisted — must be defined before vi.mock factory runs)
// ─────────────────────────────────────────────────────────────

const {
  mockOrderRepo,
  mockOrderItemRepo,
  mockOrderStatusHistoryRepo,
  mockCartRepo,
  mockCartItemRepo,
  mockProductRepo,
  mockTx,
  mockPrisma,
  MockOrderRepository,
  MockOrderItemRepository,
  MockOrderStatusHistoryRepository,
  MockCartRepository,
  MockCartItemRepository,
  MockProductRepository,
} = vi.hoisted(() => {
  const tx = {
    order: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    orderItem: {
      create: vi.fn(),
    },
    orderItemOption: {
      createMany: vi.fn(),
    },
    orderStatusHistory: {
      create: vi.fn(),
    },
    cartItem: {
      deleteMany: vi.fn(),
    },
    cart: {
      delete: vi.fn(),
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
      create: vi.fn(),
      update: vi.fn(),
    },
    orderItem: {
      create: vi.fn(),
    },
    orderItemOption: {
      createMany: vi.fn(),
    },
    orderStatusHistory: {
      create: vi.fn(),
    },
    cartItem: {
      deleteMany: vi.fn(),
    },
    cart: {
      delete: vi.fn(),
    },
  }

  const orderRepo = {
    findById: vi.fn(),
    findByIdWithDetails: vi.fn(),
    findByOrderNumber: vi.fn(),
    findLastOrderOfToday: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findByCustomerIdPaginated: vi.fn(),
  }
  const orderItemRepo = {
    create: vi.fn(),
    createMany: vi.fn(),
    findByOrderId: vi.fn(),
    findById: vi.fn(),
  }
  const orderStatusHistoryRepo = {
    create: vi.fn(),
    findByOrderId: vi.fn(),
    findLatestByOrderId: vi.fn(),
  }
  const cartRepo = {
    findOrCreateByCustomerId: vi.fn(),
    findWithItems: vi.fn(),
    findByCustomerId: vi.fn(),
  }
  const cartItemRepo = {
    findExistingItem: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteAllByCartId: vi.fn(),
  }
  const productRepo = {
    findById: vi.fn(),
    findActive: vi.fn(),
  }

  return {
    mockOrderRepo: orderRepo,
    mockOrderItemRepo: orderItemRepo,
    mockOrderStatusHistoryRepo: orderStatusHistoryRepo,
    mockCartRepo: cartRepo,
    mockCartItemRepo: cartItemRepo,
    mockProductRepo: productRepo,
    mockTx: tx,
    mockPrisma: prisma,
    MockOrderRepository: vi.fn(function () { return orderRepo }),
    MockOrderItemRepository: vi.fn(function () { return orderItemRepo }),
    MockOrderStatusHistoryRepository: vi.fn(function () { return orderStatusHistoryRepo }),
    MockCartRepository: vi.fn(function () { return cartRepo }),
    MockCartItemRepository: vi.fn(function () { return cartItemRepo }),
    MockProductRepository: vi.fn(function () { return productRepo }),
  }
})

vi.mock("@/database/client.js", () => ({
  prisma: mockPrisma,
}))

vi.mock("@/database/repositories/order.repository.js", () => ({
  OrderRepository: MockOrderRepository,
}))

vi.mock("@/database/repositories/order-item.repository.js", () => ({
  OrderItemRepository: MockOrderItemRepository,
}))

vi.mock("@/database/repositories/order-status-history.repository.js", () => ({
  OrderStatusHistoryRepository: MockOrderStatusHistoryRepository,
}))

vi.mock("@/database/repositories/cart.repository.js", () => ({
  CartRepository: MockCartRepository,
}))

vi.mock("@/database/repositories/cart-item.repository.js", () => ({
  CartItemRepository: MockCartItemRepository,
}))

vi.mock("@/database/repositories/product.repository.js", () => ({
  ProductRepository: MockProductRepository,
}))

// Imports
import { AppError, ErrorCode } from "@/common/errors.js"
import {
  createOrder,
  listOrders,
  getOrder,
  cancelOrder,
  updateOrderStatus,
} from "@/modules/orders/orders.service.js"

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
    customerId: "cust-001",
    addressId: null,
    subtotal: 300,
    total: 300,
    orderStatus: "AWAITING_PAYMENT",
    paymentStatus: "UNPAID",
    note: null,
    createdAt: new Date("2025-06-01T12:00:00.000Z"),
    updatedAt: new Date("2025-06-01T12:00:00.000Z"),
    items: [
      {
        id: "oi-001",
        productId: "prod-001",
        productName: "Product A",
        quantity: 2,
        unitPrice: 150,
        subtotal: 300,
        options: [],
      },
    ],
    statusHistory: [
      {
        id: "osh-001",
        fromStatus: null,
        toStatus: "AWAITING_PAYMENT",
        reason: null,
        changedBy: null,
        createdAt: new Date("2025-06-01T12:00:00.000Z"),
      },
    ],
    ...overrides,
  }
}

function makeCartWithItems(overrides: Record<string, unknown> = {}) {
  return {
    id: "cart-001",
    customerId: "cust-001",
    updatedAt: new Date("2025-06-01T12:00:00.000Z"),
    items: [
      {
        id: "ci-001",
        productId: "prod-001",
        productName: "Product A",
        quantity: 2,
        unitPrice: 150,
        subtotal: 300,
        selectedOptions: [],
        note: null,
        product: {
          id: "prod-001",
          name: "Product A",
          imageUrl: null,
          price: 100,
          status: "ACTIVE",
          isAvailable: true,
        },
      },
    ],
    ...overrides,
  }
}

function makeProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: "prod-001",
    name: "Product A",
    price: 100,
    status: "ACTIVE",
    isAvailable: true,
    category: { id: "cat-001", name: "Category A" },
    ...overrides,
  }
}

// Helper to set up store-is-open defaults (all settings return "open" / false)
function setupStoreOpen() {
  // store.status
  mockPrisma.setting.findUnique.mockImplementation(async ({ where }: { where: { key: string } }) => {
    if (where.key === "store.status") {
      return { key: "store.status", value: "open" }
    }
    if (where.key === "business_hours.temporary_closure.enabled") {
      return { key: "business_hours.temporary_closure.enabled", value: "false" }
    }
    if (where.key?.startsWith("business_hours.")) {
      return null // no business hours set -> assume open
    }
    return null
  })
}

// ─────────────────────────────────────────────────────────────
// createOrder
// ─────────────────────────────────────────────────────────────

describe("createOrder", () => {
  it("should throw badRequest when store status is not open", async () => {
    mockPrisma.setting.findUnique.mockImplementation(async ({ where }: { where: { key: string } }) => {
      if (where.key === "store.status") {
        return { key: "store.status", value: "closed" }
      }
      return null
    })

    await expect(
      createOrder("cust-001", {}),
    ).rejects.toMatchObject({
      statusCode: 400,
    })
  })

  it("should throw badRequest when temporary closure is enabled and not expired", async () => {
    const futureDate = new Date(Date.now() + 3600_000).toISOString()
    mockPrisma.setting.findUnique.mockImplementation(async ({ where }: { where: { key: string } }) => {
      if (where.key === "store.status") return { key: "store.status", value: "open" }
      if (where.key === "business_hours.temporary_closure.enabled")
        return { key: "business_hours.temporary_closure.enabled", value: "true" }
      if (where.key === "business_hours.temporary_closure.end")
        return { key: "business_hours.temporary_closure.end", value: futureDate }
      return null
    })

    await expect(
      createOrder("cust-001", {}),
    ).rejects.toMatchObject({
      statusCode: 400,
    })
  })

  it("should throw badRequest when current time is outside business hours", async () => {
    const now = new Date()
    const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()

    mockPrisma.setting.findUnique.mockImplementation(async ({ where }: { where: { key: string } }) => {
      if (where.key === "store.status") return { key: "store.status", value: "open" }
      if (where.key === "business_hours.temporary_closure.enabled")
        return { key: "business_hours.temporary_closure.enabled", value: "false" }
      if (where.key === `business_hours.${dayOfWeek}.open`) return { key: where.key, value: "09:00" }
      if (where.key === `business_hours.${dayOfWeek}.close`) return { key: where.key, value: "17:00" }
      return null
    })

    // Mock Date to be at 02:00 (before 09:00)
    const realDate = globalThis.Date
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2025-06-01T02:00:00.000Z"))

    try {
      // Need to re-mock because the service reads dayOfWeek from new Date()
      mockPrisma.setting.findUnique.mockImplementation(async ({ where }: { where: { key: string } }) => {
        if (where.key === "store.status") return { key: "store.status", value: "open" }
        if (where.key === "business_hours.temporary_closure.enabled")
          return { key: "business_hours.temporary_closure.enabled", value: "false" }
        // Sunday
        if (where.key === "business_hours.sunday.open") return { key: where.key, value: "09:00" }
        if (where.key === "business_hours.sunday.close") return { key: where.key, value: "17:00" }
        return null
      })

      await expect(
        createOrder("cust-001", {}),
      ).rejects.toMatchObject({
        statusCode: 400,
      })
    } finally {
      vi.useRealTimers()
    }
  })

  it("should throw AppError(400, CART_EMPTY) when cart has no items", async () => {
    setupStoreOpen()
    mockCartRepo.findWithItems.mockResolvedValue(null)

    await expect(
      createOrder("cust-001", {}),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: ErrorCode.CART_EMPTY,
    })
  })

  it("should throw 400 when product status is not ACTIVE or isAvailable is false", async () => {
    setupStoreOpen()
    mockCartRepo.findWithItems.mockResolvedValue(
      makeCartWithItems({
        items: [
          {
            ...makeCartWithItems().items[0],
            productId: "prod-001",
          },
        ],
      }),
    )
    mockProductRepo.findById.mockResolvedValue(
      makeProduct({ status: "DISABLED" }),
    )

    await expect(
      createOrder("cust-001", {}),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: ErrorCode.PRODUCT_UNAVAILABLE,
    })
  })

  it("should throw 404 when product is deleted", async () => {
    setupStoreOpen()
    mockCartRepo.findWithItems.mockResolvedValue(makeCartWithItems())
    mockProductRepo.findById.mockResolvedValue(null)

    await expect(
      createOrder("cust-001", {}),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: ErrorCode.PRODUCT_NOT_FOUND,
    })
  })

  it("should create order with correct status AWAITING_PAYMENT and UNPAID", async () => {
    setupStoreOpen()
    mockCartRepo.findWithItems.mockResolvedValue(makeCartWithItems())
    mockProductRepo.findById.mockResolvedValue(makeProduct({ price: 100 }))
    mockOrderRepo.findLastOrderOfToday.mockResolvedValue(null)

    const createdOrder = makeOrder()
    mockTx.order.create.mockResolvedValue(createdOrder)
    mockTx.orderItem.create.mockResolvedValue({
      id: "oi-001",
      orderId: "order-001",
      productId: "prod-001",
      productName: "Product A",
      quantity: 2,
      unitPrice: 100,
      subtotal: 200,
    })
    mockTx.orderItemOption.createMany.mockResolvedValue({ count: 0 })
    mockTx.orderStatusHistory.create.mockResolvedValue({
      id: "osh-001",
      orderId: "order-001",
      fromStatus: null,
      toStatus: "AWAITING_PAYMENT",
      changedBy: null,
      reason: null,
    })
    mockTx.cartItem.deleteMany.mockResolvedValue({ count: 1 })
    mockTx.cart.delete.mockResolvedValue(createdOrder)
    mockTx.order.update.mockResolvedValue(createdOrder)
    mockTx.order.findUnique.mockResolvedValue(makeOrderWithDetails())

    const result = await createOrder("cust-001", {})

    expect(mockTx.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderStatus: "AWAITING_PAYMENT",
          paymentStatus: "UNPAID",
        }),
      }),
    )
    expect(result.orderStatus).toBe("AWAITING_PAYMENT")
    expect(result.paymentStatus).toBe("UNPAID")
  })

  it("should generate order number in format ORD-YYYYMMDD-XXXXXX", async () => {
    setupStoreOpen()
    mockCartRepo.findWithItems.mockResolvedValue(makeCartWithItems())
    mockProductRepo.findById.mockResolvedValue(makeProduct({ price: 100 }))
    mockOrderRepo.findLastOrderOfToday.mockResolvedValue(null)

    mockTx.order.create.mockResolvedValue(makeOrder())
    mockTx.orderItem.create.mockResolvedValue({
      id: "oi-001",
      orderId: "order-001",
      productId: "prod-001",
      productName: "Product A",
      quantity: 2,
      unitPrice: 100,
      subtotal: 200,
    })
    mockTx.orderItemOption.createMany.mockResolvedValue({ count: 0 })
    mockTx.orderStatusHistory.create.mockResolvedValue({
      id: "osh-001",
      orderId: "order-001",
      fromStatus: null,
      toStatus: "AWAITING_PAYMENT",
      changedBy: null,
      reason: null,
    })
    mockTx.cartItem.deleteMany.mockResolvedValue({ count: 1 })
    mockTx.cart.delete.mockResolvedValue(makeOrder())
    mockTx.order.update.mockResolvedValue(makeOrder())

    // Use fake timers to control the date
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2025-06-01T10:00:00.000Z"))

    try {
      mockTx.order.findUnique.mockResolvedValue(makeOrderWithDetails())

      await createOrder("cust-001", {})

      // The generated order number should match the date
      expect(mockTx.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orderNumber: expect.stringMatching(/^ORD-20250601-\d{6}$/),
          }),
        }),
      )
    } finally {
      vi.useRealTimers()
    }
  })

  it("should snapshot prices from DB not from cart", async () => {
    setupStoreOpen()
    // Cart has unitPrice 150 but DB product price is 100
    mockCartRepo.findWithItems.mockResolvedValue(
      makeCartWithItems({
        items: [
          {
            id: "ci-001",
            productId: "prod-001",
            productName: "Product A",
            quantity: 2,
            unitPrice: 150, // cart price (stale)
            subtotal: 300,
            selectedOptions: [],
            note: null,
          },
        ],
      }),
    )
    mockProductRepo.findById.mockResolvedValue(makeProduct({ price: 100 }))
    mockOrderRepo.findLastOrderOfToday.mockResolvedValue(null)

    mockTx.order.create.mockResolvedValue(makeOrder())
    mockTx.orderItem.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: "oi-001",
      ...data,
    }))
    mockTx.orderItemOption.createMany.mockResolvedValue({ count: 0 })
    mockTx.orderStatusHistory.create.mockResolvedValue({
      id: "osh-001",
      orderId: "order-001",
      fromStatus: null,
      toStatus: "AWAITING_PAYMENT",
      changedBy: null,
      reason: null,
    })
    mockTx.cartItem.deleteMany.mockResolvedValue({ count: 1 })
    mockTx.cart.delete.mockResolvedValue(makeOrder())
    mockTx.order.update.mockResolvedValue(makeOrder())
    mockTx.order.findUnique.mockResolvedValue(makeOrderWithDetails())

    await createOrder("cust-001", {})

    // unitPrice should be 100 (from DB), not 150 (from cart)
    expect(mockTx.orderItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          unitPrice: 100,
          subtotal: 200, // 100 * 2
        }),
      }),
    )
  })

  it("should create OrderStatusHistory entry", async () => {
    setupStoreOpen()
    mockCartRepo.findWithItems.mockResolvedValue(makeCartWithItems())
    mockProductRepo.findById.mockResolvedValue(makeProduct({ price: 100 }))
    mockOrderRepo.findLastOrderOfToday.mockResolvedValue(null)

    mockTx.order.create.mockResolvedValue(makeOrder())
    mockTx.orderItem.create.mockResolvedValue({
      id: "oi-001",
      orderId: "order-001",
      productId: "prod-001",
      productName: "Product A",
      quantity: 2,
      unitPrice: 100,
      subtotal: 200,
    })
    mockTx.orderItemOption.createMany.mockResolvedValue({ count: 0 })
    mockTx.orderStatusHistory.create.mockResolvedValue({
      id: "osh-001",
      orderId: "order-001",
    })
    mockTx.cartItem.deleteMany.mockResolvedValue({ count: 1 })
    mockTx.cart.delete.mockResolvedValue(makeOrder())
    mockTx.order.update.mockResolvedValue(makeOrder())
    mockTx.order.findUnique.mockResolvedValue(makeOrderWithDetails())

    await createOrder("cust-001", {})

    expect(mockTx.orderStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fromStatus: null,
          toStatus: "AWAITING_PAYMENT",
        }),
      }),
    )
  })

  it("should clear cart after order creation", async () => {
    setupStoreOpen()
    mockCartRepo.findWithItems.mockResolvedValue(makeCartWithItems())
    mockProductRepo.findById.mockResolvedValue(makeProduct({ price: 100 }))
    mockOrderRepo.findLastOrderOfToday.mockResolvedValue(null)

    mockTx.order.create.mockResolvedValue(makeOrder())
    mockTx.orderItem.create.mockResolvedValue({
      id: "oi-001",
      orderId: "order-001",
      productId: "prod-001",
      productName: "Product A",
      quantity: 2,
      unitPrice: 100,
      subtotal: 200,
    })
    mockTx.orderItemOption.createMany.mockResolvedValue({ count: 0 })
    mockTx.orderStatusHistory.create.mockResolvedValue({
      id: "osh-001",
      orderId: "order-001",
    })
    mockTx.cartItem.deleteMany.mockResolvedValue({ count: 1 })
    mockTx.cart.delete.mockResolvedValue(makeOrder())
    mockTx.order.update.mockResolvedValue(makeOrder())
    mockTx.order.findUnique.mockResolvedValue(makeOrderWithDetails())

    await createOrder("cust-001", {})

    expect(mockTx.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: "cart-001" } })
    expect(mockTx.cart.delete).toHaveBeenCalledWith({ where: { id: "cart-001" } })
  })

  it("should call prisma.$transaction", async () => {
    setupStoreOpen()
    mockCartRepo.findWithItems.mockResolvedValue(makeCartWithItems())
    mockProductRepo.findById.mockResolvedValue(makeProduct({ price: 100 }))
    mockOrderRepo.findLastOrderOfToday.mockResolvedValue(null)

    mockTx.order.create.mockResolvedValue(makeOrder())
    mockTx.orderItem.create.mockResolvedValue({
      id: "oi-001",
      orderId: "order-001",
    })
    mockTx.orderItemOption.createMany.mockResolvedValue({ count: 0 })
    mockTx.orderStatusHistory.create.mockResolvedValue({ id: "osh-001" })
    mockTx.cartItem.deleteMany.mockResolvedValue({ count: 1 })
    mockTx.cart.delete.mockResolvedValue(makeOrder())
    mockTx.order.update.mockResolvedValue(makeOrder())
    mockTx.order.findUnique.mockResolvedValue(makeOrderWithDetails())

    await createOrder("cust-001", {})

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1)
  })
})

// ─────────────────────────────────────────────────────────────
// listOrders
// ─────────────────────────────────────────────────────────────

describe("listOrders", () => {
  it("should return paginated orders", async () => {
    mockOrderRepo.findByCustomerIdPaginated.mockResolvedValue({
      orders: [
        makeOrder({
          id: "order-001",
          orderNumber: "ORD-20250601-000001",
          subtotal: 100,
          total: 100,
          createdAt: new Date("2025-06-01T10:00:00.000Z"),
          updatedAt: new Date("2025-06-01T10:00:00.000Z"),
          _count: { items: 2 },
        }),
      ],
      total: 1,
    })

    const result = await listOrders("cust-001", { page: 1, pageSize: 10 })

    expect(result.orders).toHaveLength(1)
    expect(result.total).toBe(1)
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(10)
  })

  it("should filter by status when provided", async () => {
    mockOrderRepo.findByCustomerIdPaginated.mockResolvedValue({
      orders: [],
      total: 0,
    })

    await listOrders("cust-001", { page: 1, pageSize: 10, status: "COMPLETED" })

    expect(mockOrderRepo.findByCustomerIdPaginated).toHaveBeenCalledWith(
      "cust-001",
      expect.objectContaining({ status: "COMPLETED" }),
    )
  })

  it("should calculate totalPages correctly", async () => {
    mockOrderRepo.findByCustomerIdPaginated.mockResolvedValue({
      orders: [],
      total: 25,
    })

    const result = await listOrders("cust-001", { page: 1, pageSize: 10 })

    // 25 / 10 = 2.5 -> ceil = 3
    expect(result.totalPages).toBe(3)
  })
})

// ─────────────────────────────────────────────────────────────
// getOrder
// ─────────────────────────────────────────────────────────────

describe("getOrder", () => {
  it("should return order with full details", async () => {
    const orderDetail = makeOrderWithDetails()
    mockOrderRepo.findByIdWithDetails.mockResolvedValue(orderDetail)

    const result = await getOrder("order-001", "cust-001")

    expect(result.id).toBe("order-001")
    expect(result.items).toHaveLength(1)
    expect(result.statusHistory).toHaveLength(1)
    expect(result.items[0].options).toEqual([])
  })

  it("should throw 404 when order not found", async () => {
    mockOrderRepo.findByIdWithDetails.mockResolvedValue(null)

    await expect(
      getOrder("nonexistent", "cust-001"),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: ErrorCode.ORDER_NOT_FOUND,
    })
  })

  it("should throw 404 when order belongs to different customer", async () => {
    mockOrderRepo.findByIdWithDetails.mockResolvedValue(
      makeOrderWithDetails({ customerId: "cust-other" }),
    )

    await expect(
      getOrder("order-001", "cust-001"),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: ErrorCode.ORDER_NOT_FOUND,
    })
  })
})

// ─────────────────────────────────────────────────────────────
// cancelOrder
// ─────────────────────────────────────────────────────────────

describe("cancelOrder", () => {
  it("should throw 404 when order not found", async () => {
    mockOrderRepo.findById.mockResolvedValue(null)

    await expect(
      cancelOrder("nonexistent", "cust-001"),
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
      cancelOrder("order-001", "cust-001"),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: ErrorCode.ORDER_NOT_FOUND,
    })
  })

  it("should throw 400 when status is not cancellable (PREPARING)", async () => {
    mockOrderRepo.findById.mockResolvedValue(
      makeOrder({ orderStatus: "PREPARING" }),
    )

    await expect(
      cancelOrder("order-001", "cust-001"),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: ErrorCode.INVALID_STATUS_TRANSITION,
    })
  })

  it("should throw 400 when status is not cancellable (COMPLETED)", async () => {
    mockOrderRepo.findById.mockResolvedValue(
      makeOrder({ orderStatus: "COMPLETED" }),
    )

    await expect(
      cancelOrder("order-001", "cust-001"),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: ErrorCode.INVALID_STATUS_TRANSITION,
    })
  })

  it("should succeed for PENDING status", async () => {
    mockOrderRepo.findById.mockResolvedValue(
      makeOrder({ orderStatus: "PENDING" }),
    )
    mockTx.order.update.mockResolvedValue(makeOrder())
    mockTx.orderStatusHistory.create.mockResolvedValue({
      id: "osh-cancel-001",
      orderId: "order-001",
      fromStatus: "PENDING",
      toStatus: "CANCELLED",
      changedBy: "cust-001",
      reason: null,
    })
    mockOrderRepo.findByIdWithDetails.mockResolvedValue(
      makeOrderWithDetails({ orderStatus: "CANCELLED" }),
    )

    const result = await cancelOrder("order-001", "cust-001")

    expect(mockTx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "order-001" },
        data: { orderStatus: "CANCELLED" },
      }),
    )
    expect(result.orderStatus).toBe("CANCELLED")
  })

  it("should succeed for AWAITING_PAYMENT status", async () => {
    mockOrderRepo.findById.mockResolvedValue(
      makeOrder({ orderStatus: "AWAITING_PAYMENT" }),
    )
    mockTx.order.update.mockResolvedValue(makeOrder())
    mockTx.orderStatusHistory.create.mockResolvedValue({
      id: "osh-cancel-002",
      orderId: "order-001",
    })
    mockOrderRepo.findByIdWithDetails.mockResolvedValue(
      makeOrderWithDetails({ orderStatus: "CANCELLED" }),
    )

    const result = await cancelOrder("order-001", "cust-001")

    expect(result.orderStatus).toBe("CANCELLED")
  })

  it("should succeed for PAID status with reason", async () => {
    mockOrderRepo.findById.mockResolvedValue(
      makeOrder({ orderStatus: "PAID" }),
    )
    mockTx.order.update.mockResolvedValue(makeOrder())
    mockTx.orderStatusHistory.create.mockResolvedValue({
      id: "osh-cancel-003",
      orderId: "order-001",
    })
    mockOrderRepo.findByIdWithDetails.mockResolvedValue(
      makeOrderWithDetails({ orderStatus: "CANCELLED" }),
    )

    const result = await cancelOrder("order-001", "cust-001", "Changed my mind")

    expect(mockTx.orderStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fromStatus: "PAID",
          toStatus: "CANCELLED",
          changedBy: "cust-001",
          reason: "Changed my mind",
        }),
      }),
    )
    expect(result.orderStatus).toBe("CANCELLED")
  })

  it("should create status history with fromStatus and toStatus CANCELLED", async () => {
    mockOrderRepo.findById.mockResolvedValue(
      makeOrder({ orderStatus: "AWAITING_VERIFICATION" }),
    )
    mockTx.order.update.mockResolvedValue(makeOrder())
    mockTx.orderStatusHistory.create.mockResolvedValue({
      id: "osh-cancel-004",
      orderId: "order-001",
    })
    mockOrderRepo.findByIdWithDetails.mockResolvedValue(
      makeOrderWithDetails({ orderStatus: "CANCELLED" }),
    )

    await cancelOrder("order-001", "cust-001")

    expect(mockTx.orderStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fromStatus: "AWAITING_VERIFICATION",
          toStatus: "CANCELLED",
        }),
      }),
    )
  })

  it("should call prisma.$transaction", async () => {
    mockOrderRepo.findById.mockResolvedValue(
      makeOrder({ orderStatus: "PENDING" }),
    )
    mockTx.order.update.mockResolvedValue(makeOrder())
    mockTx.orderStatusHistory.create.mockResolvedValue({
      id: "osh-cancel-005",
      orderId: "order-001",
    })
    mockOrderRepo.findByIdWithDetails.mockResolvedValue(
      makeOrderWithDetails({ orderStatus: "CANCELLED" }),
    )

    await cancelOrder("order-001", "cust-001")

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1)
  })
})

// ─────────────────────────────────────────────────────────────
// updateOrderStatus
// ─────────────────────────────────────────────────────────────

describe("updateOrderStatus", () => {
  it("should throw 404 when order not found", async () => {
    mockOrderRepo.findById.mockResolvedValue(null)

    await expect(
      updateOrderStatus("nonexistent", { status: "AWAITING_PAYMENT" }, "staff-001"),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: ErrorCode.ORDER_NOT_FOUND,
    })
  })

  it("should throw 400 for invalid transitions (PENDING -> PREPARING directly)", async () => {
    mockOrderRepo.findById.mockResolvedValue(
      makeOrder({ orderStatus: "PENDING" }),
    )

    await expect(
      updateOrderStatus("order-001", { status: "PREPARING" }, "staff-001"),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: ErrorCode.INVALID_STATUS_TRANSITION,
    })
  })

  it("should succeed for PENDING -> AWAITING_PAYMENT", async () => {
    mockOrderRepo.findById.mockResolvedValue(
      makeOrder({ orderStatus: "PENDING" }),
    )
    mockTx.order.update.mockResolvedValue(makeOrder())
    mockTx.orderStatusHistory.create.mockResolvedValue({ id: "osh-001" })
    mockOrderRepo.findByIdWithDetails.mockResolvedValue(
      makeOrderWithDetails({ orderStatus: "AWAITING_PAYMENT" }),
    )

    const result = await updateOrderStatus(
      "order-001",
      { status: "AWAITING_PAYMENT" },
      "staff-001",
    )

    expect(mockTx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { orderStatus: "AWAITING_PAYMENT" },
      }),
    )
    expect(result.orderStatus).toBe("AWAITING_PAYMENT")
  })

  it("should succeed for QUEUED -> PREPARING", async () => {
    mockOrderRepo.findById.mockResolvedValue(
      makeOrder({ orderStatus: "QUEUED" }),
    )
    mockTx.order.update.mockResolvedValue(makeOrder())
    mockTx.orderStatusHistory.create.mockResolvedValue({ id: "osh-001" })
    mockOrderRepo.findByIdWithDetails.mockResolvedValue(
      makeOrderWithDetails({ orderStatus: "PREPARING" }),
    )

    const result = await updateOrderStatus(
      "order-001",
      { status: "PREPARING" },
      "staff-001",
    )

    expect(result.orderStatus).toBe("PREPARING")
  })

  it("should succeed for DELIVERED -> COMPLETED", async () => {
    mockOrderRepo.findById.mockResolvedValue(
      makeOrder({ orderStatus: "DELIVERED" }),
    )
    mockTx.order.update.mockResolvedValue(makeOrder())
    mockTx.orderStatusHistory.create.mockResolvedValue({ id: "osh-001" })
    mockOrderRepo.findByIdWithDetails.mockResolvedValue(
      makeOrderWithDetails({ orderStatus: "COMPLETED" }),
    )

    const result = await updateOrderStatus(
      "order-001",
      { status: "COMPLETED" },
      "staff-001",
    )

    expect(result.orderStatus).toBe("COMPLETED")
  })

  it("should reject transitions from terminal state COMPLETED", async () => {
    mockOrderRepo.findById.mockResolvedValue(
      makeOrder({ orderStatus: "COMPLETED" }),
    )

    await expect(
      updateOrderStatus("order-001", { status: "PENDING" }, "staff-001"),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: ErrorCode.INVALID_STATUS_TRANSITION,
    })
  })

  it("should reject transitions from terminal state CANCELLED", async () => {
    mockOrderRepo.findById.mockResolvedValue(
      makeOrder({ orderStatus: "CANCELLED" }),
    )

    await expect(
      updateOrderStatus("order-001", { status: "PENDING" }, "staff-001"),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: ErrorCode.INVALID_STATUS_TRANSITION,
    })
  })

  it("should reject transitions from terminal state EXPIRED", async () => {
    mockOrderRepo.findById.mockResolvedValue(
      makeOrder({ orderStatus: "EXPIRED" }),
    )

    await expect(
      updateOrderStatus("order-001", { status: "AWAITING_PAYMENT" }, "staff-001"),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: ErrorCode.INVALID_STATUS_TRANSITION,
    })
  })

  it("should reject transitions from terminal state PAYMENT_REJECTED", async () => {
    mockOrderRepo.findById.mockResolvedValue(
      makeOrder({ orderStatus: "PAYMENT_REJECTED" }),
    )

    await expect(
      updateOrderStatus("order-001", { status: "AWAITING_PAYMENT" }, "staff-001"),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: ErrorCode.INVALID_STATUS_TRANSITION,
    })
  })

  it("should create status history entry", async () => {
    mockOrderRepo.findById.mockResolvedValue(
      makeOrder({ orderStatus: "PREPARING" }),
    )
    mockTx.order.update.mockResolvedValue(makeOrder())
    mockTx.orderStatusHistory.create.mockResolvedValue({ id: "osh-001" })
    mockOrderRepo.findByIdWithDetails.mockResolvedValue(
      makeOrderWithDetails({ orderStatus: "READY" }),
    )

    await updateOrderStatus("order-001", { status: "READY" }, "staff-001")

    expect(mockTx.orderStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fromStatus: "PREPARING",
          toStatus: "READY",
          changedBy: "staff-001",
        }),
      }),
    )
  })

  it("should call prisma.$transaction", async () => {
    mockOrderRepo.findById.mockResolvedValue(
      makeOrder({ orderStatus: "PREPARING" }),
    )
    mockTx.order.update.mockResolvedValue(makeOrder())
    mockTx.orderStatusHistory.create.mockResolvedValue({ id: "osh-001" })
    mockOrderRepo.findByIdWithDetails.mockResolvedValue(
      makeOrderWithDetails({ orderStatus: "READY" }),
    )

    await updateOrderStatus("order-001", { status: "READY" }, "staff-001")

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1)
  })
})
