/**
 * Option Templates routes — registers all /api/v1/admin/option-groups/*
 * and /api/v1/products/:productId/option-assignments/* endpoints.
 *
 * Endpoints:
 *   GET    /api/v1/admin/option-groups                        — List templates (Staff)
 *   POST   /api/v1/admin/option-groups                        — Create template (Staff)
 *   PATCH  /api/v1/admin/option-groups/:id                   — Update template (Staff)
 *   DELETE /api/v1/admin/option-groups/:id                   — Delete template (Staff)
 *   POST   /api/v1/admin/option-groups/:groupId/options       — Add option (Staff)
 *   PATCH  /api/v1/admin/option-groups/:groupId/options/:id   — Update option (Staff)
 *   DELETE /api/v1/admin/option-groups/:groupId/options/:id   — Disable option (Staff)
 *   GET    /api/v1/products/:productId/option-assignments      — List assignments (Staff)
 *   POST   /api/v1/products/:productId/option-assignments      — Assign (Staff)
 *   DELETE /api/v1/products/:productId/option-assignments/:groupId — Unassign (Staff)
 *   PATCH  /api/v1/products/:productId/option-assignments/:groupId/overrides — Overrides (Staff)
 *   GET    /api/v1/products/:productId/template-options        — Customer-facing (public)
 *
 * Per 174-api-design.md: all endpoints under /api/v1/ with auth middleware.
 */

import type { FastifyInstance } from "fastify"

import { authenticateOrStaff, authorizeOwnerOrAdmin } from "../auth/auth.middleware.js"

import {
  assignOptionGroupHandler,
  createOptionGroupHandler,
  createOptionHandler,
  deleteOptionGroupHandler,
  deleteOptionHandler,
  listAssignmentsHandler,
  listOptionGroupsHandler,
  listProductOptionsHandler,
  removeAssignmentHandler,
  setPriceOverridesHandler,
  updateOptionGroupHandler,
  updateOptionHandler,
} from "./option-template.controller.js"
import {
  assignOptionGroupRouteSchema,
  createOptionGroupRouteSchema,
  createOptionRouteSchema,
  deleteOptionGroupRouteSchema,
  deleteOptionRouteSchema,
  listAssignmentsRouteSchema,
  listOptionGroupsRouteSchema,
  removeAssignmentRouteSchema,
  setPriceOverridesRouteSchema,
  updateOptionGroupRouteSchema,
  updateOptionRouteSchema,
} from "./option-template.schema.js"

export async function optionTemplateRoutes(app: FastifyInstance): Promise<void> {
  // ── GET /admin/option-groups ──────────────────────────────
  // Staff only — requires valid Staff JWT.
  app.get("/api/v1/admin/option-groups", {
    schema: listOptionGroupsRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER", "ADMINISTRATOR", "MANAGER", "STAFF")],
    handler: listOptionGroupsHandler,
  })

  // ── POST /admin/option-groups ──────────────────────────────
  // Staff only — requires valid Staff JWT.
  app.post("/api/v1/admin/option-groups", {
    schema: createOptionGroupRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER", "ADMINISTRATOR", "MANAGER")],
    handler: createOptionGroupHandler,
  })

  // ── PATCH /admin/option-groups/:id ────────────────────────
  // Staff only — requires valid Staff JWT.
  app.patch("/api/v1/admin/option-groups/:id", {
    schema: updateOptionGroupRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER", "ADMINISTRATOR", "MANAGER")],
    handler: updateOptionGroupHandler,
  })

  // ── DELETE /admin/option-groups/:id ───────────────────────
  // Staff only — requires valid Staff JWT.
  app.delete("/api/v1/admin/option-groups/:id", {
    schema: deleteOptionGroupRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER", "ADMINISTRATOR", "MANAGER")],
    handler: deleteOptionGroupHandler,
  })

  // ── POST /admin/option-groups/:groupId/options ─────────────
  // Staff only — requires valid Staff JWT.
  app.post("/api/v1/admin/option-groups/:groupId/options", {
    schema: createOptionRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER", "ADMINISTRATOR", "MANAGER")],
    handler: createOptionHandler,
  })

  // ── PATCH /admin/option-groups/:groupId/options/:id ────────
  // Staff only — requires valid Staff JWT.
  app.patch("/api/v1/admin/option-groups/:groupId/options/:id", {
    schema: updateOptionRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER", "ADMINISTRATOR", "MANAGER")],
    handler: updateOptionHandler,
  })

  // ── DELETE /admin/option-groups/:groupId/options/:id ────────
  // Staff only — requires valid Staff JWT.
  app.delete("/api/v1/admin/option-groups/:groupId/options/:id", {
    schema: deleteOptionRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER", "ADMINISTRATOR", "MANAGER")],
    handler: deleteOptionHandler,
  })

  // ── GET /products/:productId/option-assignments ─────────────
  // Staff only — requires valid Staff JWT.
  app.get("/api/v1/products/:productId/option-assignments", {
    schema: listAssignmentsRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER", "ADMINISTRATOR", "MANAGER", "STAFF")],
    handler: listAssignmentsHandler,
  })

  // ── POST /products/:productId/option-assignments ──────────
  // Staff only — requires valid Staff JWT.
  app.post("/api/v1/products/:productId/option-assignments", {
    schema: assignOptionGroupRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER", "ADMINISTRATOR", "MANAGER")],
    handler: assignOptionGroupHandler,
  })

  // ── DELETE /products/:productId/option-assignments/:groupId ──
  // Staff only — requires valid Staff JWT.
  app.delete("/api/v1/products/:productId/option-assignments/:groupId", {
    schema: removeAssignmentRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER", "ADMINISTRATOR", "MANAGER")],
    handler: removeAssignmentHandler,
  })

  // ── PATCH /products/:productId/option-assignments/:groupId/overrides ──
  // Staff only — requires valid Staff JWT.
  app.patch("/api/v1/products/:productId/option-assignments/:groupId/overrides", {
    schema: setPriceOverridesRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER", "ADMINISTRATOR", "MANAGER")],
    handler: setPriceOverridesHandler,
  })

  // ── GET /products/:productId/template-options ───────────────
  // Public endpoint — no authentication required.
  // Returns all option groups (from templates) with their active options
  // for a product. Same shape as old product-options for customer app compatibility.
  app.get("/api/v1/products/:productId/template-options", {
    handler: listProductOptionsHandler,
  })
}
