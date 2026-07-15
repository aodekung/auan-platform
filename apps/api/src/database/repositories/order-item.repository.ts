/**
 * Order Item Repository — data access for OrderItem model.
 *
 * Handles Prisma queries for individual order line items.
 * No business logic — only CRUD operations.
 *
 * Per 153-pricing-rules.md: order items snapshot product data at order time.
 * Per 60-architecture.md: repositories access Prisma only.
 */

import type { Prisma, OrderItem } from "@prisma/client"

import { prisma } from "../client.js"

export class OrderItemRepository {
  private readonly delegate = prisma.orderItem

  /**
   * Create a new order item.
   * Uses UncheckedCreateInput for raw scalar FK fields.
   */
  async create(
    data: Prisma.OrderItemUncheckedCreateInput,
  ): Promise<OrderItem> {
    return this.delegate.create({ data })
  }

  /**
   * Create multiple order items in a batch.
   */
  async createMany(
    data: Prisma.OrderItemUncheckedCreateInput[],
  ): Promise<void> {
    if (data.length === 0) return
    await this.delegate.createMany({ data })
  }

  /**
   * Find order items by order ID.
   */
  async findByOrderId(orderId: string): Promise<OrderItem[]> {
    return this.delegate.findMany({
      where: { orderId },
      include: {
        options: {
          orderBy: { id: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    })
  }

  /**
   * Find an order item by UUID.
   */
  async findById(id: string): Promise<OrderItem | null> {
    return this.delegate.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: { id: "asc" },
        },
      },
    })
  }
}
