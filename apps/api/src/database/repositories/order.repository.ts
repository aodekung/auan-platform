/**
 * Order Repository — data access for Order model.
 *
 * Handles Prisma queries for customer orders.
 * No business logic — only find/create/update operations.
 *
 * Per 60-architecture.md: repositories access Prisma only.
 * Per 158-order-status.md: all status changes are logged via history.
 */

import type { Order, Prisma } from "@prisma/client"

import { prisma } from "../client.js"

export class OrderRepository {
  private readonly delegate = prisma.order

  /**
   * Find an order by UUID.
   */
  async findById(id: string): Promise<Order | null> {
    return this.delegate.findUnique({
      where: { id },
    })
  }

  /**
   * Find an order by UUID with items (including options) and status history.
   * Used for order detail response.
   */
  async findByIdWithDetails(id: string) {
    return this.delegate.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            options: {
              orderBy: { id: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        statusHistory: {
          orderBy: { createdAt: "asc" },
        },
      },
    })
  }

  /**
   * Find an order by order number.
   */
  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.delegate.findUnique({
      where: { orderNumber },
    })
  }

  /**
   * Find the last order of a given day by order number prefix.
   * Used for generating sequential order numbers.
   */
  async findLastOrderOfToday(prefix: string): Promise<Order | null> {
    return this.delegate.findFirst({
      where: {
        orderNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        orderNumber: "desc",
      },
    })
  }

  /**
   * Create a new order.
   */
  async create(
    data: Prisma.OrderUncheckedCreateInput,
  ): Promise<Order> {
    return this.delegate.create({ data })
  }

  /**
   * Update order fields (status, paymentStatus, etc.).
   */
  async update(
    id: string,
    data: Prisma.OrderUpdateInput,
  ): Promise<Order> {
    return this.delegate.update({ where: { id }, data })
  }

  /**
   * Find orders by customer ID (paginated, filtered by status).
   * Returns orders with item count sub-query.
   */
  async findByCustomerIdPaginated(
    customerId: string,
    options: {
      status?: string
      page: number
      pageSize: number
    },
  ) {
    const { status, page, pageSize } = options
    const where: Prisma.OrderWhereInput = { customerId }
    if (status) {
      where.orderStatus = status
    }

    const [orders, total] = await Promise.all([
      this.delegate.findMany({
        where,
        include: {
          _count: {
            select: { items: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.delegate.count({ where }),
    ])

    return {
      orders,
      total,
    }
  }

  /**
   * Find all orders (admin view, paginated, filterable).
   * Returns orders with item count and customer sub-query.
   */
  async findAllPaginated(
    options: {
      status?: string
      page: number
      pageSize: number
    },
  ) {
    const { status, page, pageSize } = options
    const where: Prisma.OrderWhereInput = {}
    if (status) {
      where.orderStatus = status
    }

    const [orders, total] = await Promise.all([
      this.delegate.findMany({
        where,
        include: {
          _count: {
            select: { items: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.delegate.count({ where }),
    ])

    return {
      orders,
      total,
    }
  }
}
