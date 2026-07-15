/**
 * Order Status History Repository — data access for OrderStatusHistory model.
 *
 * Handles Prisma queries for order status transition logs.
 * No business logic — only create/read operations.
 *
 * Per 158-order-status.md: every status change MUST create a history record.
 * Per 60-architecture.md: repositories access Prisma only.
 */

import type { Prisma, OrderStatusHistory } from "@prisma/client"

import { prisma } from "../client.js"

export class OrderStatusHistoryRepository {
  private readonly delegate = prisma.orderStatusHistory

  /**
   * Create a new status history entry.
   * Uses UncheckedCreateInput for raw scalar FK fields.
   */
  async create(
    data: Prisma.OrderStatusHistoryUncheckedCreateInput,
  ): Promise<OrderStatusHistory> {
    return this.delegate.create({ data })
  }

  /**
   * Find all status history entries for an order.
   * Ordered chronologically (oldest first).
   */
  async findByOrderId(orderId: string): Promise<OrderStatusHistory[]> {
    return this.delegate.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" },
    })
  }

  /**
   * Find the latest status history entry for an order.
   */
  async findLatestByOrderId(
    orderId: string,
  ): Promise<OrderStatusHistory | null> {
    return this.delegate.findFirst({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    })
  }
}
