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
  deleteStaffHandler,
  paymentListHandler,
  paymentDetailHandler,
  orderListHandler,
  orderDetailHandler,
  updateOrderStatusHandler,
  auditLogListHandler,
  systemActivityHandler,
} from "./admin.controller.js"
import { verifyPaymentHandler, rejectPaymentHandler } from "../payments/payments.controller.js"
import {
  listProductsHandler,
  listAdminProductsHandler,
  getProductHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  uploadProductImageHandler,
} from "../products/products.controller.js"
import {
  listOptionGroupsHandler,
  createOptionGroupHandler,
  updateOptionGroupHandler,
  deleteOptionGroupHandler,
  createOptionHandler,
  updateOptionHandler,
  disableOptionHandler,
} from "../product-options/product-options.controller.js"
import {
  listCategoriesHandler,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from "../categories/categories.controller.js"
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
  paymentDetailRouteSchema,
  orderListRouteSchema,
  orderDetailRouteSchema,
  updateOrderStatusRouteSchema,
  auditLogListRouteSchema,
  systemActivityRouteSchema,
} from "./admin.schema.js"
import { verifyPaymentRouteSchema, rejectPaymentRouteSchema } from "../payments/payments.schema.js"
import {
  listProductsRouteSchema,
  getProductRouteSchema,
  createProductRouteSchema,
  updateProductRouteSchema,
  deleteProductRouteSchema,
  adminProductQuerySchema,
} from "../products/products.schema.js"
import {
  listCategoriesRouteSchema,
  createCategoryRouteSchema,
  updateCategoryRouteSchema,
  deleteCategoryRouteSchema,
} from "../categories/categories.schema.js"

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

  app.delete("/api/v1/admin/staff/:id", {
    preHandler: adminAuth,
    handler: deleteStaffHandler,
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

  app.get("/api/v1/admin/payments/:id", {
    schema: paymentDetailRouteSchema,
    preHandler: adminAuth,
    handler: paymentDetailHandler,
  })

  app.post("/api/v1/admin/payments/:id/verify", {
    schema: verifyPaymentRouteSchema,
    preHandler: adminAuth,
    handler: verifyPaymentHandler,
  })

  app.post("/api/v1/admin/payments/:id/reject", {
    schema: rejectPaymentRouteSchema,
    preHandler: adminAuth,
    handler: rejectPaymentHandler,
  })

  // ═══════════════════════════════════════════════════════════════
  // ORDER MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  app.get("/api/v1/admin/orders", {
    schema: orderListRouteSchema,
    preHandler: adminAuth,
    handler: orderListHandler,
  })

  app.get("/api/v1/admin/orders/:id", {
    schema: orderDetailRouteSchema,
    preHandler: adminAuth,
    handler: orderDetailHandler,
  })

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

  // ═══════════════════════════════════════════════════════════════
  // PRODUCT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  app.get("/api/v1/admin/products", {
    schema: {
      description: "Get product list with status filter (Admin)",
      tags: ["Admin Products"],
      querystring: adminProductQuerySchema,
      response: listProductsRouteSchema.response,
    },
    preHandler: adminAuth,
    handler: listAdminProductsHandler,
  })

  app.get("/api/v1/admin/products/:id", {
    schema: getProductRouteSchema,
    preHandler: adminAuth,
    handler: getProductHandler,
  })

  app.post("/api/v1/admin/products", {
    schema: createProductRouteSchema,
    preHandler: adminAuth,
    handler: createProductHandler,
  })

  app.patch("/api/v1/admin/products/:id", {
    schema: updateProductRouteSchema,
    preHandler: adminAuth,
    handler: updateProductHandler,
  })

  app.delete("/api/v1/admin/products/:id", {
    schema: deleteProductRouteSchema,
    preHandler: adminAuth,
    handler: deleteProductHandler,
  })

  app.post("/api/v1/admin/products/:id/image", {
    preHandler: adminAuth,
    handler: uploadProductImageHandler,
  })

  // ═══════════════════════════════════════════════════════════════
  // PRODUCT OPTION MANAGEMENT (Admin)
  // ═══════════════════════════════════════════════════════════════

  app.get("/api/v1/admin/products/:productId/options", {
    preHandler: adminAuth,
    handler: listOptionGroupsHandler,
  })

  app.post("/api/v1/admin/products/:productId/options", {
    preHandler: adminAuth,
    handler: createOptionGroupHandler,
  })

  app.patch("/api/v1/admin/product-options/:id", {
    preHandler: adminAuth,
    handler: updateOptionGroupHandler,
  })

  app.delete("/api/v1/admin/product-options/:id", {
    preHandler: adminAuth,
    handler: deleteOptionGroupHandler,
  })

  app.post("/api/v1/admin/product-options/:groupId/options", {
    preHandler: adminAuth,
    handler: createOptionHandler,
  })

  app.patch("/api/v1/admin/product-options/:groupId/options/:id", {
    preHandler: adminAuth,
    handler: updateOptionHandler,
  })

  app.delete("/api/v1/admin/product-options/:groupId/options/:id", {
    preHandler: adminAuth,
    handler: disableOptionHandler,
  })

  // ═══════════════════════════════════════════════════════════════
  // CATEGORY MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  app.get("/api/v1/admin/categories", {
    schema: listCategoriesRouteSchema,
    preHandler: adminAuth,
    handler: listCategoriesHandler,
  })

  app.post("/api/v1/admin/categories", {
    schema: createCategoryRouteSchema,
    preHandler: adminAuth,
    handler: createCategoryHandler,
  })

  app.patch("/api/v1/admin/categories/:id", {
    schema: updateCategoryRouteSchema,
    preHandler: adminAuth,
    handler: updateCategoryHandler,
  })

  app.delete("/api/v1/admin/categories/:id", {
    schema: deleteCategoryRouteSchema,
    preHandler: adminAuth,
    handler: deleteCategoryHandler,
  })
}
