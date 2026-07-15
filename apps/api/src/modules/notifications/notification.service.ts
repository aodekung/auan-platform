/**
 * Notification Service — business logic for the notification system.
 *
 * Responsibilities:
 * - List/get customer notifications (with ownership validation)
 * - Mark single / all as read
 * - Soft-delete (hide from user)
 * - Manage notification preferences
 * - Send manual announcements (admin)
 * - Retry failed notifications (admin)
 * - View notification logs (admin)
 * - Create notifications from business events (dispatch)
 * - Queue processing (status transitions)
 * - Preference-based filtering
 *
 * Per 60-architecture.md: business logic lives in services, NOT controllers.
 * Per 159-notification-rules.md: every notification triggered by a business event.
 * Per 150-business-rules.md: deleting a notification only hides it from the user.
 */

import { Prisma } from "@prisma/client"

import { AppError, ErrorCode } from "../../common/errors.js"
import { NotificationPreferenceRepository } from "../../database/repositories/notification-preference.repository.js"
import { NotificationRepository } from "../../database/repositories/notification.repository.js"
import { pushMessage, textMessage } from "../../lib/line-messaging.js"

import { renderTemplate } from "./notification-template.service.js"

import type {
  NotificationDetailResponse,
  NotificationItemResponse,
  NotificationLogResponse,
  NotificationPreferenceResponse,
  TemplatePlaceholderData,
  GetNotificationLogsQuery,
} from "./notification.types.js"

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

/** Default max retry count for failed notifications. */
const DEFAULT_MAX_RETRIES = 3

// ─────────────────────────────────────────────────────────────
// Repository instances (singleton per module)
// ─────────────────────────────────────────────────────────────

const notificationRepo = new NotificationRepository()
const preferenceRepo = new NotificationPreferenceRepository()

// ─────────────────────────────────────────────────────────────
// Mappers
// ─────────────────────────────────────────────────────────────

function mapToItemResponse(item: {
  id: string
  orderId: string | null
  type: string
  channel: string
  status: string
  title: string | null
  body: string | null
  payload: unknown
  readAt: Date | null
  sentAt: Date | null
  createdAt: Date
}): NotificationItemResponse {
  return {
    id: item.id,
    orderId: item.orderId,
    type: item.type,
    channel: item.channel,
    status: item.status,
    title: item.title,
    body: item.body,
    payload: item.payload as Record<string, unknown> | null,
    readAt: item.readAt?.toISOString() ?? null,
    sentAt: item.sentAt?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
  }
}

function mapToDetailResponse(item: {
  id: string
  orderId: string | null
  type: string
  channel: string
  status: string
  title: string | null
  body: string | null
  payload: unknown
  readAt: Date | null
  sentAt: Date | null
  retryCount: number
  failedAt: Date | null
  errorMessage: string | null
  createdAt: Date
}): NotificationDetailResponse {
  return {
    ...mapToItemResponse(item),
    retryCount: item.retryCount,
    failedAt: item.failedAt?.toISOString() ?? null,
    errorMessage: item.errorMessage,
  }
}

function mapToLogResponse(item: {
  id: string
  orderId: string | null
  type: string
  channel: string
  status: string
  title: string | null
  body: string | null
  payload: unknown
  readAt: Date | null
  sentAt: Date | null
  retryCount: number
  failedAt: Date | null
  errorMessage: string | null
  createdAt: Date
  recipientLineUserId: string
  order?: { id: string; orderNumber: string } | null
}): NotificationLogResponse {
  return {
    id: item.id,
    orderId: item.orderId,
    orderNumber: item.order?.orderNumber ?? null,
    recipientLineUserId: item.recipientLineUserId,
    type: item.type,
    channel: item.channel,
    status: item.status,
    title: item.title,
    body: item.body,
    sentAt: item.sentAt?.toISOString() ?? null,
    failedAt: item.failedAt?.toISOString() ?? null,
    readAt: item.readAt?.toISOString() ?? null,
    retryCount: item.retryCount,
    errorMessage: item.errorMessage,
    createdAt: item.createdAt.toISOString(),
  }
}

function mapToPreferenceResponse(pref: {
  enabled: boolean
  preferredLanguage: string
  channelsEnabled: unknown
  typesDisabled: unknown
}): NotificationPreferenceResponse {
  return {
    enabled: pref.enabled,
    preferredLanguage: pref.preferredLanguage,
    channelsEnabled: (pref.channelsEnabled ?? {}) as Record<string, boolean>,
    typesDisabled: (pref.typesDisabled ?? []) as string[],
  }
}

// ─────────────────────────────────────────────────────────────
// Customer Features
// ─────────────────────────────────────────────────────────────

/**
 * List notifications for a customer.
 * Validates ownership via lineUserId.
 * Supports filtering by status, type, and unread-only.
 */
export async function listNotifications(
  lineUserId: string,
  options: {
    page?: number
    pageSize?: number
    status?: string
    type?: string
    unreadOnly?: boolean
  },
) {
  const page = options.page ?? 1
  const pageSize = options.pageSize ?? 20

  const { data, total } = await notificationRepo.findByRecipient({
    recipientLineUserId: lineUserId,
    page,
    pageSize,
    status: options.status,
    type: options.type,
    includeRead: !options.unreadOnly,
  })

  const unreadCount = await notificationRepo.countUnread(lineUserId)

  return {
    items: data.map(mapToItemResponse),
    pagination: {
      page,
      pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    },
    unreadCount,
  }
}

/**
 * Get a single notification detail.
 * Validates ownership: the notification must belong to the requesting user.
 */
export async function getNotification(
  lineUserId: string,
  notificationId: string,
): Promise<NotificationDetailResponse> {
  const notification = await notificationRepo.findById(notificationId)

  if (!notification) {
    throw new AppError(
      404,
      ErrorCode.NOTIFICATION_NOT_FOUND,
      "Notification not found",
    )
  }

  // Ownership check: user can only see their own notifications
  if (notification.recipientLineUserId !== lineUserId) {
    throw new AppError(
      404,
      ErrorCode.NOTIFICATION_NOT_FOUND,
      "Notification not found",
    )
  }

  return mapToDetailResponse(notification)
}

/**
 * Mark a single notification as read.
 * Validates ownership before updating.
 */
export async function markAsRead(
  lineUserId: string,
  notificationId: string,
): Promise<void> {
  const notification = await notificationRepo.findById(notificationId)

  if (!notification) {
    throw new AppError(
      404,
      ErrorCode.NOTIFICATION_NOT_FOUND,
      "Notification not found",
    )
  }

  if (notification.recipientLineUserId !== lineUserId) {
    throw new AppError(
      404,
      ErrorCode.NOTIFICATION_NOT_FOUND,
      "Notification not found",
    )
  }

  if (notification.readAt) {
    // Already read — idempotent, no error
    return
  }

  await notificationRepo.markAsRead(notificationId)
}

/**
 * Mark all unread notifications as read for a customer.
 * Returns the count of notifications that were marked.
 */
export async function markAllAsRead(
  lineUserId: string,
): Promise<{ count: number }> {
  const count = await notificationRepo.markAllAsRead(lineUserId)
  return { count }
}

/**
 * Soft-delete a notification (hides from user).
 * Per 150-business-rules.md: "Deleting a notification only hides it from the user."
 * Per 159-notification-rules.md: notification history must never be deleted.
 */
export async function softDeleteNotification(
  lineUserId: string,
  notificationId: string,
): Promise<void> {
  const notification = await notificationRepo.findById(notificationId)

  if (!notification) {
    throw new AppError(
      404,
      ErrorCode.NOTIFICATION_NOT_FOUND,
      "Notification not found",
    )
  }

  if (notification.recipientLineUserId !== lineUserId) {
    throw new AppError(
      404,
      ErrorCode.NOTIFICATION_NOT_FOUND,
      "Notification not found",
    )
  }

  await notificationRepo.softDelete(notificationId)
}

// ─────────────────────────────────────────────────────────────
// Preferences
// ─────────────────────────────────────────────────────────────

/**
 * Get notification preferences for a customer.
 * Auto-creates default preferences if none exist.
 */
export async function getPreferences(
  lineUserId: string,
): Promise<NotificationPreferenceResponse> {
  const preference = await preferenceRepo.findOrCreate(lineUserId)
  return mapToPreferenceResponse(preference)
}

/**
 * Update notification preferences for a customer.
 */
export async function updatePreferences(
  lineUserId: string,
  data: {
    enabled?: boolean
    preferredLanguage?: string
    channelsEnabled?: Record<string, boolean>
    typesDisabled?: string[]
  },
): Promise<NotificationPreferenceResponse> {
  const preference = await preferenceRepo.findOrCreate(lineUserId)

  const updateData: Prisma.NotificationPreferenceUpdateInput = {}
  if (data.enabled !== undefined) updateData.enabled = data.enabled
  if (data.preferredLanguage !== undefined) updateData.preferredLanguage = data.preferredLanguage
  if (data.channelsEnabled !== undefined) updateData.channelsEnabled = data.channelsEnabled
  if (data.typesDisabled !== undefined) updateData.typesDisabled = data.typesDisabled

  const updated = await preferenceRepo.update(lineUserId, updateData)
  return mapToPreferenceResponse(updated)
}

// ─────────────────────────────────────────────────────────────
// Admin Features
// ─────────────────────────────────────────────────────────────

/**
 * View all notifications (admin).
 * Supports filtering by status, type.
 */
export async function listAllNotifications(options: {
  page?: number
  pageSize?: number
  status?: string
  type?: string
}) {
  // Reuse findByRecipient with a wildcard approach — but since admin sees all,
  // we use findLogs with no recipient filter.
  const page = options.page ?? 1
  const pageSize = options.pageSize ?? 20

  const { data, total } = await notificationRepo.findLogs({
    page,
    pageSize,
    status: options.status,
    type: options.type,
  })

  return {
    items: data.map(mapToLogResponse),
    pagination: {
      page,
      pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

/**
 * View notification logs (admin).
 * More detailed view with filtering.
 */
export async function getNotificationLogs(
  options: GetNotificationLogsQuery,
) {
  const page = options.page ?? 1
  const pageSize = options.pageSize ?? 20

  const { data, total } = await notificationRepo.findLogs({
    page,
    pageSize,
    status: options.status,
    type: options.type,
    recipientLineUserId: options.recipientLineUserId,
    orderId: options.orderId,
  })

  return {
    items: data.map(mapToLogResponse),
    pagination: {
      page,
      pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

/**
 * Retry a failed notification.
 * Validates that the notification exists, is in FAILED status,
 * and has not exceeded max retries.
 */
export async function retryNotification(
  notificationId: string,
): Promise<NotificationLogResponse> {
  const notification = await notificationRepo.findByIdIncludeDeleted(notificationId)

  if (!notification) {
    throw new AppError(
      404,
      ErrorCode.NOTIFICATION_NOT_FOUND,
      "Notification not found",
    )
  }

  if (notification.status !== "FAILED") {
    throw new AppError(
      400,
      ErrorCode.INVALID_NOTIFICATION_STATUS,
      "Only failed notifications can be retried",
    )
  }

  if (notification.retryCount >= (notification.maxRetries ?? DEFAULT_MAX_RETRIES)) {
    throw new AppError(
      400,
      ErrorCode.NOTIFICATION_RETRY_EXHAUSTED,
      "Maximum retry count exceeded",
    )
  }

  // Reset to PENDING for reprocessing
  const updated = await notificationRepo.updateStatus(
    notificationId,
    "PENDING",
    {
      errorMessage: null,
      failedAt: null,
    },
  )

  return mapToLogResponse(updated)
}

/**
 * Send a manual system announcement.
 * If recipientLineUserId is provided, sends to that user only.
 * Otherwise, broadcasts to all customers.
 *
 * Per spec: "Only Admin or Owner may send announcements."
 */
export async function sendAnnouncement(
  senderLineUserId: string,
  data: {
    recipientLineUserId?: string
    title: string
    body: string
    type?: string
  },
): Promise<{ count: number }> {
  // In MVP, announcements are stored as in-app notifications.
  // Future: integrate with LINE Messaging API for push delivery.
  const type = data.type ?? "SYSTEM_ANNOUNCEMENT"

  if (data.recipientLineUserId) {
    // Single recipient
    await notificationRepo.create({
      recipientLineUserId: data.recipientLineUserId,
      type,
      channel: "IN_APP",
      status: "PENDING",
      title: data.title,
      body: data.body,
      payload: {
        sentBy: senderLineUserId,
        isAnnouncement: true,
      },
    })
    return { count: 1 }
  }

  // Broadcast: create notification for all customers
  // Future: use a proper broadcast mechanism
  const { CustomerRepository } = await import("../../database/repositories/customer.repository.js")
  const customerRepo = new CustomerRepository()

  const customers = await customerRepo.findAllLineUserIds()
  let count = 0

  // Create notifications in batch (sequential for safety)
  for (const lineUserId of customers) {
    await notificationRepo.create({
      recipientLineUserId: lineUserId,
      type,
      channel: "IN_APP",
      status: "PENDING",
      title: data.title,
      body: data.body,
      payload: {
        sentBy: senderLineUserId,
        isAnnouncement: true,
      },
    })
    count++
  }

  return { count }
}

// ─────────────────────────────────────────────────────────────
// Dispatch — Create notifications from business events
// ─────────────────────────────────────────────────────────────

/**
 * Dispatch a notification triggered by a business event.
 *
 * Flow:
 *   1. Check recipient preferences (master toggle + type/channel).
 *   2. Render template with placeholder data.
 *   3. Create notification record in PENDING status.
 *   4. Queue processing happens asynchronously (future: external queue).
 *
 * This is the primary entry point for other modules to send notifications.
 * Called by order, payment, kitchen modules when events occur.
 */
export async function dispatchNotification(
  recipientLineUserId: string,
  type: string,
  channel: string,
  placeholderData: TemplatePlaceholderData,
  options?: {
    orderId?: string
    payload?: Record<string, unknown>
  },
): Promise<string | null> {
  // Step 1: Check preferences
  const preference = await preferenceRepo.findByLineUserId(recipientLineUserId)

  // If preferences exist and are disabled, skip
  if (preference && !preference.enabled) {
    return null
  }

  // If specific type is disabled, skip
  if (preference?.typesDisabled) {
    const typesDisabled = preference.typesDisabled as string[]
    if (Array.isArray(typesDisabled) && typesDisabled.includes(type)) {
      return null
    }
  }

  // If channel is disabled, skip
  if (preference?.channelsEnabled) {
    const channels = preference.channelsEnabled as Record<string, boolean>
    if (channels[channel] === false) {
      return null
    }
  }

  // Step 2: Render template
  const { title, body } = await renderTemplate(type, channel, placeholderData)

  // Step 3: Create notification record
  const notification = await notificationRepo.create({
    recipientLineUserId,
    type,
    channel,
    status: "PENDING",
    title,
    body,
    payload: (options?.payload ?? placeholderData) as Prisma.InputJsonValue,
    order: options?.orderId
      ? { connect: { id: options.orderId } }
      : undefined,
  })

  return notification.id
}

// ─────────────────────────────────────────────────────────────
// Queue Processing
// ─────────────────────────────────────────────────────────────

/**
 * Process the notification queue.
 * Finds all PENDING notifications and attempts to send them.
 *
 * In MVP, "sending" means marking as SENT (in-app notification).
 * Future: integrate with LINE Messaging API, email, SMS, etc.
 *
 * The architecture uses the status field in the Notification model
 * as the queue state, making it easy to replace with Redis/RabbitMQ
 * in the future by swapping this function only.
 */
export async function processQueue(): Promise<{
  processed: number
  failed: number
}> {
  // Find all PENDING notifications
  const pending = await notificationRepo.findLogs({
    status: "PENDING",
    pageSize: 100,
  })

  let processed = 0
  let failed = 0

  for (const notification of pending.data) {
    try {
      // Mark as SENDING
      await notificationRepo.updateStatus(notification.id, "SENDING")

      if (notification.channel === "LINE") {
        // LINE push notification
        try {
          await pushMessage(
            notification.recipientLineUserId,
            [textMessage(notification.body || notification.title || "")],
          )
          await notificationRepo.updateStatus(notification.id, "SENT", {
            sentAt: new Date(),
          })
          processed++
        } catch (error) {
          await notificationRepo.updateStatus(
            notification.id,
            "FAILED",
            {
              failedAt: new Date(),
              retryCount: notification.retryCount + 1,
              errorMessage: error instanceof Error ? error.message : String(error),
            },
          )
          failed++
          continue
        }
      } else {
        // Non-LINE channels: in-app notification = instant delivery
        await notificationRepo.updateStatus(notification.id, "SENT", {
          sentAt: new Date(),
        })
        processed++
      }
    } catch {
      // Mark as FAILED
      await notificationRepo.updateStatus(
        notification.id,
        "FAILED",
        {
          failedAt: new Date(),
          retryCount: notification.retryCount + 1,
          errorMessage: "Delivery failed",
        },
      )
      failed++
    }
  }

  return { processed, failed }
}

// ─────────────────────────────────────────────────────────────
// Unread Count
// ─────────────────────────────────────────────────────────────

/**
 * Get unread notification count for a customer.
 * Used by frontend to display badge.
 */
export async function getUnreadCount(
  lineUserId: string,
): Promise<number> {
  return notificationRepo.countUnread(lineUserId)
}
