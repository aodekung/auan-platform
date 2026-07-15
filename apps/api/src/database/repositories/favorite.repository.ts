/**
 * Favorite Repository — data access for Favorite model.
 *
 * Handles Prisma queries for customer favorites.
 * No business logic — only find/create/delete operations.
 */

import type { Favorite } from "@prisma/client"

import { prisma } from "../client.js"

export class FavoriteRepository {
  private readonly delegate = prisma.favorite

  /**
   * Find all favorites for a customer, ordered by most recent first.
   */
  async findByCustomerId(customerId: string): Promise<Favorite[]> {
    return this.delegate.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    })
  }

  /**
   * Find all favorites for a customer including product details.
   */
  async findByCustomerIdWithProduct(customerId: string) {
    return this.delegate.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            description: true,
            imageUrl: true,
            price: true,
            status: true,
            isAvailable: true,
            displayOrder: true,
            category: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })
  }

  /**
   * Find a specific favorite by customer and product.
   */
  async findByCustomerAndProduct(
    customerId: string,
    productId: string,
  ): Promise<Favorite | null> {
    return this.delegate.findUnique({
      where: {
        customerId_productId: { customerId, productId },
      },
    })
  }

  /**
   * Check if a product is favorited by a customer.
   */
  async exists(customerId: string, productId: string): Promise<boolean> {
    const favorite = await this.delegate.findUnique({
      where: {
        customerId_productId: { customerId, productId },
      },
      select: { id: true },
    })
    return favorite !== null
  }

  /**
   * Create a new favorite.
   */
  async create(customerId: string, productId: string): Promise<Favorite> {
    return this.delegate.create({
      data: { customerId, productId },
    })
  }

  /**
   * Delete a favorite by customer and product.
   */
  async delete(customerId: string, productId: string): Promise<void> {
    await this.delegate.delete({
      where: {
        customerId_productId: { customerId, productId },
      },
    })
  }

  /**
   * Count favorites for a customer.
   */
  async countByCustomerId(customerId: string): Promise<number> {
    return this.delegate.count({
      where: { customerId },
    })
  }
}
