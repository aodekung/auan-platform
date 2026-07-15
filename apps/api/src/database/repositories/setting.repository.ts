/**
 * Setting Repository — data access for Setting model (key-value store).
 *
 * Handles Prisma queries for setting records.
 * No business logic — only find/create/update operations.
 *
 * Per 80-database-rules.md: settings use key-value pattern for flexibility.
 * Per 161-settings-management.md: settings organized by category.
 */

import type { Setting } from "@prisma/client"

import { prisma } from "../client.js"

export interface SettingEntry {
  key: string
  value: string
  category: string
  description?: string
}

export class SettingRepository {
  private readonly delegate = prisma.setting

  /**
   * Find a setting by its unique key.
   */
  async findByKey(key: string): Promise<Setting | null> {
    return this.delegate.findUnique({
      where: { key },
    })
  }

  /**
   * Find all settings in a specific category.
   */
  async findByCategory(category: string): Promise<Setting[]> {
    return this.delegate.findMany({
      where: { category },
      orderBy: { key: "asc" },
    })
  }

  /**
   * Find all settings.
   */
  async findAll(): Promise<Setting[]> {
    return this.delegate.findMany({
      orderBy: [{ category: "asc" }, { key: "asc" }],
    })
  }

  /**
   * Create or update a single setting (upsert by key).
   */
  async upsert(entry: SettingEntry): Promise<Setting> {
    return this.delegate.upsert({
      where: { key: entry.key },
      create: {
        key: entry.key,
        value: entry.value,
        category: entry.category,
        description: entry.description ?? null,
      },
      update: {
        value: entry.value,
        category: entry.category,
        ...(entry.description !== undefined && { description: entry.description }),
      },
    })
  }

  /**
   * Batch upsert multiple settings in a single transaction.
   */
  async upsertMany(entries: SettingEntry[]): Promise<void> {
    await prisma.$transaction(
      entries.map((entry) =>
        this.delegate.upsert({
          where: { key: entry.key },
          create: {
            key: entry.key,
            value: entry.value,
            category: entry.category,
            description: entry.description ?? null,
          },
          update: {
            value: entry.value,
            category: entry.category,
            ...(entry.description !== undefined && { description: entry.description }),
          },
        }),
      ),
    )
  }

  /**
   * Check whether a setting key exists.
   */
  async exists(key: string): Promise<boolean> {
    const setting = await this.delegate.findUnique({
      where: { key },
      select: { key: true },
    })
    return setting !== null
  }

  /**
   * Delete all settings in a category (for reset to defaults).
   */
  async deleteByCategory(category: string): Promise<number> {
    const result = await this.delegate.deleteMany({
      where: { category },
    })
    return result.count
  }
}
