/**
 * Notification module type definitions and DTOs.
 *
 * These types define the shape of data flowing between
 * controller <-> service <-> repository.
 *
 * Per 60-coding-standard.md: use interfaces for object contracts.
 * Per 90-api-rules.md: JSON properties use camelCase.
 */

// ─────────────────────────────────────────────────────────────
// DTO — Response
// ─────────────────────────────────────────────────────────────

/** Notification item in list response. */
export interface NotificationItemResponse {
  id: string
  orderId: string | null
  type: string
  channel: string
  status: string
  title: string | null
  body: string | null
  payload: Record<string, unknown> | null
  readAt: string | null
  sentAt: string | null
  createdAt: string
}

/** Notification detail response (single item). */
export interface NotificationDetailResponse extends NotificationItemResponse {
  retryCount: number
  failedAt: string | null
  errorMessage: string | null
}

/** Notification log response for admin. */
export interface NotificationLogResponse {
  id: string
  orderId: string | null
  orderNumber: string | null
  recipientLineUserId: string
  type: string
  channel: string
  status: string
  title: string | null
  body: string | null
  sentAt: string | null
  failedAt: string | null
  readAt: string | null
  retryCount: number
  errorMessage: string | null
  createdAt: string
}

/** Notification preference response. */
export interface NotificationPreferenceResponse {
  enabled: boolean
  preferredLanguage: string
  channelsEnabled: Record<string, boolean>
  typesDisabled: string[]
}

// ─────────────────────────────────────────────────────────────
// DTO — Request
// ─────────────────────────────────────────────────────────────

/** Query params for listing customer notifications. */
export interface GetNotificationsQuery {
  page?: number
  pageSize?: number
  status?: string
  type?: string
  unreadOnly?: string // "true" or "false"
}

/** Query params for admin notification logs. */
export interface GetNotificationLogsQuery {
  page?: number
  pageSize?: number
  status?: string
  type?: string
  recipientLineUserId?: string
  orderId?: string
}

/** Body for sending manual announcement. */
export interface SendAnnouncementRequest {
  recipientLineUserId?: string // if empty = broadcast to all
  title: string
  body: string
  type?: string // defaults to SYSTEM_ANNOUNCEMENT
}

/** Body for retrying a failed notification. */
export interface RetryNotificationRequest {
  notificationId: string
}

/** Body for updating notification preferences. */
export interface UpdateNotificationPreferenceRequest {
  enabled?: boolean
  preferredLanguage?: string
  channelsEnabled?: Record<string, boolean>
  typesDisabled?: string[]
}

// ─────────────────────────────────────────────────────────────
// Template placeholder data
// ─────────────────────────────────────────────────────────────

/** Data available for template placeholder replacement. */
export interface TemplatePlaceholderData {
  customerName?: string
  orderNumber?: string
  orderTotal?: string
  orderStatus?: string
  building?: string
  roomNumber?: string
  paymentAmount?: string
  [key: string]: string | undefined
}
