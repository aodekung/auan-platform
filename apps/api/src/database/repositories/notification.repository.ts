/**
 * Notification Repository — data access for Notification model.
 *
 * Handles Prisma queries for notification records.
 * No business logic — only data access operations.
 *
 * Per 60-architecture.md: repositories access Prisma only.
 * Per 159-notification-rules.md: notification history must never be deleted.
 */

import type { Notification, Prisma } from "@prisma/client"

import { prisma } from "../client.js"

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface FindNotificationsOptions {
  recipientLineUserId: string
  page?: number
  pageSize?: number
  status?: string
  type?: string
  includeRead?: boolean
}

export interface FindNotificationLogsOptions {
  page?: number
  pageSize?: number
  status?: string
  type?: string
  recipientLineUserId?: string
  orderId?: string
}

// ─────────────────────────────────────────────────────────────
// Repository
// ─────────────────────────────────────────────────────────────

export class NotificationRepository {
  private readonly delegate = prisma.notification

  /**
   * Find a notification by UUID.
   */
  async findById(id: string): Promise<Notification | null> {
    return this.delegate.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })
  }

  /**
   * Find a notification by UUID without soft-delete filter.
   * Used for internal operations (retry, logging).
   */
  async findByIdIncludeDeleted(id: string): Promise<Notification | null> {
    return this.delegate.findUnique({ where: { id } })
  }

  /**
   * Find notifications for a customer (paginated).
   * Excludes soft-deleted records by default.
   * Orders by createdAt descending (newest first).
   */
  async findByRecipient(
    options: FindNotificationsOptions,
  ): Promise<{ data: Notification[]; total: number }> {
    const { recipientLineUserId, page, pageSize, status, type, includeRead } = options

    const where: Prisma.NotificationWhereInput = {
      recipientLineUserId,
      deletedAt: null,
      ...(status && { status }),
      ...(type && { type }),
      ...(!includeRead && { readAt: null }),
    }

    const [data, total] = await Promise.all([
      this.delegate.findMany({
        where,
        orderBy: { createdAt: "desc" },
        ...(page && pageSize && {
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      }),
      this.delegate.count({ where }),
    ])

    return { data, total }
  }

  /**
   * Count unread notifications for a recipient.
   */
  async countUnread(recipientLineUserId: string): Promise<number> {
    return this.delegate.count({
      where: {
        recipientLineUserId,
        readAt: null,
        deletedAt: null,
      },
    })
  }

  /**
   * Find notification logs for admin (includes all records).
   * Supports filtering by status, type, recipient, order.
   */
  async findLogs(
    options: FindNotificationLogsOptions,
  ): Promise<{ data: Notification[]; total: number }> {
    const { page, pageSize, status, type, recipientLineUserId, orderId } = options

    const where: Prisma.NotificationWhereInput = {
      ...(status && { status }),
      ...(type && { type }),
      ...(recipientLineUserId && { recipientLineUserId }),
      ...(orderId && { orderId }),
    }

    const [data, total] = await Promise.all([
      this.delegate.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
            },
          },
        },
        ...(page && pageSize && {
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      }),
      this.delegate.count({ where }),
    ])

    return { data, total }
  }

  /**
   * Find failed notifications eligible for retry.
   */
  async findFailedForRetry(): Promise<Notification[]> {
    return this.delegate.findMany({
      where: {
        status: "FAILED",
        retryCount: { lt: prisma.notification.fields.maxRetries },
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    })
  }

  /**
   * Find failed notifications for retry (raw query approach
   * to compare retryCount < maxRetries).
   */
  async findEligibleForRetry(): Promise<Notification[]> {
    return this.delegate.findMany({
      where: {
        status: "FAILED",
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    })
  }

  /**
   * Create a new notification record.
   */
  async create(
    data: Prisma.NotificationCreateInput,
  ): Promise<Notification> {
    return this.delegate.create({ data })
  }

  /**
   * Mark a notification as read (set readAt).
   */
  async markAsRead(id: string): Promise<Notification | null> {
    return this.delegate.update({
      where: { id },
      data: { readAt: new Date() },
    })
  }

  /**
   * Mark all unread notifications as read for a recipient.
   */
  async markAllAsRead(
    recipientLineUserId: string,
  ): Promise<number> {
    const result = await this.delegate.updateMany({
      where: {
        recipientLineUserId,
        readAt: null,
        deletedAt: null,
      },
      data: { readAt: new Date() },
    })
    return result.count
  }

  /**
   * Soft-delete a notification (set deletedAt).
   */
  async softDelete(id: string): Promise<Notification> {
    return this.delegate.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  /**
   * Update notification status (for queue processing).
   */
  async updateStatus(
    id: string,
    status: string,
    extra?: Partial<Prisma.NotificationUpdateInput>,
  ): Promise<Notification> {
    return this.delegate.update({
      where: { id },
      data: {
        status,
        ...extra,
      },
    })
  }

  /**
   * Check whether a notification exists (not soft-deleted).
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.delegate.count({
      where: { id, deletedAt: null },
    })
    return count > 0
  }
}
