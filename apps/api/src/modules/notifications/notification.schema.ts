/**
 * Zod validation schemas for the Notification module.
 *
 * Every request body/query is validated through these schemas
 * before reaching the service layer (per 90-api-rules.md).
 *
 * Endpoints:
 *   Customer:
 *     GET    /notifications             — List notifications
 *     GET    /notifications/:id          — Get notification detail
 *     PATCH  /notifications/:id/read     — Mark as read
 *     PATCH  /notifications/read-all     — Mark all as read
 *     DELETE /notifications/:id          — Soft-delete notification
 *     GET    /notifications/preferences  — Get preferences
 *     PATCH  /notifications/preferences  — Update preferences
 *   Admin:
 *     GET    /admin/notifications       — View all notifications
 *     GET    /admin/notifications/logs  — View notification logs
 *     POST   /admin/notifications/announcement — Send announcement
 *     POST   /admin/notifications/retry — Retry failed notification
 */

import { z } from "zod"

// ─────────────────────────────────────────────────────────────
// Common
// ─────────────────────────────────────────────────────────────

const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})

// ─────────────────────────────────────────────────────────────
// Customer Request Schemas
// ─────────────────────────────────────────────────────────────

/** GET /notifications query params */
export const getNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.string().optional(),
  type: z.string().optional(),
  unreadOnly: z.enum(["true", "false"]).optional(),
})

export type GetNotificationsQuery = z.infer<typeof getNotificationsQuerySchema>

/** GET /admin/notifications/logs query params */
export const getNotificationLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.string().optional(),
  type: z.string().optional(),
  recipientLineUserId: z.string().optional(),
  orderId: z.string().optional(),
})

export type GetNotificationLogsQuery = z.infer<typeof getNotificationLogsQuerySchema>

/** GET /notifications/:id params */
export const notificationIdParamSchema = z.object({
  id: z.string().uuid("Invalid notification ID"),
})

/** POST /admin/notifications/announcement body */
export const sendAnnouncementBodySchema = z.object({
  recipientLineUserId: z.string().optional(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must not exceed 200 characters"),
  body: z
    .string()
    .min(1, "Body is required")
    .max(1000, "Body must not exceed 1000 characters"),
  type: z.string().optional(),
})

export type SendAnnouncementBody = z.infer<typeof sendAnnouncementBodySchema>

/** POST /admin/notifications/retry body */
export const retryNotificationBodySchema = z.object({
  notificationId: z
    .string()
    .uuid("Invalid notification ID"),
})

export type RetryNotificationBody = z.infer<typeof retryNotificationBodySchema>

/** PATCH /notifications/preferences body */
export const updatePreferenceBodySchema = z.object({
  enabled: z.boolean().optional(),
  preferredLanguage: z
    .string()
    .min(2)
    .max(10)
    .optional(),
  channelsEnabled: z
    .record(z.string(), z.boolean())
    .optional(),
  typesDisabled: z.array(z.string()).optional(),
})

export type UpdatePreferenceBody = z.infer<typeof updatePreferenceBodySchema>

// ─────────────────────────────────────────────────────────────
// Response Schemas (for Swagger)
// ─────────────────────────────────────────────────────────────

const notificationItemSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid().nullable(),
  type: z.string(),
  channel: z.string(),
  status: z.string(),
  title: z.string().nullable(),
  body: z.string().nullable(),
  payload: z.record(z.string(), z.unknown()).nullable(),
  readAt: z.string().nullable(),
  sentAt: z.string().nullable(),
  createdAt: z.string(),
})

const notificationDetailSchema = notificationItemSchema.extend({
  retryCount: z.number(),
  failedAt: z.string().nullable(),
  errorMessage: z.string().nullable(),
})

const notificationLogSchema = notificationItemSchema.extend({
  orderNumber: z.string().nullable(),
  recipientLineUserId: z.string(),
  retryCount: z.number(),
  failedAt: z.string().nullable(),
  errorMessage: z.string().nullable(),
})

const preferenceSchema = z.object({
  enabled: z.boolean(),
  preferredLanguage: z.string(),
  channelsEnabled: z.record(z.string(), z.boolean()),
  typesDisabled: z.array(z.string()),
})

const paginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
})

// ─────────────────────────────────────────────────────────────
// Route Schemas
// ─────────────────────────────────────────────────────────────

const successSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  message: z.string(),
})

/** GET /api/v1/notifications */
export const getNotificationsRouteSchema = {
  description: "List customer notifications (paginated)",
  tags: ["Notifications"],
  security: [{ bearerAuth: [] }],
  querystring: getNotificationsQuerySchema,
  response: {
    200: successSchema,
    400: errorResponseSchema,
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** GET /api/v1/notifications/:id */
export const getNotificationRouteSchema = {
  description: "Get notification detail",
  tags: ["Notifications"],
  security: [{ bearerAuth: [] }],
  params: notificationIdParamSchema,
  response: {
    200: successSchema,
    401: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** PATCH /api/v1/notifications/:id/read */
export const markAsReadRouteSchema = {
  description: "Mark a notification as read",
  tags: ["Notifications"],
  security: [{ bearerAuth: [] }],
  params: notificationIdParamSchema,
  response: {
    200: successSchema,
    401: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** PATCH /api/v1/notifications/read-all */
export const markAllAsReadRouteSchema = {
  description: "Mark all notifications as read",
  tags: ["Notifications"],
  security: [{ bearerAuth: [] }],
  response: {
    200: successSchema,
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** DELETE /api/v1/notifications/:id */
export const deleteNotificationRouteSchema = {
  description: "Soft-delete a notification (hides from user)",
  tags: ["Notifications"],
  security: [{ bearerAuth: [] }],
  params: notificationIdParamSchema,
  response: {
    200: successSchema,
    401: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** GET /api/v1/notifications/preferences */
export const getPreferenceRouteSchema = {
  description: "Get notification preferences",
  tags: ["Notifications"],
  security: [{ bearerAuth: [] }],
  response: {
    200: successSchema,
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** PATCH /api/v1/notifications/preferences */
export const updatePreferenceRouteSchema = {
  description: "Update notification preferences",
  tags: ["Notifications"],
  security: [{ bearerAuth: [] }],
  body: updatePreferenceBodySchema,
  response: {
    200: successSchema,
    400: errorResponseSchema,
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** GET /api/v1/admin/notifications */
export const getAdminNotificationsRouteSchema = {
  description: "View all notifications (admin)",
  tags: ["Admin - Notifications"],
  security: [{ bearerAuth: [] }],
  querystring: getNotificationsQuerySchema,
  response: {
    200: successSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** GET /api/v1/admin/notifications/logs */
export const getNotificationLogsRouteSchema = {
  description: "View notification logs (admin)",
  tags: ["Admin - Notifications"],
  security: [{ bearerAuth: [] }],
  querystring: getNotificationLogsQuerySchema,
  response: {
    200: successSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** POST /api/v1/admin/notifications/announcement */
export const sendAnnouncementRouteSchema = {
  description: "Send a manual system announcement",
  tags: ["Admin - Notifications"],
  security: [{ bearerAuth: [] }],
  body: sendAnnouncementBodySchema,
  response: {
    201: successSchema,
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** POST /api/v1/admin/notifications/retry */
export const retryNotificationRouteSchema = {
  description: "Retry a failed notification",
  tags: ["Admin - Notifications"],
  security: [{ bearerAuth: [] }],
  body: retryNotificationBodySchema,
  response: {
    200: successSchema,
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const
