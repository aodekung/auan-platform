/**
 * Product Repository — data access for Product model.
 *
 * Handles Prisma queries for product records.
 * No business logic — only find/create/update/count operations.
 *
 * Per 80-database-rules.md: price uses Decimal(10,2), never float.
 * Per 60-architecture.md: repositories access Prisma only, no business logic.
 */

import type { Prisma, Product } from "@prisma/client"

import { prisma } from "../client.js"

// ─────────────────────────────────────────────────────────────
// Query Options
// ─────────────────────────────────────────────────────────────

export interface ProductQueryOptions {
  categoryId?: string
  search?: string
  status?: string
  isAvailable?: boolean
  sort?: string
  order?: "asc" | "desc"
  page?: number
  pageSize?: number
}

export interface ProductListResult {
  data: Product[]
  total: number
}

// ─────────────────────────────────────────────────────────────
// Sort field mapping
// ─────────────────────────────────────────────────────────────

const SORT_FIELDS = {
  displayOrder: "displayOrder",
  price: "price",
  name: "name",
  createdAt: "createdAt",
} as const

type SortField = keyof typeof SORT_FIELDS

function isValidSortField(field: string): field is SortField {
  return field in SORT_FIELDS
}

function buildOrderBy(
  sort: string,
  order: "asc" | "desc",
): Prisma.ProductOrderByWithRelationInput {
  const field = isValidSortField(sort) ? SORT_FIELDS[sort] : "displayOrder"
  return { [field]: order }
}

// ─────────────────────────────────────────────────────────────
// Repository
// ─────────────────────────────────────────────────────────────

export class ProductRepository {
  private readonly delegate = prisma.product

  /**
   * Find products with filtering, sorting, and pagination.
   * Returns data array and total count for pagination calculation.
   */
  async findMany(
    options: ProductQueryOptions,
  ): Promise<ProductListResult> {
    const { categoryId, search, status, isAvailable, sort, order } = options
    const page = options.page ?? 1
    const pageSize = options.pageSize ?? 20

    // Build where clause
    const where: Prisma.ProductWhereInput = {}

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nameEn: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status) {
      where.status = status as "ACTIVE" | "DISABLED"
    }

    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable
    }

    const orderBy = buildOrderBy(sort ?? "displayOrder", order ?? "asc")

    const [data, total] = await Promise.all([
      this.delegate.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.delegate.count({ where }),
    ])

    return { data, total }
  }

  /**
   * Find active products only (status = ACTIVE) with filtering/sort/pagination.
   * Used for customer-facing product list.
   */
  async findActive(
    options: ProductQueryOptions,
  ): Promise<ProductListResult> {
    return this.findMany({
      ...options,
      status: "ACTIVE",
    })
  }

  /**
   * Find a product by UUID including its category relation.
   * Returns null if not found.
   *
   * The return type includes the category relation for detail views.
   */
  async findById(
    id: string,
  ): Promise<
    | (Product & {
        category: { id: string; name: string }
      })
    | null
  > {
    return this.delegate.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true } } },
    })
  }

  /**
   * Find a product by SKU (unique check).
   */
  async findBySku(sku: string): Promise<Product | null> {
    return this.delegate.findUnique({ where: { sku } })
  }

  /**
   * Find a product by name (case-insensitive unique check).
   */
  async findByName(name: string): Promise<Product | null> {
    return this.delegate.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    })
  }

  /**
   * Create a new product.
   * Uses UncheckedCreateInput so we can pass the raw scalar FK (categoryId).
   */
  async create(
    data: Prisma.ProductUncheckedCreateInput,
  ): Promise<Product> {
    return this.delegate.create({ data })
  }

  /**
   * Update a product's fields.
   */
  async update(
    id: string,
    data: Prisma.ProductUpdateInput,
  ): Promise<Product> {
    return this.delegate.update({ where: { id }, data })
  }

  /**
   * Count products matching a where clause.
   * Used for pagination and validation.
   */
  async count(where?: Prisma.ProductWhereInput): Promise<number> {
    return this.delegate.count({ where })
  }

  /**
   * Check whether a product exists by UUID.
   */
  async exists(id: string): Promise<boolean> {
    const product = await this.delegate.findUnique({
      where: { id },
      select: { id: true },
    })
    return product !== null
  }
}
