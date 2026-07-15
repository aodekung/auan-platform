/**
 * Product routes — registers all /api/v1/products/* endpoints.
 *
 * Endpoints:
 *   GET    /api/v1/products         — Product list (public, with query params)
 *   GET    /api/v1/products/:id    — Product detail (public)
 *   POST   /api/v1/products         — Create product (Owner)
 *   PATCH  /api/v1/products/:id    — Update product (Owner)
 *   DELETE /api/v1/products/:id    — Disable product (Owner)
 *
 * Per 174-api-design.md: all endpoints under /api/v1/products with auth middleware.
 * Per 179-api-endpoints.md: Owner endpoints require Bearer JWT.
 */

import type { FastifyInstance } from "fastify"

import { authenticate, authorize } from "../auth/auth.middleware.js"

import {
  createProductHandler,
  deleteProductHandler,
  getProductHandler,
  listProductsHandler,
  updateProductHandler,
} from "./products.controller.js"
import {
  createProductRouteSchema,
  deleteProductRouteSchema,
  getProductRouteSchema,
  listProductsRouteSchema,
  updateProductRouteSchema,
} from "./products.schema.js"

export async function productRoutes(app: FastifyInstance): Promise<void> {
  // ── GET /products ──────────────────────────────────────────
  // Public endpoint — no authentication required.
  // Supports query params: categoryId, search, sort, order, page, pageSize.
  app.get("/api/v1/products", {
    schema: listProductsRouteSchema,
    handler: listProductsHandler,
  })

  // ── GET /products/:id ──────────────────────────────────────
  // Public endpoint — no authentication required.
  app.get("/api/v1/products/:id", {
    schema: getProductRouteSchema,
    handler: getProductHandler,
  })

  // ── POST /products ────────────────────────────────────────
  // Owner only — requires valid JWT + OWNER role.
  app.post("/api/v1/products", {
    schema: createProductRouteSchema,
    preHandler: [authenticate, authorize("OWNER")],
    handler: createProductHandler,
  })

  // ── PATCH /products/:id ──────────────────────────────────
  // Owner only — requires valid JWT + OWNER role.
  app.patch("/api/v1/products/:id", {
    schema: updateProductRouteSchema,
    preHandler: [authenticate, authorize("OWNER")],
    handler: updateProductHandler,
  })

  // ── DELETE /products/:id ───────────────────────────────────
  // Owner only — requires valid JWT + OWNER role.
  app.delete("/api/v1/products/:id", {
    schema: deleteProductRouteSchema,
    preHandler: [authenticate, authorize("OWNER")],
    handler: deleteProductHandler,
  })
}
