/**
 * NotificationPreference Repository — data access for NotificationPreference model.
 *
 * Handles Prisma queries for customer notification preferences.
 * No business logic — only data access operations.
 *
 * Per 60-architecture.md: repositories access Prisma only.
 */

import type { NotificationPreference, Prisma } from "@prisma/client"

import { prisma } from "../client.js"

export class NotificationPreferenceRepository {
  private readonly delegate = prisma.notificationPreference

  /**
   * Find preference by LINE User ID.
   */
  async findByLineUserId(
    lineUserId: string,
  ): Promise<NotificationPreference | null> {
    return this.delegate.findUnique({
      where: { lineUserId },
    })
  }

  /**
   * Find or create preference for a LINE User ID.
   * If no preference exists, creates default (all enabled).
   */
  async findOrCreate(lineUserId: string): Promise<NotificationPreference> {
    const existing = await this.findByLineUserId(lineUserId)
    if (existing) return existing

    return this.delegate.create({
      data: {
        lineUserId,
        enabled: true,
        preferredLanguage: "th",
        channelsEnabled: {
          LINE: true,
          EMAIL: false,
          SMS: false,
          PUSH: false,
          IN_APP: true,
        },
        typesDisabled: [],
      },
    })
  }

  /**
   * Update preference fields.
   */
  async update(
    lineUserId: string,
    data: Prisma.NotificationPreferenceUpdateInput,
  ): Promise<NotificationPreference> {
    return this.delegate.update({
      where: { lineUserId },
      data,
    })
  }
}
