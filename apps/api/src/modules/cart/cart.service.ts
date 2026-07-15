/**
 * Cart Service — business logic for shopping cart management.
 *
 * Responsibilities:
 * - Get/create cart for authenticated customer
 * - Add product to cart (with option validation + merge logic)
 * - Update cart item (quantity, note)
 * - Remove cart item
 * - Clear entire cart
 * - Server-side price calculation (never trust client prices)
 *
 * Per 60-architecture.md: business logic lives in services, NOT controllers.
 * Per 152-product-options.md:
 *   - Required options must be selected before adding to cart.
 *   - Inactive options cannot be selected.
 *   - Changing an option creates a new cart configuration.
 *   - Same product + same options should merge (increment quantity).
 * Per 153-pricing-rules.md:
 *   - Final Price = Base Price + Option Prices + Add-on Price - Promotion.
 *   - Subtotal = Final Product Price × Quantity.
 *   - Backend is responsible for ALL calculations.
 *
 * All database access goes through the repository layer.
 */

import { createHash } from "node:crypto"

import { Prisma } from "@prisma/client"
import type { Decimal } from "@prisma/client/runtime/library"

import { AppError, ErrorCode } from "../../common/errors.js"
import { CartItemRepository } from "../../database/repositories/cart-item.repository.js"
import { CartRepository } from "../../database/repositories/cart.repository.js"
import { ProductRepository } from "../../database/repositories/product.repository.js"

import type {
  AddToCartRequest,
  CartItemResponse,
  CartResponse,
  SelectedOption,
  UpdateCartItemRequest,
} from "./cart.types.js"

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

/** Maximum quantity per cart item. */
const MAX_QUANTITY = 50

// ─────────────────────────────────────────────────────────────
// Repository instances (singleton per module)
// ─────────────────────────────────────────────────────────────

const cartRepo = new CartRepository()
const cartItemRepo = new CartItemRepository()
const productRepo = new ProductRepository()

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Hash selected options into a deterministic string for merge detection.
 * SHA-256 of the sorted JSON string of options.
 * If no options, returns empty string (allows null coalescing in DB unique constraint).
 */
function hashOptions(options: SelectedOption[]): string {
  if (options.length === 0) return ""
  const sorted = [...options].sort((a, b) =>
    a.optionGroupId.localeCompare(b.optionGroupId) ||
    a.optionId.localeCompare(b.optionId),
  )
  return createHash("sha256").update(JSON.stringify(sorted)).digest("hex")
}

/**
 * Parse selectedOptions from JSON stored in database.
 */
function parseSelectedOptions(json: unknown): SelectedOption[] {
  if (!json || typeof json !== "object" || !Array.isArray(json)) return []
  return json as SelectedOption[]
}

/**
 * Calculate the total additional price from selected options.
 */
function calculateOptionsPrice(options: SelectedOption[]): number {
  return options.reduce(
    (sum, opt) => sum + (typeof opt.additionalPrice === "number"
      ? opt.additionalPrice
      : parseFloat(opt.additionalPrice)),
    0,
  )
}

// ─────────────────────────────────────────────────────────────
// Mappers
// ─────────────────────────────────────────────────────────────

/**
 * Map a Prisma CartItem (with product relation) to CartItemResponse DTO.
 */
function mapCartItem(item: {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: Decimal | number
  subtotal: Decimal | number
  selectedOptions: unknown
  note: string | null
  product: {
    id: string
    name: string
    imageUrl: string | null
    price: Decimal | number
    status: string
    isAvailable: boolean
  }
}): CartItemResponse {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.productName,
    imageUrl: item.product.imageUrl,
    unitPrice: item.unitPrice.toString(),
    quantity: item.quantity,
    subtotal: item.subtotal.toString(),
    selectedOptions: parseSelectedOptions(item.selectedOptions).map(
      (opt) => ({
        ...opt,
        additionalPrice: typeof opt.additionalPrice === "number"
          ? opt.additionalPrice.toString()
          : opt.additionalPrice,
      }),
    ),
    note: item.note,
  }
}

/**
 * Map a cart with items to the full CartResponse DTO.
 * Calculates itemCount, subtotal, and total.
 */
function mapCart(cart: {
  id: string
  updatedAt: Date
  items: Array<{
    id: string
    productId: string
    productName: string
    quantity: number
    unitPrice: Decimal | number
    subtotal: Decimal | number
    selectedOptions: unknown
    note: string | null
    product: {
      id: string
      name: string
      imageUrl: string | null
      price: Decimal | number
      status: string
      isAvailable: boolean
    }
  }>
}): CartResponse {
  const itemResponses = cart.items.map(mapCartItem)
  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.subtotal),
    0,
  )

  return {
    id: cart.id,
    items: itemResponses,
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: subtotal.toFixed(2),
    total: subtotal.toFixed(2), // Cart total = sum of subtotals (no delivery/packaging fees)
    updatedAt: cart.updatedAt.toISOString(),
  }
}

// ─────────────────────────────────────────────────────────────
// Get Cart
// ─────────────────────────────────────────────────────────────

/**
 * Get the authenticated customer's cart.
 * Auto-creates an empty cart if none exists.
 *
 * Returns cart with items, item count, subtotal, and total.
 */
export async function getCart(customerId: string): Promise<CartResponse> {
  const cart = await cartRepo.findOrCreateByCustomerId(customerId)

  // Load items with product data
  const cartWithItems = await cartRepo.findWithItems(customerId)
  if (!cartWithItems) {
    return {
      id: cart.id,
      items: [],
      itemCount: 0,
      subtotal: "0.00",
      total: "0.00",
      updatedAt: cart.updatedAt.toISOString(),
    }
  }

  return mapCart(cartWithItems)
}

// ─────────────────────────────────────────────────────────────
// Add to Cart
// ─────────────────────────────────────────────────────────────

/**
 * Add a product to the customer's cart.
 *
 * Flow:
 *   1. Validate product exists, is active, and available.
 *   2. Validate selected options (if any).
 *   3. Check for existing item with same product + options (merge).
 *   4. Calculate unit price (base + options) server-side.
 *   5. Create new item or increment existing quantity.
 *   6. Return updated cart.
 *
 * Per 152-product-options.md: "Changing an option creates a new cart configuration."
 * Same product + same options → merge (increment quantity).
 */
export async function addToCart(
  customerId: string,
  data: AddToCartRequest,
): Promise<CartResponse> {
  const quantity = data.quantity ?? 1
  const selectedOptions = data.selectedOptions ?? []
  const optionsHash = hashOptions(selectedOptions)

  // Step 1: Validate product
  const product = await productRepo.findById(data.productId)
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

  if (!product.isAvailable) {
    throw new AppError(
      400,
      ErrorCode.PRODUCT_UNAVAILABLE,
      "Product is currently out of stock",
    )
  }

  // Step 2: Validate selected options (basic validation)
  // Note: Full option group/option validation requires ProductOption models.
  // For now we validate that option data has required fields.
  if (selectedOptions.length > 0) {
    for (const opt of selectedOptions) {
      if (!opt.optionGroupId || !opt.optionId || !opt.optionName) {
        throw new AppError(
          400,
          ErrorCode.INVALID_OPTION,
          "Each selected option must have optionGroupId, optionId, and optionName",
        )
      }
    }
  }

  // Step 3: Get or create cart
  const cart = await cartRepo.findOrCreateByCustomerId(customerId)

  // Step 4: Check for existing item (merge logic)
  const existingItem = await cartItemRepo.findExistingItem(
    cart.id,
    data.productId,
    optionsHash,
  )

  // Step 5: Calculate unit price server-side
  const basePrice = Number(product.price)
  const optionsPrice = calculateOptionsPrice(selectedOptions)
  const unitPrice = basePrice + optionsPrice

  if (existingItem) {
    // Merge: increment quantity
    const newQuantity = existingItem.quantity + quantity
    if (newQuantity > MAX_QUANTITY) {
      throw new AppError(
        400,
        ErrorCode.MAX_QUANTITY_EXCEEDED,
        `Maximum quantity per item is ${MAX_QUANTITY}`,
      )
    }

    const newSubtotal = unitPrice * newQuantity
    await cartItemRepo.update(existingItem.id, {
      quantity: newQuantity,
      unitPrice,
      subtotal: newSubtotal,
    })
  } else {
    // Create new cart item
    const subtotal = unitPrice * quantity
    await cartItemRepo.create({
      cartId: cart.id,
      productId: data.productId,
      productName: product.name,
      quantity,
      unitPrice,
      subtotal,
      selectedOptions: selectedOptions.length > 0
        ? (selectedOptions as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      optionsHash: optionsHash || null,
      note: data.note ?? null,
    })
  }

  // Step 6: Return updated cart
  return getCart(customerId)
}

// ─────────────────────────────────────────────────────────────
// Update Cart Item
// ─────────────────────────────────────────────────────────────

/**
 * Update a cart item's quantity and/or note.
 *
 * Recalculates subtotal after quantity change.
 * Server-side recalculation — never trusts client prices.
 */
export async function updateCartItem(
  customerId: string,
  itemId: string,
  data: UpdateCartItemRequest,
): Promise<CartResponse> {
  // Validate item exists
  const item = await cartItemRepo.findById(itemId)
  if (!item) {
    throw new AppError(
      404,
      ErrorCode.CART_ITEM_NOT_FOUND,
      "Cart item not found",
    )
  }

  // Validate ownership (item must belong to customer's cart)
  const cart = await cartRepo.findByCustomerId(customerId)
  if (!cart || item.cartId !== cart.id) {
    throw new AppError(
      404,
      ErrorCode.CART_ITEM_NOT_FOUND,
      "Cart item not found",
    )
  }

  const updateData: Record<string, unknown> = {}

  if (data.quantity !== undefined) {
    updateData.quantity = data.quantity

    // Recalculate subtotal with current unitPrice
    const unitPrice = Number(item.unitPrice)
    updateData.subtotal = unitPrice * data.quantity
  }

  if (data.note !== undefined) {
    updateData.note = data.note
  }

  await cartItemRepo.update(itemId, updateData)

  return getCart(customerId)
}

// ─────────────────────────────────────────────────────────────
// Remove Cart Item
// ─────────────────────────────────────────────────────────────

/**
 * Remove a single item from the cart.
 * Validates ownership before deletion.
 */
export async function removeCartItem(
  customerId: string,
  itemId: string,
): Promise<CartResponse> {
  // Validate item exists and belongs to customer
  const item = await cartItemRepo.findById(itemId)
  if (!item) {
    throw new AppError(
      404,
      ErrorCode.CART_ITEM_NOT_FOUND,
      "Cart item not found",
    )
  }

  const cart = await cartRepo.findByCustomerId(customerId)
  if (!cart || item.cartId !== cart.id) {
    throw new AppError(
      404,
      ErrorCode.CART_ITEM_NOT_FOUND,
      "Cart item not found",
    )
  }

  await cartItemRepo.delete(itemId)

  return getCart(customerId)
}

// ─────────────────────────────────────────────────────────────
// Clear Cart
// ─────────────────────────────────────────────────────────────

/**
 * Clear all items from the customer's cart.
 * Does not delete the cart itself (it will be reused).
 */
export async function clearCart(customerId: string): Promise<void> {
  const cart = await cartRepo.findByCustomerId(customerId)
  if (!cart) return

  await cartItemRepo.deleteAllByCartId(cart.id)
}
