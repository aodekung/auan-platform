/**
 * Orders routes — registers all /api/v1/orders/* endpoints.
 *
 * Endpoints:
 *   POST   /api/v1/orders              — Create order from cart (customer)
 *   GET    /api/v1/orders              — List customer orders (paginated)
 *   GET    /api/v1/orders/:id          — Order detail (customer)
 *   PATCH  /api/v1/orders/:id/cancel   — Cancel order (customer)
 *   PATCH  /api/v1/orders/:id/status   — Update order status (owner)
 *
 * Per 158-order-status.md: all status changes are logged in OrderStatusHistory.
 * Per 153-pricing-rules.md: backend recalculates all prices.
 */

import type { FastifyInstance } from "fastify"

import { authenticate, authorize } from "../auth/auth.middleware.js"

import {
  cancelOrderHandler,
  createOrderHandler,
  getOrderHandler,
  listOrdersHandler,
  updateOrderStatusHandler,
} from "./orders.controller.js"
import {
  cancelOrderRouteSchema,
  createOrderRouteSchema,
  getOrderRouteSchema,
  listOrdersRouteSchema,
  updateOrderStatusRouteSchema,
} from "./orders.schema.js"

export async function orderRoutes(app: FastifyInstance): Promise<void> {
  // ── POST /orders — Create order from cart ─────────────────
  // Authenticated — converts cart to order atomically.
  app.post("/api/v1/orders", {
    schema: createOrderRouteSchema,
    preHandler: [authenticate],
    handler: createOrderHandler,
  })

  // ── GET /orders — List customer orders ─────────────────────
  // Authenticated — paginated, filterable by status.
  app.get("/api/v1/orders", {
    schema: listOrdersRouteSchema,
    preHandler: [authenticate],
    handler: listOrdersHandler,
  })

  // ── GET /orders/:id — Order detail ─────────────────────────
  // Authenticated — full detail with items, options, status history.
  app.get("/api/v1/orders/:id", {
    schema: getOrderRouteSchema,
    preHandler: [authenticate],
    handler: getOrderHandler,
  })

  // ── PATCH /orders/:id/cancel — Cancel order ─────────────────
  // Authenticated — customer-initiated cancellation.
  app.patch("/api/v1/orders/:id/cancel", {
    schema: cancelOrderRouteSchema,
    preHandler: [authenticate],
    handler: cancelOrderHandler,
  })

  // ── PATCH /orders/:id/status — Update order status ─────────
  // Authenticated + OWNER — owner-initiated status transition.
  app.patch("/api/v1/orders/:id/status", {
    schema: updateOrderStatusRouteSchema,
    preHandler: [authenticate, authorize("OWNER")],
    handler: updateOrderStatusHandler,
  })
}
