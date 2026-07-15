/**
 * Category routes — registers all /api/v1/categories/* endpoints.
 *
 * Endpoints:
 *   GET    /api/v1/categories       — List active categories (public)
 *   GET    /api/v1/categories/:id   — Category detail (public)
 *   POST   /api/v1/categories       — Create category (Owner)
 *   PATCH  /api/v1/categories/:id   — Update category (Owner)
 *   DELETE /api/v1/categories/:id   — Disable category (Owner)
 *
 * Per 174-api-design.md: all endpoints under /api/v1/categories with auth middleware.
 * Per 179-api-endpoints.md: Owner endpoints require Bearer JWT.
 */

import type { FastifyInstance } from "fastify"

import { authenticate, authorize } from "../auth/auth.middleware.js"

import {
  createCategoryHandler,
  deleteCategoryHandler,
  getCategoryHandler,
  listCategoriesHandler,
  updateCategoryHandler,
} from "./categories.controller.js"
import {
  createCategoryRouteSchema,
  deleteCategoryRouteSchema,
  getCategoryRouteSchema,
  listCategoriesRouteSchema,
  updateCategoryRouteSchema,
} from "./categories.schema.js"

export async function categoryRoutes(app: FastifyInstance): Promise<void> {
  // ── GET /categories ──────────────────────────────────────
  // Public endpoint — no authentication required.
  app.get("/api/v1/categories", {
    schema: listCategoriesRouteSchema,
    handler: listCategoriesHandler,
  })

  // ── GET /categories/:id ─────────────────────────────────
  // Public endpoint — no authentication required.
  app.get("/api/v1/categories/:id", {
    schema: getCategoryRouteSchema,
    handler: getCategoryHandler,
  })

  // ── POST /categories ────────────────────────────────────
  // Owner only — requires valid JWT + OWNER role.
  app.post("/api/v1/categories", {
    schema: createCategoryRouteSchema,
    preHandler: [authenticate, authorize("OWNER")],
    handler: createCategoryHandler,
  })

  // ── PATCH /categories/:id ──────────────────────────────
  // Owner only — requires valid JWT + OWNER role.
  app.patch("/api/v1/categories/:id", {
    schema: updateCategoryRouteSchema,
    preHandler: [authenticate, authorize("OWNER")],
    handler: updateCategoryHandler,
  })

  // ── DELETE /categories/:id ─────────────────────────────
  // Owner only — requires valid JWT + OWNER role.
  app.delete("/api/v1/categories/:id", {
    schema: deleteCategoryRouteSchema,
    preHandler: [authenticate, authorize("OWNER")],
    handler: deleteCategoryHandler,
  })
}
