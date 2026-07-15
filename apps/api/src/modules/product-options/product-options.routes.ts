/**
 * Product Options routes — registers all /api/v1/product-options/* endpoints
 * and the nested product options endpoint.
 *
 * Endpoints:
 *   GET    /api/v1/products/:productId/options              — List option groups (public)
 *   POST   /api/v1/products/:productId/options              — Create option group (Owner)
 *   PATCH  /api/v1/product-options/:id                     — Update option group (Owner)
 *   DELETE /api/v1/product-options/:id                     — Delete option group (Owner)
 *   POST   /api/v1/product-options/:groupId/options         — Add option to group (Owner)
 *   PATCH  /api/v1/product-options/:groupId/options/:id     — Update option (Owner)
 *   DELETE /api/v1/product-options/:groupId/options/:id     — Soft-disable option (Owner)
 *
 * Per 174-api-design.md: all endpoints under /api/v1/ with auth middleware.
 * Per 179-api-endpoints.md: Owner endpoints require Bearer JWT.
 */

import type { FastifyInstance } from "fastify"

import { authenticate, authorize } from "../auth/auth.middleware.js"

import {
  createOptionGroupHandler,
  createOptionHandler,
  deleteOptionGroupHandler,
  disableOptionHandler,
  listOptionGroupsHandler,
  updateOptionGroupHandler,
  updateOptionHandler,
} from "./product-options.controller.js"
import {
  createOptionGroupRouteSchema,
  createOptionRouteSchema,
  deleteOptionGroupRouteSchema,
  deleteOptionRouteSchema,
  listOptionGroupsRouteSchema,
  updateOptionGroupRouteSchema,
  updateOptionRouteSchema,
} from "./product-options.schema.js"

export async function productOptionRoutes(app: FastifyInstance): Promise<void> {
  // ── GET /products/:productId/options ──────────────────────
  // Public endpoint — no authentication required.
  // Returns all option groups with their active options for a product.
  app.get("/api/v1/products/:productId/options", {
    schema: listOptionGroupsRouteSchema,
    handler: listOptionGroupsHandler,
  })

  // ── POST /products/:productId/options ──────────────────────
  // Owner only — requires valid JWT + OWNER role.
  app.post("/api/v1/products/:productId/options", {
    schema: createOptionGroupRouteSchema,
    preHandler: [authenticate, authorize("OWNER")],
    handler: createOptionGroupHandler,
  })

  // ── PATCH /product-options/:id ────────────────────────────
  // Owner only — requires valid JWT + OWNER role.
  app.patch("/api/v1/product-options/:id", {
    schema: updateOptionGroupRouteSchema,
    preHandler: [authenticate, authorize("OWNER")],
    handler: updateOptionGroupHandler,
  })

  // ── DELETE /product-options/:id ───────────────────────────
  // Owner only — requires valid JWT + OWNER role.
  app.delete("/api/v1/product-options/:id", {
    schema: deleteOptionGroupRouteSchema,
    preHandler: [authenticate, authorize("OWNER")],
    handler: deleteOptionGroupHandler,
  })

  // ── POST /product-options/:groupId/options ───────────────
  // Owner only — requires valid JWT + OWNER role.
  app.post("/api/v1/product-options/:groupId/options", {
    schema: createOptionRouteSchema,
    preHandler: [authenticate, authorize("OWNER")],
    handler: createOptionHandler,
  })

  // ── PATCH /product-options/:groupId/options/:id ──────────
  // Owner only — requires valid JWT + OWNER role.
  app.patch("/api/v1/product-options/:groupId/options/:id", {
    schema: updateOptionRouteSchema,
    preHandler: [authenticate, authorize("OWNER")],
    handler: updateOptionHandler,
  })

  // ── DELETE /product-options/:groupId/options/:id ──────────
  // Owner only — requires valid JWT + OWNER role.
  app.delete("/api/v1/product-options/:groupId/options/:id", {
    schema: deleteOptionRouteSchema,
    preHandler: [authenticate, authorize("OWNER")],
    handler: disableOptionHandler,
  })
}
