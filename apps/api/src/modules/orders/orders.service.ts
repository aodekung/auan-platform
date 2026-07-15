/**
 * Orders Service — business logic for order management.
 *
 * Responsibilities:
 * - Create order from cart (with price snapshot, validation, atomic transaction)
 * - List customer orders (paginated, filterable)
 * - Get order detail (with items, options, status history)
 * - Cancel order (customer-initiated)
 * - Update order status (owner-initiated, state machine enforced)
 * - Business hours validation before order creation
 *
 * Per 60-architecture.md: business logic lives in services, NOT controllers.
 * Per 153-pricing-rules.md: backend ALWAYS recalculates from DB product prices.
 * Per 158-order-status.md: every status change MUST be logged in OrderStatusHistory.
 */

import type { Decimal } from "@prisma/client/runtime/library"
import type { Prisma } from "@prisma/client"

import { prisma } from "../../database/client.js"
import { AppError, ErrorCode, badRequest, notFound } from "../../common/errors.js"
import { CartItemRepository } from "../../database/repositories/cart-item.repository.js"
import { CartRepository } from "../../database/repositories/cart.repository.js"
import { OrderItemRepository } from "../../database/repositories/order-item.repository.js"
import { OrderRepository } from "../../database/repositories/order.repository.js"
import { OrderStatusHistoryRepository } from "../../database/repositories/order-status-history.repository.js"
import { ProductRepository } from "../../database/repositories/product.repository.js"
import { dispatchNotification } from "../notifications/notification.service.js"

import type {
  CreateOrderRequest,
  ListOrdersQuery,
  OrderItemOptionResponse,
  OrderItemResponse,
  OrderListItemResponse,
  OrderResponse,
  OrderStatusHistoryResponse,
  UpdateOrderStatusRequest,
} from "./orders.types.js"
import {
  ALLOWED_TRANSITIONS,
  CANCELLABLE_STATUSES,
} from "./orders.types.js"

// ─────────────────────────────────────────────────────────────
// Repository instances (singleton per module)
// ─────────────────────────────────────────────────────────────

const orderRepo = new OrderRepository()
const orderItemRepo = new OrderItemRepository()
const orderStatusHistoryRepo = new OrderStatusHistoryRepository()
const cartRepo = new CartRepository()
const cartItemRepo = new CartItemRepository()
const productRepo = new ProductRepository()

// ─────────────────────────────────────────────────────────────
// Mappers
// ─────────────────────────────────────────────────────────────

function mapOrderItemOption(option: {
  id: string
  optionName: string
  additionalPrice: Decimal | number
}): OrderItemOptionResponse {
  return {
    id: option.id,
    optionName: option.optionName,
    additionalPrice: option.additionalPrice.toString(),
  }
}

function mapOrderItem(item: {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: Decimal | number
  subtotal: Decimal | number
  options: Array<{
    id: string
    optionName: string
    additionalPrice: Decimal | number
  }>
}): OrderItemResponse {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: item.unitPrice.toString(),
    subtotal: item.subtotal.toString(),
    options: item.options.map(mapOrderItemOption),
  }
}

function mapStatusHistory(entry: {
  id: string
  fromStatus: string | null
  toStatus: string
  reason: string | null
  changedBy: string | null
  createdAt: Date
}): OrderStatusHistoryResponse {
  return {
    id: entry.id,
    fromStatus: entry.fromStatus,
    toStatus: entry.toStatus,
    reason: entry.reason,
    changedBy: entry.changedBy,
    createdAt: entry.createdAt.toISOString(),
  }
}

function mapOrder(order: {
  id: string
  orderNumber: string
  customerId: string
  addressId: string | null
  subtotal: Decimal | number
  total: Decimal | number
  orderStatus: string
  paymentStatus: string
  note: string | null
  createdAt: Date
  updatedAt: Date
  items: Array<{
    id: string
    productId: string
    productName: string
    quantity: number
    unitPrice: Decimal | number
    subtotal: Decimal | number
    options: Array<{
      id: string
      optionName: string
      additionalPrice: Decimal | number
    }>
  }>
  statusHistory: Array<{
    id: string
    fromStatus: string | null
    toStatus: string
    reason: string | null
    changedBy: string | null
    createdAt: Date
  }>
}): OrderResponse {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    addressId: order.addressId,
    subtotal: order.subtotal.toString(),
    total: order.total.toString(),
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    note: order.note,
    items: order.items.map(mapOrderItem),
    statusHistory: order.statusHistory.map(mapStatusHistory),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }
}

function mapOrderListItem(order: {
  id: string
  orderNumber: string
  subtotal: Decimal | number
  total: Decimal | number
  orderStatus: string
  paymentStatus: string
  note: string | null
  createdAt: Date
  updatedAt: Date
  _count: { items: number }
}): OrderListItemResponse {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    subtotal: order.subtotal.toString(),
    total: order.total.toString(),
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    note: order.note,
    itemCount: order._count.items,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Generate a date string in YYYYMMDD format for order number prefix.
 */
function getTodayDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}${month}${day}`
}

/**
 * Generate the next order number in the format ORD-YYYYMMDD-XXXXXX.
 * Queries the last order of today to determine the counter.
 */
async function generateOrderNumber(): Promise<string> {
  const today = getTodayDateString()
  const prefix = `ORD-${today}-`

  const lastOrder = await orderRepo.findLastOrderOfToday(prefix)

  let counter = 1
  if (lastOrder) {
    // Extract counter from orderNumber (last 6 chars after the last "-")
    const parts = lastOrder.orderNumber.split("-")
    if (parts.length === 3) {
      counter = parseInt(parts[2], 10) + 1
    }
  }

  return `${prefix}${String(counter).padStart(6, "0")}`
}

/**
 * Check if the store is currently open for business.
 * Validates:
 *   1. Store status is "open"
 *   2. No active temporary closure
 *   3. Current time is within today's business hours
 *
 * Throws badRequest if the store is closed.
 */
async function validateStoreIsOpen(): Promise<void> {
  // 1. Check store status
  const storeStatus = await prisma.setting.findUnique({
    where: { key: "store.status" },
  })
  if (storeStatus?.value !== "open") {
    badRequest("ร้านปิดอยู่ ไม่สามารถสั่งออเดอร์ได้ตอนนี้")
  }

  // 2. Check temporary closure
  const tempClosureEnabled = await prisma.setting.findUnique({
    where: { key: "business_hours.temporary_closure.enabled" },
  })
  if (tempClosureEnabled?.value === "true") {
    const tempClosureEnd = await prisma.setting.findUnique({
      where: { key: "business_hours.temporary_closure.end" },
    })
    if (tempClosureEnd && new Date(tempClosureEnd.value) > new Date()) {
      badRequest("ร้านปิดชั่วคราว ไม่สามารถสั่งออเดอร์ได้ตอนนี้")
    }
  }

  // 3. Check business hours for today
  const dayOfWeek = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase()
  const openKey = `business_hours.${dayOfWeek}.open`
  const closeKey = `business_hours.${dayOfWeek}.close`

  const [openSetting, closeSetting] = await Promise.all([
    prisma.setting.findUnique({ where: { key: openKey } }),
    prisma.setting.findUnique({ where: { key: closeKey } }),
  ])

  if (openSetting?.value && closeSetting?.value) {
    const now = new Date()
    const [openH, openM] = openSetting.value.split(":").map(Number)
    const [closeH, closeM] = closeSetting.value.split(":").map(Number)

    const openMinutes = openH * 60 + openM
    const closeMinutes = closeH * 60 + closeM
    const nowMinutes = now.getHours() * 60 + now.getMinutes()

    if (nowMinutes < openMinutes || nowMinutes >= closeMinutes) {
      badRequest("ร้านปิดอยู่ ไม่สามารถสั่งออเดอร์ได้ตอนนี้")
    }
  }
  // If no business_hours settings for today, assume always open
}

/**
 * Parse selectedOptions JSON from a cart item into a typed array.
 */
function parseCartSelectedOptions(
  json: unknown,
): Array<{
  optionName: string
  additionalPrice: number
}> {
  if (!json || typeof json !== "object" || !Array.isArray(json)) return []
  return (json as Array<Record<string, unknown>>).map((opt) => ({
    optionName: typeof opt.optionName === "string" ? opt.optionName : "",
    additionalPrice:
      typeof opt.additionalPrice === "number"
        ? opt.additionalPrice
        : typeof opt.additionalPrice === "string"
          ? parseFloat(opt.additionalPrice) || 0
          : 0,
  }))
}

// ─────────────────────────────────────────────────────────────
// Create Order
// ─────────────────────────────────────────────────────────────

/**
 * Create a new order from the customer's cart.
 *
 * Flow:
 *   1. Validate store is open
 *   2. Get customer cart with items; validate not empty
 *   3. For each cart item, validate product exists and is available
 *   4. Snapshot product prices from DB (never trust cart prices)
 *   5. Generate order number
 *   6. Create Order + OrderItems + OrderItemOptions + StatusHistory atomically
 *   7. Clear customer cart
 *   8. Return the created order
 */
export async function createOrder(
  customerId: string,
  data: CreateOrderRequest,
): Promise<OrderResponse> {
  // Step 1: Validate store is open
  await validateStoreIsOpen()

  // Step 2: Get customer cart with items
  const cartWithItems = await cartRepo.findWithItems(customerId)
  if (!cartWithItems || cartWithItems.items.length === 0) {
    throw new AppError(400, ErrorCode.CART_EMPTY, "Cart is empty")
  }

  // Step 3 & 4: Validate products and snapshot prices
  const cartItems = cartWithItems.items
  const productPrices = new Map<string, number>()

  for (const cartItem of cartItems) {
    const product = await productRepo.findById(cartItem.productId)
    if (!product) {
      throw new AppError(
        404,
        ErrorCode.PRODUCT_NOT_FOUND,
        `Product "${cartItem.productName}" (ID: ${cartItem.productId}) not found`,
      )
    }
    if (product.status !== "ACTIVE" || !product.isAvailable) {
      throw new AppError(
        400,
        ErrorCode.PRODUCT_UNAVAILABLE,
        `Product "${product.name}" is currently unavailable`,
      )
    }
    productPrices.set(cartItem.productId, Number(product.price))
  }

  // Step 5: Generate order number
  const orderNumber = await generateOrderNumber()

  // Capture cart ID outside transaction for the closure
  const cartId = cartWithItems.id

  // Step 6: Atomic transaction — create order + items + options + history + clear cart
  const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Create Order record
    const createdOrder = await tx.order.create({
      data: {
        customerId,
        orderNumber,
        addressId: data.addressId ?? null,
        subtotal: 0,
        total: 0,
        orderStatus: "AWAITING_PAYMENT",
        paymentStatus: "UNPAID",
        note: data.note ?? null,
      },
    })

    // Create OrderItems and OrderItemOptions
    let subtotal = 0

    for (const cartItem of cartItems) {
      const basePrice = productPrices.get(cartItem.productId) ?? 0
      const selectedOptions = parseCartSelectedOptions(
        cartItem.selectedOptions,
      )
      const optionsAdditionalPrice = selectedOptions.reduce(
        (sum, opt) => sum + opt.additionalPrice,
        0,
      )
      const unitPrice = basePrice + optionsAdditionalPrice
      const itemSubtotal = unitPrice * cartItem.quantity
      subtotal += itemSubtotal

      // Create OrderItem
      const orderItem = await tx.orderItem.create({
        data: {
          orderId: createdOrder.id,
          productId: cartItem.productId,
          productName: cartItem.productName,
          quantity: cartItem.quantity,
          unitPrice,
          subtotal: itemSubtotal,
        },
      })

      // Create OrderItemOptions
      if (selectedOptions.length > 0) {
        await tx.orderItemOption.createMany({
          data: selectedOptions.map((opt) => ({
            orderItemId: orderItem.id,
            optionName: opt.optionName,
            additionalPrice: opt.additionalPrice,
          })),
        })
      }
    }

    // Update order totals
    await tx.order.update({
      where: { id: createdOrder.id },
      data: {
        subtotal,
        total: subtotal,
      },
    })

    // Create OrderStatusHistory
    await tx.orderStatusHistory.create({
      data: {
        orderId: createdOrder.id,
        fromStatus: null,
        toStatus: "AWAITING_PAYMENT",
        changedBy: null,
        reason: null,
      },
    })

    // Step 7: Clear cart items and delete cart
    await tx.cartItem.deleteMany({
      where: { cartId },
    })
    await tx.cart.delete({
      where: { id: cartId },
    })

    // Return the fully populated order
    return tx.order.findUnique({
      where: { id: createdOrder.id },
      include: {
        items: {
          include: {
            options: {
              orderBy: { id: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        statusHistory: {
          orderBy: { createdAt: "asc" },
        },
      },
    })
  })

  if (!order) {
    throw new AppError(
      500,
      ErrorCode.INTERNAL_ERROR,
      "Failed to create order",
    )
  }

  return mapOrder(order)
}

// ─────────────────────────────────────────────────────────────
// List Orders
// ─────────────────────────────────────────────────────────────

/**
 * List customer orders with pagination and optional status filter.
 */
export async function listOrders(
  customerId: string,
  query: ListOrdersQuery,
): Promise<{
  orders: OrderListItemResponse[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}> {
  const { orders, total } = await orderRepo.findByCustomerIdPaginated(
    customerId,
    {
      status: query.status,
      page: query.page,
      pageSize: query.pageSize,
    },
  )

  return {
    orders: orders.map(mapOrderListItem),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.ceil(total / query.pageSize),
  }
}

// ─────────────────────────────────────────────────────────────
// Get Order Detail
// ─────────────────────────────────────────────────────────────

/**
 * Get a single order by ID with full details.
 * Validates that the order belongs to the requesting customer.
 */
export async function getOrder(
  orderId: string,
  customerId: string,
): Promise<OrderResponse> {
  const order = await orderRepo.findByIdWithDetails(orderId)

  if (!order) {
    throw new AppError(404, ErrorCode.ORDER_NOT_FOUND, "Order not found")
  }

  if (order.customerId !== customerId) {
    throw new AppError(404, ErrorCode.ORDER_NOT_FOUND, "Order not found")
  }

  return mapOrder(order)
}

// ─────────────────────────────────────────────────────────────
// Cancel Order (Customer)
// ─────────────────────────────────────────────────────────────

/**
 * Cancel an order (customer-initiated).
 *
 * Allowed only when orderStatus is one of: PENDING, AWAITING_PAYMENT,
 * AWAITING_VERIFICATION, PAID.
 *
 * Creates a status history entry and updates the order.
 */
export async function cancelOrder(
  orderId: string,
  customerId: string,
  reason?: string,
): Promise<OrderResponse> {
  const order = await orderRepo.findById(orderId)

  if (!order) {
    throw new AppError(404, ErrorCode.ORDER_NOT_FOUND, "Order not found")
  }

  if (order.customerId !== customerId) {
    throw new AppError(404, ErrorCode.ORDER_NOT_FOUND, "Order not found")
  }

  if (!CANCELLABLE_STATUSES.includes(order.orderStatus as never)) {
    throw new AppError(
      400,
      ErrorCode.INVALID_STATUS_TRANSITION,
      `Order with status "${order.orderStatus}" cannot be cancelled`,
    )
  }

  const currentStatus = order.orderStatus

  // Update status and create history atomically
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.order.update({
      where: { id: orderId },
      data: { orderStatus: "CANCELLED" },
    })

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: currentStatus,
        toStatus: "CANCELLED",
        changedBy: customerId,
        reason: reason ?? null,
      },
    })
  })

  // Dispatch LINE notification for order cancellation
  try {
    const customer = await prisma.customer.findUnique({ where: { id: order.customerId }, select: { lineUserId: true } })
    if (customer?.lineUserId) {
      await dispatchNotification(customer.lineUserId, "ORDER_CANCELLED", "LINE", {
        orderNumber: order.orderNumber,
      }, { orderId: order.id })
    }
  } catch (error) {
    console.error({ err: error }, "Failed to dispatch order cancellation notification")
  }

  // Fetch and return the updated order
  const updatedOrder = await orderRepo.findByIdWithDetails(orderId)
  if (!updatedOrder) {
    throw new AppError(
      500,
      ErrorCode.INTERNAL_ERROR,
      "Failed to retrieve updated order",
    )
  }

  return mapOrder(updatedOrder)
}

// ─────────────────────────────────────────────────────────────
// Update Order Status (Owner)
// ─────────────────────────────────────────────────────────────

/**
 * Update an order's status (owner-initiated).
 *
 * Validates the transition against ALLOWED_TRANSITIONS matrix.
 * Creates a status history entry and updates the order.
 */
export async function updateOrderStatus(
  orderId: string,
  data: UpdateOrderStatusRequest,
  changedBy: string,
): Promise<OrderResponse> {
  const order = await orderRepo.findById(orderId)

  if (!order) {
    throw new AppError(404, ErrorCode.ORDER_NOT_FOUND, "Order not found")
  }

  const { status, reason } = data
  const currentStatus = order.orderStatus
  const allowedNext = ALLOWED_TRANSITIONS[currentStatus]

  if (!allowedNext || !allowedNext.includes(status as never)) {
    throw new AppError(
      400,
      ErrorCode.INVALID_STATUS_TRANSITION,
      `Invalid status transition: ${currentStatus} -> ${status}. Allowed: ${allowedNext.join(", ") || "none (terminal state)"}`,
    )
  }

  // Update status and create history atomically
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.order.update({
      where: { id: orderId },
      data: { orderStatus: status },
    })

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: currentStatus,
        toStatus: status,
        changedBy,
        reason: reason ?? null,
      },
    })
  })

  // Dispatch LINE notification for status change
  try {
    const customer = await prisma.customer.findUnique({ where: { id: order.customerId }, select: { lineUserId: true } })
    if (customer?.lineUserId) {
      await dispatchNotification(customer.lineUserId, "ORDER_STATUS_UPDATED", "LINE", {
        orderNumber: order.orderNumber,
        status: status,
      }, { orderId: order.id })
    }
  } catch (error) {
    console.error({ err: error }, "Failed to dispatch order status notification")
  }

  // Fetch and return the updated order
  const updatedOrder = await orderRepo.findByIdWithDetails(orderId)
  if (!updatedOrder) {
    throw new AppError(
      500,
      ErrorCode.INTERNAL_ERROR,
      "Failed to retrieve updated order",
    )
  }

  return mapOrder(updatedOrder)
}
