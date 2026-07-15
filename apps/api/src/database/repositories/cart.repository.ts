/**
 * Cart Repository — data access for Cart model.
 *
 * Handles Prisma queries for customer shopping carts.
 * No business logic — only find/create operations.
 *
 * Per 150-business-rules.md: one cart per customer, cleared after payment.
 * Per 60-architecture.md: repositories access Prisma only.
 */

import type { Cart } from "@prisma/client"

import { prisma } from "../client.js"

export class CartRepository {
  private readonly delegate = prisma.cart

  /**
   * Find a cart by customer ID.
   * Returns null if the customer has no cart yet.
   */
  async findByCustomerId(customerId: string): Promise<Cart | null> {
    return this.delegate.findUnique({
      where: { customerId },
    })
  }

  /**
   * Find or create a cart for a customer.
   * If no cart exists, creates a new empty cart.
   */
  async findOrCreateByCustomerId(customerId: string): Promise<Cart> {
    const existing = await this.findByCustomerId(customerId)
    if (existing) return existing

    return this.delegate.create({ data: { customerId } })
  }

  /**
   * Check whether a cart exists by UUID.
   */
  async exists(id: string): Promise<boolean> {
    const cart = await this.delegate.findUnique({
      where: { id },
      select: { id: true },
    })
    return cart !== null
  }

  /**
   * Check whether a customer has a cart.
   */
  async existsByCustomerId(customerId: string): Promise<boolean> {
    const cart = await this.delegate.findUnique({
      where: { customerId },
      select: { id: true },
    })
    return cart !== null
  }

  /**
   * Find cart by customer ID including items and product relations.
   * Used for building the full cart response.
   */
  async findWithItems(customerId: string) {
    return this.delegate.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                price: true,
                status: true,
                isAvailable: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })
  }
}
