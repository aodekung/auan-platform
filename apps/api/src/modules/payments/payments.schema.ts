/**
 * Zod validation schemas for the Payments module.
 *
 * Every request body/query/params is validated through these schemas
 * before reaching the service layer (per 90-api-rules.md).
 *
 * Endpoints:
 *   POST   /api/v1/payments              — Create payment for order
 *   GET    /api/v1/payments/:orderId      — Get payment by order ID
 *   POST   /api/v1/payments/:id/upload-slip — Upload payment slip
 *   POST   /api/v1/payments/:id/confirm   — Customer confirms payment
 *   POST   /api/v1/payments/:id/verify    — Verify payment (owner)
 *   POST   /api/v1/payments/:id/reject    — Reject payment (owner)
 */

import { z } from "zod"

// ─────────────────────────────────────────────────────────────
// Request Schemas
// ─────────────────────────────────────────────────────────────

/** POST /api/v1/payments — Create payment for order. */
export const createPaymentBodySchema = z.object({
  orderId: z.string().uuid(),
})

export type CreatePaymentBody = z.infer<typeof createPaymentBodySchema>

/** POST /api/v1/payments/:id/upload-slip — Upload payment slip. */
export const uploadSlipBodySchema = z.object({
  slipBase64: z.string().min(1, "Slip image is required"),
  fileName: z.string().max(255).optional(),
})

export type UploadSlipBody = z.infer<typeof uploadSlipBodySchema>

/** POST /api/v1/payments/:id/reject — Reject payment (owner). */
export const rejectPaymentBodySchema = z.object({
  reason: z.string().max(500).optional(),
})

export type RejectPaymentBody = z.infer<typeof rejectPaymentBodySchema>

// ─────────────────────────────────────────────────────────────
// Response Schemas (for Swagger)
// ─────────────────────────────────────────────────────────────

const paymentOrderItemSchema = z.object({
  productName: z.string(),
  quantity: z.number().int(),
  unitPrice: z.string(),
})

const paymentOrderSummarySchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(),
  orderStatus: z.string(),
  items: z.array(paymentOrderItemSchema),
})

const paymentResponseSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  method: z.string(),
  amount: z.string(),
  paymentStatus: z.string(),
  slipImage: z.string().nullable(),
  paidAt: z.string().nullable(),
  verifiedAt: z.string().nullable(),
  verifiedBy: z.string().nullable(),
  rejectReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const paymentWithOrderResponseSchema = paymentResponseSchema.extend({
  order: paymentOrderSummarySchema,
})

const createPaymentResponseSchema = paymentWithOrderResponseSchema.extend({
  promptPayNumber: z.string().nullable(),
  promptPayQrUrl: z.string().nullable(),
})

const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})

// ─────────────────────────────────────────────────────────────
// Route Schemas
// ─────────────────────────────────────────────────────────────

/** POST /api/v1/payments */
export const createPaymentRouteSchema = {
  description: "Create payment for an order (PromptPay QR + number returned)",
  tags: ["Payments"],
  security: [{ bearerAuth: [] }],
  body: createPaymentBodySchema,
  response: {
    201: z.object({
      success: z.literal(true),
      data: createPaymentResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    404: errorResponseSchema,
    409: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** GET /api/v1/payments/:orderId */
export const getPaymentRouteSchema = {
  description: "Get payment status and details by order ID (includes lazy expiry check)",
  tags: ["Payments"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    orderId: z.string().uuid(),
  }),
  response: {
    200: z.object({
      success: z.literal(true),
      data: paymentWithOrderResponseSchema,
      message: z.string(),
    }),
    401: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** POST /api/v1/payments/:id/upload-slip */
export const uploadSlipRouteSchema = {
  description: "Upload payment slip image (base64 JPEG/PNG/WebP, max 5MB)",
  tags: ["Payments"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    id: z.string().uuid(),
  }),
  body: uploadSlipBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: paymentResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** POST /api/v1/payments/:id/confirm */
export const confirmPaymentRouteSchema = {
  description: "Customer confirms payment (PENDING -> AWAITING_VERIFICATION)",
  tags: ["Payments"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    id: z.string().uuid(),
  }),
  response: {
    200: z.object({
      success: z.literal(true),
      data: paymentResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** POST /api/v1/payments/:id/verify (Owner) */
export const verifyPaymentRouteSchema = {
  description: "Verify and approve payment (AWAITING_VERIFICATION -> PAID)",
  tags: ["Payments"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    id: z.string().uuid(),
  }),
  response: {
    200: z.object({
      success: z.literal(true),
      data: paymentResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** POST /api/v1/payments/:id/reject (Owner) */
export const rejectPaymentRouteSchema = {
  description: "Reject payment (AWAITING_VERIFICATION -> REJECTED)",
  tags: ["Payments"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    id: z.string().uuid(),
  }),
  body: rejectPaymentBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: paymentResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const
