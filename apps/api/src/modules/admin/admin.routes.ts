/**
 * Admin routes — registers all /api/v1/admin/* endpoints.
 *
 * Endpoints accessible by both Owner (LINE JWT) and authorized Staff.
 * Uses authenticateOrStaff + authorizeOwnerOrAdmin middleware.
 *
 * Per 174-api-design.md: all endpoints under /api/v1 with auth middleware.
 * Per 179-api-endpoints.md: Admin endpoints require Bearer JWT.
 * Per 100-security-rules.md: authorization always enforced by backend.
 */

import type { FastifyInstance } from "fastify"

import { authenticateOrStaff, authorizeOwnerOrAdmin } from "../auth/auth.middleware.js"

import {
  dashboardHandler,
  customerListHandler,
  customerDetailHandler,
  customerOrdersHandler,
  customerToggleStatusHandler,
  staffListHandler,
  staffDetailHandler,
  createStaffHandler,
  updateStaffHandler,
  staffToggleStatusHandler,
  staffResetPasswordHandler,
  paymentListHandler,
  updateOrderStatusHandler,
  auditLogListHandler,
  systemActivityHandler,
} from "./admin.controller.js"
import {
  dashboardRouteSchema,
  customerListRouteSchema,
  customerDetailRouteSchema,
  customerOrdersRouteSchema,
  customerToggleStatusRouteSchema,
  staffListRouteSchema,
  staffDetailRouteSchema,
  createStaffRouteSchema,
  updateStaffRouteSchema,
  staffToggleStatusRouteSchema,
  staffResetPasswordRouteSchema,
  paymentListRouteSchema,
  updateOrderStatusRouteSchema,
  auditLogListRouteSchema,
  systemActivityRouteSchema,
} from "./admin.schema.js"

// Admin roles that can access all admin endpoints
const ADMIN_ROLES = ["OWNER", "ADMINISTRATOR"]

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // PreHandler chain used by most admin endpoints
  const adminAuth = [authenticateOrStaff, authorizeOwnerOrAdmin(...ADMIN_ROLES)]

  // ═══════════════════════════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════════════════════════

  app.get("/api/v1/admin/dashboard", {
    schema: dashboardRouteSchema,
    preHandler: adminAuth,
    handler: dashboardHandler,
  })

  // ═══════════════════════════════════════════════════════════════
  // CUSTOMER MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  app.get("/api/v1/admin/customers", {
    schema: customerListRouteSchema,
    preHandler: adminAuth,
    handler: customerListHandler,
  })

  app.get("/api/v1/admin/customers/:id", {
    schema: customerDetailRouteSchema,
    preHandler: adminAuth,
    handler: customerDetailHandler,
  })

  app.get("/api/v1/admin/customers/:id/orders", {
    schema: customerOrdersRouteSchema,
    preHandler: adminAuth,
    handler: customerOrdersHandler,
  })

  app.patch("/api/v1/admin/customers/:id/status", {
    schema: customerToggleStatusRouteSchema,
    preHandler: adminAuth,
    handler: customerToggleStatusHandler,
  })

  // ═══════════════════════════════════════════════════════════════
  // STAFF MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  app.get("/api/v1/admin/staff", {
    schema: staffListRouteSchema,
    preHandler: adminAuth,
    handler: staffListHandler,
  })

  app.post("/api/v1/admin/staff", {
    schema: createStaffRouteSchema,
    preHandler: adminAuth,
    handler: createStaffHandler,
  })

  app.get("/api/v1/admin/staff/:id", {
    schema: staffDetailRouteSchema,
    preHandler: adminAuth,
    handler: staffDetailHandler,
  })

  app.put("/api/v1/admin/staff/:id", {
    schema: updateStaffRouteSchema,
    preHandler: adminAuth,
    handler: updateStaffHandler,
  })

  app.patch("/api/v1/admin/staff/:id/status", {
    schema: staffToggleStatusRouteSchema,
    preHandler: adminAuth,
    handler: staffToggleStatusHandler,
  })

  app.post("/api/v1/admin/staff/:id/reset-password", {
    schema: staffResetPasswordRouteSchema,
    preHandler: adminAuth,
    handler: staffResetPasswordHandler,
  })

  // ═══════════════════════════════════════════════════════════════
  // PAYMENT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  app.get("/api/v1/admin/payments", {
    schema: paymentListRouteSchema,
    preHandler: adminAuth,
    handler: paymentListHandler,
  })

  // ═══════════════════════════════════════════════════════════════
  // ORDER MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  app.patch("/api/v1/admin/orders/:id/status", {
    schema: updateOrderStatusRouteSchema,
    preHandler: [
      authenticateOrStaff,
      authorizeOwnerOrAdmin("OWNER", "ADMINISTRATOR", "MANAGER", "KITCHEN"),
    ],
    handler: updateOrderStatusHandler,
  })

  // ═══════════════════════════════════════════════════════════════
  // AUDIT LOG
  // ═══════════════════════════════════════════════════════════════

  app.get("/api/v1/admin/audit-logs", {
    schema: auditLogListRouteSchema,
    preHandler: adminAuth,
    handler: auditLogListHandler,
  })

  app.get("/api/v1/admin/system-activity", {
    schema: systemActivityRouteSchema,
    preHandler: adminAuth,
    handler: systemActivityHandler,
  })
}
