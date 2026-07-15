/**
 * Orders module type definitions and DTOs.
 *
 * These types define the shape of data flowing between
 * controller <-> service <-> repository.
 *
 * Per 60-coding-standard.md: use interfaces for object contracts.
 * Per 90-api-rules.md: JSON properties use camelCase.
 * Per 153-pricing-rules.md: monetary values are returned as strings.
 * Per 158-order-status.md: all status changes are logged in history.
 */

// ─────────────────────────────────────────────────────────────
// Order Status
// ─────────────────────────────────────────────────────────────

/** All possible order statuses (state machine nodes). */
export type OrderStatus =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "AWAITING_VERIFICATION"
  | "PAID"
  | "QUEUED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "COMPLETED"
  | "EXPIRED"
  | "CANCELLED"
  | "PAYMENT_REJECTED"

/** Statuses that allow customer-initiated cancellation. */
export const CANCELLABLE_STATUSES: OrderStatus[] = [
  "PENDING",
  "AWAITING_PAYMENT",
  "AWAITING_VERIFICATION",
  "PAID",
]

/** Allowed status transitions (state machine edges). */
export const ALLOWED_TRANSITIONS: Record<string, OrderStatus[]> = {
  PENDING: ["AWAITING_PAYMENT", "CANCELLED"],
  AWAITING_PAYMENT: ["AWAITING_VERIFICATION", "EXPIRED", "CANCELLED"],
  AWAITING_VERIFICATION: ["PAID", "PAYMENT_REJECTED", "EXPIRED", "CANCELLED"],
  PAID: ["QUEUED", "CANCELLED"],
  QUEUED: ["PREPARING"],
  PREPARING: ["READY"],
  READY: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
  // Terminal states — no transitions out
  COMPLETED: [],
  CANCELLED: [],
  EXPIRED: [],
  PAYMENT_REJECTED: [],
}

// ─────────────────────────────────────────────────────────────
// DTO — Response
// ─────────────────────────────────────────────────────────────

/** Option snapshot on an order item. */
export interface OrderItemOptionResponse {
  id: string
  optionName: string
  additionalPrice: string
}

/** Order item line returned in order views. */
export interface OrderItemResponse {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: string
  subtotal: string
  options: OrderItemOptionResponse[]
}

/** Single status history entry. */
export interface OrderStatusHistoryResponse {
  id: string
  fromStatus: string | null
  toStatus: string
  reason: string | null
  changedBy: string | null
  createdAt: string
}

/** Full order response (list item or detail). */
export interface OrderResponse {
  id: string
  orderNumber: string
  customerId: string
  addressId: string | null
  subtotal: string
  total: string
  orderStatus: string
  paymentStatus: string
  note: string | null
  items: OrderItemResponse[]
  statusHistory: OrderStatusHistoryResponse[]
  createdAt: string
  updatedAt: string
}

/** Order list item (lighter — without full items/history). */
export interface OrderListItemResponse {
  id: string
  orderNumber: string
  subtotal: string
  total: string
  orderStatus: string
  paymentStatus: string
  note: string | null
  itemCount: number
  createdAt: string
  updatedAt: string
}

// ─────────────────────────────────────────────────────────────
// DTO — Request
// ─────────────────────────────────────────────────────────────

/** Create order from cart request body. */
export interface CreateOrderRequest {
  addressId?: string
  note?: string
}

/** Cancel order request body. */
export interface CancelOrderRequest {
  reason?: string
}

/** Update order status request body (owner). */
export interface UpdateOrderStatusRequest {
  status: string
  reason?: string
}

/** List orders query parameters. */
export interface ListOrdersQuery {
  status?: string
  page: number
  pageSize: number
}
