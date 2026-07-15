/**
 * Cart routes — registers all /api/v1/cart/* endpoints.
 *
 * Endpoints:
 *   GET    /api/v1/cart           — Get customer cart (authenticated)
 *   POST   /api/v1/cart/items      — Add item to cart (authenticated)
 *   PATCH  /api/v1/cart/items/:id  — Update cart item (authenticated)
 *   DELETE /api/v1/cart/items/:id  — Remove cart item (authenticated)
 *   DELETE /api/v1/cart            — Clear entire cart (authenticated)
 *
 * Per 179-api-endpoints.md: all cart endpoints require authentication.
 * Per 150-business-rules.md: only authenticated customers can own carts.
 */

import type { FastifyInstance } from "fastify"

import { authenticate } from "../auth/auth.middleware.js"

import {
  addToCartHandler,
  clearCartHandler,
  getCartHandler,
  removeCartItemHandler,
  updateCartItemHandler,
} from "./cart.controller.js"
import {
  addToCartRouteSchema,
  clearCartRouteSchema,
  getCartRouteSchema,
  removeCartItemRouteSchema,
  updateCartItemRouteSchema,
} from "./cart.schema.js"

export async function cartRoutes(app: FastifyInstance): Promise<void> {
  // ── GET /cart ───────────────────────────────────────────
  // Authenticated — returns cart with items and totals.
  app.get("/api/v1/cart", {
    schema: getCartRouteSchema,
    preHandler: [authenticate],
    handler: getCartHandler,
  })

  // ── POST /cart/items ──────────────────────────────────────
  // Authenticated — add product to cart (auto-creates cart if needed).
  app.post("/api/v1/cart/items", {
    schema: addToCartRouteSchema,
    preHandler: [authenticate],
    handler: addToCartHandler,
  })

  // ── PATCH /cart/items/:id ───────────────────────────────
  // Authenticated — update quantity or note.
  app.patch("/api/v1/cart/items/:id", {
    schema: updateCartItemRouteSchema,
    preHandler: [authenticate],
    handler: updateCartItemHandler,
  })

  // ── DELETE /cart/items/:id ────────────────────────────────
  // Authenticated — remove single item.
  app.delete("/api/v1/cart/items/:id", {
    schema: removeCartItemRouteSchema,
    preHandler: [authenticate],
    handler: removeCartItemHandler,
  })

  // ── DELETE /cart ─────────────────────────────────────────
  // Authenticated — clear all items from cart.
  app.delete("/api/v1/cart", {
    schema: clearCartRouteSchema,
    preHandler: [authenticate],
    handler: clearCartHandler,
  })
}
