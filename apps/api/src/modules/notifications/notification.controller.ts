/**
 * Notification Controller — handles HTTP request/response for notification endpoints.
 *
 * Customer endpoints: list, get, mark-read, mark-all-read, delete, preferences.
 * Admin endpoints: list-all, logs, announcement, retry.
 *
 * Per 60-coding-standard.md: Controllers parse requests, validate input,
 * delegate to services, and return responses.
 * Per 100-security-rules.md: Customers may only access their own notifications.
 */

import type { FastifyRequest, FastifyReply } from "fastify"

import { successResponse } from "../../common/response.js"
import type { JwtPayload } from "../auth/auth.types.js"

import type {
  GetNotificationLogsQuery,
  SendAnnouncementBody,
  UpdatePreferenceBody,
} from "./notification.schema.js"
import {
  getNotification,
  getNotificationLogs,
  getPreferences,
  getUnreadCount,
  listAllNotifications,
  listNotifications,
  markAllAsRead,
  markAsRead,
  retryNotification,
  sendAnnouncement,
  softDeleteNotification,
  updatePreferences,
} from "./notification.service.js"

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function getUser(request: FastifyRequest): JwtPayload {
  return request.user as unknown as JwtPayload
}

// ─────────────────────────────────────────────────────────────
// Customer Endpoints
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/v1/notifications
 * List notifications for the authenticated customer.
 */
export async function listNotificationsHandler(
  request: FastifyRequest<{
    Querystring: {
      page?: number
      pageSize?: number
      status?: string
      type?: string
      unreadOnly?: string
    }
  }>,
  reply: FastifyReply,
): Promise<void> {
  const { lineUserId } = getUser(request)
  const { page, pageSize, status, type, unreadOnly } = request.query

  const result = await listNotifications(lineUserId, {
    page,
    pageSize,
    status,
    type,
    unreadOnly: unreadOnly === "true",
  })

  void reply.code(200).send(
    successResponse(result, "Notifications retrieved successfully"),
  )
}

/**
 * GET /api/v1/notifications/:id
 * Get notification detail.
 */
export async function getNotificationHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { lineUserId } = getUser(request)
  const { id } = request.params

  const notification = await getNotification(lineUserId, id)

  void reply.code(200).send(
    successResponse(notification, "Notification retrieved successfully"),
  )
}

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark a notification as read.
 */
export async function markAsReadHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { lineUserId } = getUser(request)
  const { id } = request.params

  await markAsRead(lineUserId, id)

  void reply.code(200).send(
    successResponse(null, "Notification marked as read"),
  )
}

/**
 * PATCH /api/v1/notifications/read-all
 * Mark all notifications as read.
 */
export async function markAllAsReadHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { lineUserId } = getUser(request)

  const result = await markAllAsRead(lineUserId)

  void reply.code(200).send(
    successResponse(result, `${result.count} notifications marked as read`),
  )
}

/**
 * DELETE /api/v1/notifications/:id
 * Soft-delete a notification (hides from user).
 */
export async function deleteNotificationHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { lineUserId } = getUser(request)
  const { id } = request.params

  await softDeleteNotification(lineUserId, id)

  void reply.code(200).send(
    successResponse(null, "Notification deleted"),
  )
}

/**
 * GET /api/v1/notifications/unread-count
 * Get unread notification count.
 */
export async function getUnreadCountHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { lineUserId } = getUser(request)

  const count = await getUnreadCount(lineUserId)

  void reply.code(200).send(
    successResponse({ count }, "Unread count retrieved"),
  )
}

/**
 * GET /api/v1/notifications/preferences
 * Get notification preferences.
 */
export async function getPreferencesHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { lineUserId } = getUser(request)

  const preferences = await getPreferences(lineUserId)

  void reply.code(200).send(
    successResponse(preferences, "Preferences retrieved successfully"),
  )
}

/**
 * PATCH /api/v1/notifications/preferences
 * Update notification preferences.
 */
export async function updatePreferencesHandler(
  request: FastifyRequest<{ Body: UpdatePreferenceBody }>,
  reply: FastifyReply,
): Promise<void> {
  const { lineUserId } = getUser(request)

  const preferences = await updatePreferences(lineUserId, request.body)

  void reply.code(200).send(
    successResponse(preferences, "Preferences updated successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// Admin Endpoints
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/notifications
 * View all notifications (admin).
 */
export async function listAllNotificationsHandler(
  request: FastifyRequest<{
    Querystring: {
      page?: number
      pageSize?: number
      status?: string
      type?: string
    }
  }>,
  reply: FastifyReply,
): Promise<void> {
  const { page, pageSize, status, type } = request.query

  const result = await listAllNotifications({ page, pageSize, status, type })

  void reply.code(200).send(
    successResponse(result, "Notifications retrieved successfully"),
  )
}

/**
 * GET /api/v1/admin/notifications/logs
 * View notification logs (admin).
 */
export async function getNotificationLogsHandler(
  request: FastifyRequest<{
    Querystring: GetNotificationLogsQuery
  }>,
  reply: FastifyReply,
): Promise<void> {
  const result = await getNotificationLogs(request.query)

  void reply.code(200).send(
    successResponse(result, "Notification logs retrieved successfully"),
  )
}

/**
 * POST /api/v1/admin/notifications/announcement
 * Send a manual system announcement.
 */
export async function sendAnnouncementHandler(
  request: FastifyRequest<{ Body: SendAnnouncementBody }>,
  reply: FastifyReply,
): Promise<void> {
  const { lineUserId } = getUser(request)

  const result = await sendAnnouncement(lineUserId, request.body)

  void reply.code(201).send(
    successResponse(
      result,
      result.count === 1
        ? "Announcement sent"
        : `Announcement sent to ${result.count} customers`,
    ),
  )
}

/**
 * POST /api/v1/admin/notifications/retry
 * Retry a failed notification.
 */
export async function retryNotificationHandler(
  request: FastifyRequest<{ Body: { notificationId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { notificationId } = request.body

  const result = await retryNotification(notificationId)

  void reply.code(200).send(
    successResponse(result, "Notification queued for retry"),
  )
}
