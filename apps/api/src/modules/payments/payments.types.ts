/**
 * Payments module type definitions and DTOs.
 *
 * These types define the shape of data flowing between
 * controller <-> service <-> repository.
 *
 * Per 60-coding-standard.md: use interfaces for object contracts.
 * Per 90-api-rules.md: JSON properties use camelCase.
 * Per 153-pricing-rules.md: monetary values are returned as strings.
 * Per 155-payment-workflow.md: 7 payment statuses.
 */

// ─────────────────────────────────────────────────────────────
// Payment Status
// ─────────────────────────────────────────────────────────────

/** All possible payment statuses (per 155-payment-workflow.md). */
export type PaymentStatus =
  | "PENDING"
  | "AWAITING_VERIFICATION"
  | "PAID"
  | "REJECTED"
  | "FAILED"
  | "EXPIRED"
  | "REFUNDED"

/** Payment statuses that allow slip upload. */
export const SLIP_UPLOAD_STATUSES: PaymentStatus[] = [
  "PENDING",
  "AWAITING_VERIFICATION",
]

/** Payment statuses that allow customer confirmation. */
export const CONFIRMABLE_STATUSES: PaymentStatus[] = [
  "PENDING",
  "AWAITING_VERIFICATION",
]

// ─────────────────────────────────────────────────────────────
// DTO — Request
// ─────────────────────────────────────────────────────────────

/** Create payment for order request body. */
export interface CreatePaymentRequest {
  orderId: string
}

/** Upload slip request body (base64-encoded image). */
export interface UploadSlipRequest {
  slipBase64: string
  fileName?: string
}

/** Reject payment request body (owner). */
export interface RejectPaymentRequest {
  reason?: string
}

// ─────────────────────────────────────────────────────────────
// DTO — Response
// ─────────────────────────────────────────────────────────────

/** Order item summary returned with payment. */
export interface PaymentOrderItemSummary {
  productName: string
  quantity: number
  unitPrice: string
}

/** Order summary returned with payment. */
export interface PaymentOrderSummary {
  id: string
  orderNumber: string
  orderStatus: string
  items: PaymentOrderItemSummary[]
}

/** Payment response (base fields returned on all payment endpoints). */
export interface PaymentResponse {
  id: string
  orderId: string
  method: string
  amount: string
  paymentStatus: string
  slipImage: string | null
  paidAt: string | null
  verifiedAt: string | null
  verifiedBy: string | null
  rejectReason: string | null
  createdAt: string
  updatedAt: string
}

/** Payment with order info (returned on create and get by orderId). */
export interface PaymentWithOrderResponse extends PaymentResponse {
  order: PaymentOrderSummary
}

/** Create payment response — includes PromptPay details. */
export interface CreatePaymentResponse extends PaymentWithOrderResponse {
  promptPayNumber: string | null
  promptPayQrUrl: string | null
}
