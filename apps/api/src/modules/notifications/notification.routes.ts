/**
 * Notification routes — registers all notification endpoints.
 *
 * Customer endpoints (under /api/v1/notifications):
 *   GET    /notifications                — List notifications (paginated)
 *   GET    /notifications/:id           — Get notification detail
 *   PATCH  /notifications/:id/read      — Mark as read
 *   PATCH  /notifications/read-all      — Mark all as read
 *   DELETE /notifications/:id          — Soft-delete notification
 *   GET    /notifications/unread-count — Get unread count
 *   GET    /notifications/preferences — Get preferences
 *   PATCH  /notifications/preferences — Update preferences
 *
 * Admin endpoints (under /api/v1/admin/notifications):
 *   GET    /admin/notifications             — View all notifications
 *   GET    /admin/notifications/logs        — View notification logs
 *   POST   /admin/notifications/announcement — Send announcement
 *   POST   /admin/notifications/retry      — Retry failed notification
 *
 * Per 179-api-endpoints.md: all notification endpoints require authentication.
 * Per 100-security-rules.md: customers access only their own notifications.
 * Per 150-business-rules.md: only admin/owner may send announcements.
 */

import type { FastifyInstance } from "fastify"

import { authenticate, authorize } from "../auth/auth.middleware.js"

import {
  deleteNotificationHandler,
  getNotificationHandler,
  getNotificationLogsHandler,
  getPreferencesHandler,
  getUnreadCountHandler,
  listAllNotificationsHandler,
  listNotificationsHandler,
  markAllAsReadHandler,
  markAsReadHandler,
  retryNotificationHandler,
  sendAnnouncementHandler,
  updatePreferencesHandler,
} from "./notification.controller.js"
import {
  deleteNotificationRouteSchema,
  getAdminNotificationsRouteSchema,
  getNotificationLogsRouteSchema,
  getNotificationRouteSchema,
  getNotificationsRouteSchema,
  getPreferenceRouteSchema,
  markAllAsReadRouteSchema,
  markAsReadRouteSchema,
  retryNotificationRouteSchema,
  sendAnnouncementRouteSchema,
  updatePreferenceRouteSchema,
} from "./notification.schema.js"

// ─────────────────────────────────────────────────────────────
// Customer Routes
// ─────────────────────────────────────────────────────────────

function registerCustomerRoutes(app: FastifyInstance): void {
  // ── GET /notifications ─────────────────────────────────
  app.get("/api/v1/notifications", {
    schema: getNotificationsRouteSchema,
    preHandler: [authenticate],
    handler: listNotificationsHandler,
  })

  // ── GET /notifications/:id ──────────────────────────────
  app.get("/api/v1/notifications/:id", {
    schema: getNotificationRouteSchema,
    preHandler: [authenticate],
    handler: getNotificationHandler,
  })

  // ── PATCH /notifications/:id/read ──────────────────────
  app.patch("/api/v1/notifications/:id/read", {
    schema: markAsReadRouteSchema,
    preHandler: [authenticate],
    handler: markAsReadHandler,
  })

  // ── PATCH /notifications/read-all ───────────────────────
  app.patch("/api/v1/notifications/read-all", {
    schema: markAllAsReadRouteSchema,
    preHandler: [authenticate],
    handler: markAllAsReadHandler,
  })

  // ── DELETE /notifications/:id ────────────────────────────
  app.delete("/api/v1/notifications/:id", {
    schema: deleteNotificationRouteSchema,
    preHandler: [authenticate],
    handler: deleteNotificationHandler,
  })

  // ── GET /notifications/unread-count ────────────────────
  app.get("/api/v1/notifications/unread-count", {
    schema: {
      description: "Get unread notification count",
      tags: ["Notifications"],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean", const: true },
            data: { type: "object", properties: { count: { type: "number" } } },
            message: { type: "string" },
          },
        },
      },
    } as const,
    preHandler: [authenticate],
    handler: getUnreadCountHandler,
  })

  // ── GET /notifications/preferences ────────────────────
  app.get("/api/v1/notifications/preferences", {
    schema: getPreferenceRouteSchema,
    preHandler: [authenticate],
    handler: getPreferencesHandler,
  })

  // ── PATCH /notifications/preferences ───────────────────
  app.patch("/api/v1/notifications/preferences", {
    schema: updatePreferenceRouteSchema,
    preHandler: [authenticate],
    handler: updatePreferencesHandler,
  })
}

// ─────────────────────────────────────────────────────────────
// Admin Routes
// ─────────────────────────────────────────────────────────────

function registerAdminRoutes(app: FastifyInstance): void {
  // ── GET /admin/notifications ────────────────────────────
  app.get("/api/v1/admin/notifications", {
    schema: getAdminNotificationsRouteSchema,
    preHandler: [authenticate, authorize("OWNER")],
    handler: listAllNotificationsHandler,
  })

  // ── GET /admin/notifications/logs ───────────────────────
  app.get("/api/v1/admin/notifications/logs", {
    schema: getNotificationLogsRouteSchema,
    preHandler: [authenticate, authorize("OWNER")],
    handler: getNotificationLogsHandler,
  })

  // ── POST /admin/notifications/announcement ──────────────
  app.post("/api/v1/admin/notifications/announcement", {
    schema: sendAnnouncementRouteSchema,
    preHandler: [authenticate, authorize("OWNER")],
    handler: sendAnnouncementHandler,
  })

  // ── POST /admin/notifications/retry ────────────────────
  app.post("/api/v1/admin/notifications/retry", {
    schema: retryNotificationRouteSchema,
    preHandler: [authenticate, authorize("OWNER")],
    handler: retryNotificationHandler,
  })
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/**
 * Register all notification routes on the Fastify instance.
 */
export async function notificationRoutes(app: FastifyInstance): Promise<void> {
  registerCustomerRoutes(app)
  registerAdminRoutes(app)
  app.log.info("Notification module registered")
}
