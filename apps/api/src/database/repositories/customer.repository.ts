/**
 * Customer Repository — data access for Customer model.
 *
 * Handles Prisma queries for customer records.
 * No business logic — only find/create/update operations.
 */

import type { Prisma, Customer } from "@prisma/client"

import { prisma } from "../client.js"

export interface CustomerQueryOptions {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export class CustomerRepository {
  private readonly delegate = prisma.customer

  /**
   * Find a customer by their LINE User ID.
   */
  async findByLineUserId(lineUserId: string): Promise<Customer | null> {
    return this.delegate.findUnique({ where: { lineUserId } })
  }

  /**
   * Find a customer by their internal UUID.
   */
  async findById(id: string): Promise<Customer | null> {
    return this.delegate.findUnique({ where: { id } })
  }

  /**
   * Create a new customer record.
   */
  async create(data: Prisma.CustomerCreateInput): Promise<Customer> {
    return this.delegate.create({ data })
  }

  /**
   * Update a customer's profile fields.
   */
  async update(
    id: string,
    data: Prisma.CustomerUpdateInput,
  ): Promise<Customer> {
    return this.delegate.update({ where: { id }, data })
  }

  /**
   * Get all customer LINE User IDs.
   * Used for broadcasting notifications.
   */
  async findAllLineUserIds(): Promise<string[]> {
    const customers = await this.delegate.findMany({
      select: { lineUserId: true },
    })
    return customers.map((c) => c.lineUserId)
  }

  /**
   * Find or create a customer by LINE User ID.
   * Returns the customer and a boolean indicating if it was newly created.
   */
  async findOrCreateByLineUserId(
    lineUserId: string,
    displayName: string,
    pictureUrl: string,
  ): Promise<{ customer: Customer; isNew: boolean }> {
    const existing = await this.findByLineUserId(lineUserId)

    if (existing) {
      return { customer: existing, isNew: false }
    }

    const customer = await this.create({
      lineUserId,
      displayName,
      pictureUrl,
    })
    return { customer: customer, isNew: true }
  }

  /**
   * List customers with pagination, search, and sort.
   * Search matches displayName or phone.
   */
  async findAll(options: CustomerQueryOptions): Promise<{ data: Customer[]; total: number }> {
    const page = options.page ?? 1
    const pageSize = options.pageSize ?? 20
    const skip = (page - 1) * pageSize

    const where: Prisma.CustomerWhereInput = {}

    if (options.search) {
      where.OR = [
        { displayName: { contains: options.search, mode: "insensitive" } },
        { phone: { contains: options.search, mode: "insensitive" } },
      ]
    }

    const sortBy = options.sortBy ?? "createdAt"
    const sortOrder = options.sortOrder ?? "desc"

    const [data, total] = await prisma.$transaction([
      this.delegate.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: pageSize,
      }),
      this.delegate.count({ where }),
    ])

    return { data, total }
  }
}
