/**
 * Favorites Service — business logic for customer favorites management.
 *
 * Responsibilities:
 * - List customer's favorite products
 * - Add product to favorites
 * - Remove product from favorites
 * - Check if product is favorited
 *
 * All database access goes through the repository layer.
 */

import { AppError, ErrorCode } from "../../common/errors.js"
import { FavoriteRepository } from "../../database/repositories/favorite.repository.js"
import { ProductRepository } from "../../database/repositories/product.repository.js"

import type {
  FavoriteCheckResponse,
  FavoriteResponse,
} from "./favorites.types.js"

// ─────────────────────────────────────────────────────────────
// Repository instances (singleton per module)
// ─────────────────────────────────────────────────────────────

const favoriteRepo = new FavoriteRepository()
const productRepo = new ProductRepository()

// ─────────────────────────────────────────────────────────────
// Mappers
// ─────────────────────────────────────────────────────────────

function mapFavorite(item: {
  id: string
  productId: string
  createdAt: Date
  product: {
    id: string
    name: string
    nameEn: string | null
    description: string | null
    imageUrl: string | null
    price: { toString(): string }
    status: string
    isAvailable: boolean
    displayOrder: number
    category: { id: string; name: string }
  } | null
}): FavoriteResponse {
  return {
    id: item.id,
    productId: item.productId,
    product: item.product
      ? {
          id: item.product.id,
          name: item.product.name,
          nameEn: item.product.nameEn,
          description: item.product.description,
          imageUrl: item.product.imageUrl,
          price: item.product.price.toString(),
          status: item.product.status,
          isAvailable: item.product.isAvailable,
          displayOrder: item.product.displayOrder,
          category: item.product.category,
        }
      : undefined,
    createdAt: item.createdAt.toISOString(),
  }
}

// ─────────────────────────────────────────────────────────────
// List Favorites
// ─────────────────────────────────────────────────────────────

/**
 * Get all favorited products for a customer.
 */
export async function listFavorites(customerId: string): Promise<FavoriteResponse[]> {
  const favorites = await favoriteRepo.findByCustomerIdWithProduct(customerId)
  return favorites.map(mapFavorite)
}

// ─────────────────────────────────────────────────────────────
// Check Favorite
// ─────────────────────────────────────────────────────────────

/**
 * Check if a product is in the customer's favorites.
 */
export async function checkFavorite(
  customerId: string,
  productId: string,
): Promise<FavoriteCheckResponse> {
  const exists = await favoriteRepo.exists(customerId, productId)
  return { isFavorited: exists }
}

// ─────────────────────────────────────────────────────────────
// Add Favorite
// ─────────────────────────────────────────────────────────────

/**
 * Add a product to the customer's favorites.
 *
 * Throws if:
 * - Product not found
 * - Product is not active
 * - Already favorited
 */
export async function addFavorite(
  customerId: string,
  productId: string,
): Promise<FavoriteResponse> {
  // Validate product exists and is active
  const product = await productRepo.findById(productId)
  if (!product) {
    throw new AppError(
      404,
      ErrorCode.PRODUCT_NOT_FOUND,
      "Product not found",
    )
  }

  if (product.status !== "ACTIVE") {
    throw new AppError(
      400,
      ErrorCode.PRODUCT_UNAVAILABLE,
      "Product is not available",
    )
  }

  // Check if already favorited
  const existing = await favoriteRepo.findByCustomerAndProduct(
    customerId,
    productId,
  )
  if (existing) {
    throw new AppError(
      409,
      ErrorCode.CONFLICT,
      "Product is already in favorites",
    )
  }

  const favorite = await favoriteRepo.create(customerId, productId)

  // Return with product details
  return {
    id: favorite.id,
    productId: favorite.productId,
    product: {
      id: product.id,
      name: product.name,
      nameEn: product.nameEn,
      description: product.description,
      imageUrl: product.imageUrl,
      price: product.price.toString(),
      status: product.status,
      isAvailable: product.isAvailable,
      displayOrder: product.displayOrder,
      category: product.category,
    },
    createdAt: favorite.createdAt.toISOString(),
  }
}

// ─────────────────────────────────────────────────────────────
// Remove Favorite
// ─────────────────────────────────────────────────────────────

/**
 * Remove a product from the customer's favorites.
 *
 * Throws 404 if not found in favorites.
 */
export async function removeFavorite(
  customerId: string,
  productId: string,
): Promise<void> {
  const exists = await favoriteRepo.exists(customerId, productId)
  if (!exists) {
    throw new AppError(
      404,
      ErrorCode.NOT_FOUND,
      "Product is not in favorites",
    )
  }

  await favoriteRepo.delete(customerId, productId)
}
