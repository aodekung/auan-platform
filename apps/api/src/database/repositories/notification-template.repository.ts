/**
 * NotificationTemplate Repository — data access for NotificationTemplate model.
 *
 * Handles Prisma queries for notification templates.
 * No business logic — only data access operations.
 *
 * Per 60-architecture.md: repositories access Prisma only.
 */

import type { NotificationTemplate } from "@prisma/client"

import { prisma } from "../client.js"

export class NotificationTemplateRepository {
  private readonly delegate = prisma.notificationTemplate

  /**
   * Find a template by type and channel.
   * Returns null if not found.
   */
  async findByTypeAndChannel(
    type: string,
    channel: string,
  ): Promise<NotificationTemplate | null> {
    return this.delegate.findFirst({
      where: {
        type,
        channel,
        isActive: true,
      },
    })
  }

  /**
   * Find a template by type only (any channel).
   * Useful when channel is not specified.
   */
  async findByType(type: string): Promise<NotificationTemplate | null> {
    return this.delegate.findFirst({
      where: {
        type,
        isActive: true,
      },
    })
  }

  /**
   * Find all active templates.
   */
  async findAll(): Promise<NotificationTemplate[]> {
    return this.delegate.findMany({
      where: { isActive: true },
      orderBy: { type: "asc" },
    })
  }

  /**
   * Find all templates (including inactive) for admin.
   */
  async findAllIncludeInactive(): Promise<NotificationTemplate[]> {
    return this.delegate.findMany({
      orderBy: { type: "asc" },
    })
  }

  /**
   * Create a new template.
   */
  async create(
    data: {
      type: string
      channel?: string
      title: string
      body: string
      description?: string
    },
  ): Promise<NotificationTemplate> {
    return this.delegate.create({
      data: {
        type: data.type,
        channel: data.channel ?? "LINE",
        title: data.title,
        body: data.body,
        description: data.description,
      },
    })
  }

  /**
   * Update a template by ID.
   */
  async update(
    id: string,
    data: Partial<{
      title: string
      body: string
      channel: string
      description: string | null
      isActive: boolean
    }>,
  ): Promise<NotificationTemplate> {
    return this.delegate.update({
      where: { id },
      data,
    })
  }

  /**
   * Check whether a template exists by type and channel.
   */
  async exists(type: string, channel: string): Promise<boolean> {
    const count = await this.delegate.count({
      where: { type, channel },
    })
    return count > 0
  }
}
