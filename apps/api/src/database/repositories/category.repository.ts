/**
 * Category Repository — data access for Category model.
 *
 * Handles Prisma queries for category records.
 * No business logic — only find/create/update/delete operations.
 *
 * Per 80-database-rules.md: every table uses snake_case via @@map.
 * Per 60-architecture.md: repositories access Prisma only, no business logic.
 */

import type { Prisma, Category } from "@prisma/client"

import { prisma } from "../client.js"

export class CategoryRepository {
  private readonly delegate = prisma.category

  /**
   * Find all categories ordered by displayOrder ascending.
   */
  async findAll(): Promise<Category[]> {
    return this.delegate.findMany({
      orderBy: { displayOrder: "asc" },
    })
  }

  /**
   * Find active categories only (isActive = true).
   * Ordered by displayOrder ascending.
   */
  async findActive(): Promise<Category[]> {
    return this.delegate.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    })
  }

  /**
   * Find a category by UUID with product count.
   * Returns null if not found.
   */
  async findById(id: string): Promise<Category | null> {
    return this.delegate.findUnique({
      where: { id },
    })
  }

  /**
   * Find a category by name (case-insensitive unique check).
   */
  async findByName(name: string): Promise<Category | null> {
    return this.delegate.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    })
  }

  /**
   * Create a new category.
   */
  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return this.delegate.create({ data })
  }

  /**
   * Update a category's fields.
   */
  async update(
    id: string,
    data: Prisma.CategoryUpdateInput,
  ): Promise<Category> {
    return this.delegate.update({ where: { id }, data })
  }

  /**
   * Count products linked to a category.
   * Used to validate category deletion (reject if products exist).
   */
  async countProducts(categoryId: string): Promise<number> {
    return prisma.product.count({
      where: { categoryId },
    })
  }

  /**
   * Check whether a category exists by UUID.
   */
  async exists(id: string): Promise<boolean> {
    const category = await this.delegate.findUnique({
      where: { id },
      select: { id: true },
    })
    return category !== null
  }
}
