/**
 * Factory functions for creating mock Order, OrderItem, and
 * OrderStatusHistory objects.
 */

import { faker } from "@faker-js/faker/locale/th"

// ── Types ──────────────────────────────────────────────────────

export interface MockOrderItemOption {
  id: string
  orderItemId: string
  optionName: string
  additionalPrice: number
}

export interface MockOrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
  createdAt: Date
  product: { id: string; name: string }
  options: MockOrderItemOption[]
}

export interface MockOrderStatusHistory {
  id: string
  orderId: string
  fromStatus: string | null
  toStatus: string
  changedBy: string | null
  reason: string | null
  createdAt: Date
}

export interface MockOrderCustomer {
  id: string
  lineUserId: string
  displayName: string
}

export interface MockOrder {
  id: string
  customerId: string
  orderNumber: string
  addressId: string | null
  subtotal: number
  total: number
  orderStatus: string
  paymentStatus: string
  note: string | null
  createdAt: Date
  updatedAt: Date
  customer: MockOrderCustomer
  items: MockOrderItem[]
  statusHistory: MockOrderStatusHistory[]
  payment: unknown | null
  notifications: unknown[]
}

// ── Factories ──────────────────────────────────────────────────

/**
 * Create a mock OrderItem object with sensible defaults.
 */
export function createMockOrderItem(
  overrides: Partial<MockOrderItem> = {},
): MockOrderItem {
  const orderId = faker.string.uuid()
  const productId = faker.string.uuid()

  return {
    id: faker.string.uuid(),
    orderId,
    productId,
    productName: faker.commerce.productName(),
    quantity: 1,
    unitPrice: 25,
    subtotal: 25,
    createdAt: new Date(),
    product: {
      id: productId,
      name: faker.commerce.productName(),
    },
    options: [],
    ...overrides,
  }
}

/**
 * Create a mock OrderStatusHistory object with sensible defaults.
 */
export function createMockOrderStatusHistory(
  overrides: Partial<MockOrderStatusHistory> = {},
): MockOrderStatusHistory {
  const orderId = faker.string.uuid()

  return {
    id: faker.string.uuid(),
    orderId,
    fromStatus: null,
    toStatus: "PENDING",
    changedBy: null,
    reason: null,
    createdAt: new Date(),
    ...overrides,
  }
}

/**
 * Create a mock Order object with sensible defaults.
 */
export function createMockOrder(
  overrides: Partial<MockOrder> = {},
): MockOrder {
  const customerId = faker.string.uuid()

  return {
    id: faker.string.uuid(),
    customerId,
    orderNumber: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${faker.string.numeric(6)}`,
    addressId: null,
    subtotal: 25,
    total: 25,
    orderStatus: "AWAITING_PAYMENT",
    paymentStatus: "UNPAID",
    note: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: {
      id: customerId,
      lineUserId: `U${faker.string.alphanumeric(32)}`,
      displayName: faker.person.firstName(),
    },
    items: [],
    statusHistory: [],
    payment: null,
    notifications: [],
    ...overrides,
  }
}

/**
 * Create a fully-populated mock Order with items and status history.
 *
 * Optionally pass `itemOverrides` (array of per-item overrides) and/or
 * `statusOverrides` (array of per-status overrides) to customise the
 * nested objects.
 */
export function createMockOrderWithDetails(
  overrides: Partial<MockOrder> & {
    itemOverrides?: Partial<MockOrderItem>[]
    statusOverrides?: Partial<MockOrderStatusHistory>[]
  } = {},
): MockOrder {
  const { itemOverrides, statusOverrides, ...orderOverrides } = overrides

  const order = createMockOrder({
    ...orderOverrides,
  })

  const items = (itemOverrides ?? [{}]).map((itemOverride) =>
    createMockOrderItem({ orderId: order.id, ...itemOverride }),
  )

  const statusHistory = (statusOverrides ?? [
    { toStatus: "PENDING" },
  ]).map((statusOverride) =>
    createMockOrderStatusHistory({ orderId: order.id, ...statusOverride }),
  )

  return {
    ...order,
    items,
    statusHistory,
  }
}
