/**
 * Cart Item Repository — data access for CartItem model.
 *
 * Handles Prisma queries for individual cart items.
 * No business logic — only CRUD operations.
 *
 * Per 152-product-options.md: "Changing an option creates a new cart configuration."
 * Same product + same options = merge (enforced by DB unique constraint on
 * [cartId, productId, optionsHash]).
 */

import type { Prisma, CartItem } from "@prisma/client"

import { prisma } from "../client.js"

export class CartItemRepository {
  private readonly delegate = prisma.cartItem

  /**
   * Find an existing cart item with matching product and options hash.
   * Used for merge detection when adding to cart.
   */
  async findExistingItem(
    cartId: string,
    productId: string,
    optionsHash: string,
  ): Promise<CartItem | null> {
    return this.delegate.findFirst({
      where: { cartId, productId, optionsHash },
    })
  }

  /**
   * Find a cart item by UUID.
   */
  async findById(id: string): Promise<CartItem | null> {
    return this.delegate.findUnique({
      where: { id },
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
    })
  }

  /**
   * Create a new cart item.
   * Uses UncheckedCreateInput for raw scalar FK fields.
   */
  async create(
    data: Prisma.CartItemUncheckedCreateInput,
  ): Promise<CartItem> {
    return this.delegate.create({ data })
  }

  /**
   * Update a cart item's fields (quantity, note, subtotal).
   */
  async update(
    id: string,
    data: Prisma.CartItemUpdateInput,
  ): Promise<CartItem> {
    return this.delegate.update({ where: { id }, data })
  }

  /**
   * Delete a single cart item by UUID.
   */
  async delete(id: string): Promise<void> {
    await this.delegate.delete({ where: { id } })
  }

  /**
   * Delete all cart items for a given cart.
   * Used when clearing the cart.
   */
  async deleteAllByCartId(cartId: string): Promise<number> {
    const result = await this.delegate.deleteMany({ where: { cartId } })
    return result.count
  }

  /**
   * Get all cart items for a given cart ID.
   */
  async findManyByCartId(cartId: string): Promise<CartItem[]> {
    return this.delegate.findMany({
      where: { cartId },
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
    })
  }

  /**
   * Count items in a cart.
   */
  async countByCartId(cartId: string): Promise<number> {
    return this.delegate.count({ where: { cartId } })
  }
}
