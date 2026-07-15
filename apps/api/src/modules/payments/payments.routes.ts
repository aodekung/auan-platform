/**
 * Payments routes — registers all /api/v1/payments/* endpoints.
 *
 * Endpoints:
 *   POST   /api/v1/payments              — Create payment for order (customer)
 *   GET    /api/v1/payments/:orderId      — Get payment by order ID (customer)
 *   POST   /api/v1/payments/:id/upload-slip — Upload payment slip (customer)
 *   POST   /api/v1/payments/:id/confirm   — Customer confirms payment (customer)
 *   POST   /api/v1/payments/:id/verify    — Verify payment (owner)
 *   POST   /api/v1/payments/:id/reject    — Reject payment (owner)
 *
 * Per 158-order-status.md: order status changes from payment actions
 * are logged in OrderStatusHistory.
 * Per 153-pricing-rules.md: monetary values are returned as strings.
 */

import type { FastifyInstance } from "fastify"

import { authenticate, authorize } from "../auth/auth.middleware.js"

import {
  confirmPaymentHandler,
  createPaymentHandler,
  getPaymentHandler,
  rejectPaymentHandler,
  uploadSlipHandler,
  verifyPaymentHandler,
} from "./payments.controller.js"
import {
  confirmPaymentRouteSchema,
  createPaymentRouteSchema,
  getPaymentRouteSchema,
  rejectPaymentRouteSchema,
  uploadSlipRouteSchema,
  verifyPaymentRouteSchema,
} from "./payments.schema.js"

export async function paymentRoutes(app: FastifyInstance): Promise<void> {
  // ── POST /payments — Create payment for order ─────────────
  // Authenticated — validates order state, creates PENDING payment.
  app.post("/api/v1/payments", {
    schema: createPaymentRouteSchema,
    preHandler: [authenticate],
    handler: createPaymentHandler,
  })

  // ── GET /payments/:orderId — Get payment by order ID ──────
  // Authenticated — includes lazy expiry timeout check.
  app.get("/api/v1/payments/:orderId", {
    schema: getPaymentRouteSchema,
    preHandler: [authenticate],
    handler: getPaymentHandler,
  })

  // ── POST /payments/:id/upload-slip — Upload slip ──────────
  // Authenticated — accepts base64 slip image in JSON body.
  app.post("/api/v1/payments/:id/upload-slip", {
    schema: uploadSlipRouteSchema,
    preHandler: [authenticate],
    handler: uploadSlipHandler,
  })

  // ── POST /payments/:id/confirm — Confirm payment ─────────
  // Authenticated — customer marks payment as submitted.
  app.post("/api/v1/payments/:id/confirm", {
    schema: confirmPaymentRouteSchema,
    preHandler: [authenticate],
    handler: confirmPaymentHandler,
  })

  // ── POST /payments/:id/verify — Verify payment (owner) ────
  // Authenticated + OWNER — marks payment as PAID, updates order.
  app.post("/api/v1/payments/:id/verify", {
    schema: verifyPaymentRouteSchema,
    preHandler: [authenticate, authorize("OWNER")],
    handler: verifyPaymentHandler,
  })

  // ── POST /payments/:id/reject — Reject payment (owner) ───
  // Authenticated + OWNER — marks payment as REJECTED, updates order.
  app.post("/api/v1/payments/:id/reject", {
    schema: rejectPaymentRouteSchema,
    preHandler: [authenticate, authorize("OWNER")],
    handler: rejectPaymentHandler,
  })
}
