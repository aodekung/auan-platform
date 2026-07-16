/**
 * Settings routes — registers all /api/v1/settings/* endpoints.
 *
 * Endpoints:
 *   GET  /api/v1/settings/store            — Public store info
 *   GET  /api/v1/settings/business-hours   — Public business hours
 *   GET  /api/v1/admin/settings             — All settings (Owner)
 *   PUT  /api/v1/admin/settings             — Update all settings (Owner)
 *   GET  /api/v1/admin/settings/store       — Store settings (Owner)
 *   PUT  /api/v1/admin/settings/store       — Update store settings (Owner)
 *   POST /api/v1/admin/settings/store/logo  — Upload store logo (Owner)
 *   GET  /api/v1/admin/settings/business-hours — Business hours (Owner)
 *   PUT  /api/v1/admin/settings/business-hours — Update business hours (Owner)
 *   GET  /api/v1/admin/settings/payment     — Payment settings (Owner)
 *   PUT  /api/v1/admin/settings/payment     — Update payment settings (Owner)
 *   POST /api/v1/admin/settings/payment/qrcode — Upload PromptPay QR (Owner)
 *   GET  /api/v1/admin/settings/delivery    — Delivery settings (Owner)
 *   PUT  /api/v1/admin/settings/delivery    — Update delivery settings (Owner)
 *   GET  /api/v1/admin/settings/notifications — Notification settings (Owner)
 *   PUT  /api/v1/admin/settings/notifications — Update notification settings (Owner)
 *   GET  /api/v1/admin/settings/system      — System settings (Owner)
 *   PUT  /api/v1/admin/settings/system      — Update system settings (Owner)
 *   POST /api/v1/admin/settings/reset       — Reset to defaults (Owner)
 *   PATCH /api/v1/admin/settings/batch      — Batch update settings (Owner)
 *
 * Per 174-api-design.md: all endpoints under /api/v1 with auth middleware.
 * Per 179-api-endpoints.md: Owner endpoints require Bearer JWT.
 * Per 100-security-rules.md: public APIs expose only customer-required info.
 */

import type { FastifyInstance } from "fastify"

import { authenticateOrStaff, authorizeOwnerOrAdmin } from "../auth/auth.middleware.js"

import {
  getAllSettingsHandler,
  getBusinessHoursSettingsHandler,
  getDeliverySettingsHandler,
  getNotificationSettingsHandler,
  getPaymentSettingsHandler,
  getPublicBusinessHoursHandler,
  getPublicStoreHandler,
  getStoreSettingsHandler,
  getSystemSettingsHandler,
  batchUpdateSettingsHandler,
  resetSettingsHandler,
  updateAllSettingsHandler,
  updateBusinessHoursSettingsHandler,
  updateDeliverySettingsHandler,
  updateNotificationSettingsHandler,
  updatePaymentSettingsHandler,
  updateStoreSettingsHandler,
  updateSystemSettingsHandler,
  uploadPromptPayQrHandler,
  uploadStoreLogoHandler,
} from "./settings.controller.js"
import {
  getAllSettingsRouteSchema,
  getBusinessHoursRouteSchema,
  getDeliverySettingsRouteSchema,
  getNotificationSettingsRouteSchema,
  getPaymentSettingsRouteSchema,
  getPublicBusinessHoursRouteSchema,
  getPublicStoreRouteSchema,
  getStoreSettingsRouteSchema,
  getSystemSettingsRouteSchema,
  batchUpdateSettingsRouteSchema,
  resetSettingsRouteSchema,
  updateAllSettingsRouteSchema,
  updateBusinessHoursRouteSchema,
  updateDeliverySettingsRouteSchema,
  updateNotificationSettingsRouteSchema,
  updatePaymentSettingsRouteSchema,
  updateStoreSettingsRouteSchema,
  updateSystemSettingsRouteSchema,
  uploadPromptPayQrRouteSchema,
  uploadStoreLogoRouteSchema,
} from "./settings.schema.js"

export async function settingsRoutes(app: FastifyInstance): Promise<void> {
  // ═══════════════════════════════════════════════════════════════
  // PUBLIC ENDPOINTS
  // ═══════════════════════════════════════════════════════════════

  // ── GET /settings/store ───────────────────────────────────
  app.get("/api/v1/settings/store", {
    schema: getPublicStoreRouteSchema,
    handler: getPublicStoreHandler,
  })

  // ── GET /settings/business-hours ──────────────────────────
  app.get("/api/v1/settings/business-hours", {
    schema: getPublicBusinessHoursRouteSchema,
    handler: getPublicBusinessHoursHandler,
  })

  // ═══════════════════════════════════════════════════════════════
  // ADMIN ENDPOINTS — All Settings
  // ═══════════════════════════════════════════════════════════════

  // ── GET /admin/settings ───────────────────────────────────
  app.get("/api/v1/admin/settings", {
    schema: getAllSettingsRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER")],
    handler: getAllSettingsHandler,
  })

  // ── PUT /admin/settings ───────────────────────────────────
  app.put("/api/v1/admin/settings", {
    schema: updateAllSettingsRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER")],
    handler: updateAllSettingsHandler,
  })

  // ── POST /admin/settings/reset ───────────────────────────
  app.post("/api/v1/admin/settings/reset", {
    schema: resetSettingsRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER")],
    handler: resetSettingsHandler,
  })

  // ── PATCH /admin/settings/batch ─────────────────────────
  app.patch("/api/v1/admin/settings/batch", {
    schema: batchUpdateSettingsRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER")],
    handler: batchUpdateSettingsHandler,
  })

  // ═══════════════════════════════════════════════════════════════
  // ADMIN ENDPOINTS — Store Settings
  // ═══════════════════════════════════════════════════════════════

  // ── GET /admin/settings/store ─────────────────────────────
  app.get("/api/v1/admin/settings/store", {
    schema: getStoreSettingsRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER")],
    handler: getStoreSettingsHandler,
  })

  // ── PUT /admin/settings/store ──────────────────────────────
  app.put("/api/v1/admin/settings/store", {
    schema: updateStoreSettingsRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER")],
    handler: updateStoreSettingsHandler,
  })

  // ── POST /admin/settings/store/logo ────────────────────────
  app.post("/api/v1/admin/settings/store/logo", {
    schema: uploadStoreLogoRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER")],
    handler: uploadStoreLogoHandler,
  })

  // ═══════════════════════════════════════════════════════════════
  // ADMIN ENDPOINTS — Business Hours Settings
  // ═══════════════════════════════════════════════════════════════

  // ── GET /admin/settings/business-hours ────────────────────
  app.get("/api/v1/admin/settings/business-hours", {
    schema: getBusinessHoursRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER")],
    handler: getBusinessHoursSettingsHandler,
  })

  // ── PUT /admin/settings/business-hours ────────────────────
  app.put("/api/v1/admin/settings/business-hours", {
    schema: updateBusinessHoursRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER")],
    handler: updateBusinessHoursSettingsHandler,
  })

  // ═══════════════════════════════════════════════════════════════
  // ADMIN ENDPOINTS — Payment Settings
  // ═══════════════════════════════════════════════════════════════

  // ── GET /admin/settings/payment ────────────────────────────
  app.get("/api/v1/admin/settings/payment", {
    schema: getPaymentSettingsRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER")],
    handler: getPaymentSettingsHandler,
  })

  // ── PUT /admin/settings/payment ────────────────────────────
  app.put("/api/v1/admin/settings/payment", {
    schema: updatePaymentSettingsRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER")],
    handler: updatePaymentSettingsHandler,
  })

  // ── POST /admin/settings/payment/qrcode ──────────────────
  app.post("/api/v1/admin/settings/payment/qrcode", {
    schema: uploadPromptPayQrRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER")],
    handler: uploadPromptPayQrHandler,
  })

  // ═══════════════════════════════════════════════════════════════
  // ADMIN ENDPOINTS — Delivery Settings
  // ═══════════════════════════════════════════════════════════════

  // ── GET /admin/settings/delivery ──────────────────────────
  app.get("/api/v1/admin/settings/delivery", {
    schema: getDeliverySettingsRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER")],
    handler: getDeliverySettingsHandler,
  })

  // ── PUT /admin/settings/delivery ──────────────────────────
  app.put("/api/v1/admin/settings/delivery", {
    schema: updateDeliverySettingsRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER")],
    handler: updateDeliverySettingsHandler,
  })

  // ═══════════════════════════════════════════════════════════════
  // ADMIN ENDPOINTS — Notification Settings
  // ═══════════════════════════════════════════════════════════════

  // ── GET /admin/settings/notifications ──────────────────────
  app.get("/api/v1/admin/settings/notifications", {
    schema: getNotificationSettingsRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER")],
    handler: getNotificationSettingsHandler,
  })

  // ── PUT /admin/settings/notifications ──────────────────────
  app.put("/api/v1/admin/settings/notifications", {
    schema: updateNotificationSettingsRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER")],
    handler: updateNotificationSettingsHandler,
  })

  // ═══════════════════════════════════════════════════════════════
  // ADMIN ENDPOINTS — System Settings
  // ═══════════════════════════════════════════════════════════════

  // ── GET /admin/settings/system ───────────────────────────
  app.get("/api/v1/admin/settings/system", {
    schema: getSystemSettingsRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER")],
    handler: getSystemSettingsHandler,
  })

  // ── PUT /admin/settings/system ────────────────────────────
  app.put("/api/v1/admin/settings/system", {
    schema: updateSystemSettingsRouteSchema,
    preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin("OWNER")],
    handler: updateSystemSettingsHandler,
  })
}
