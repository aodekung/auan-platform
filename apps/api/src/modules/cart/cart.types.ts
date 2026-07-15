/**
 * Cart module type definitions and DTOs.
 *
 * These types define the shape of data flowing between
 * controller <-> service <-> repository.
 *
 * Per 60-coding-standard.md: use interfaces for object contracts.
 * Per 90-api-rules.md: JSON properties use camelCase.
 * Per 152-product-options.md: selected options are stored as snapshots.
 */

// ─────────────────────────────────────────────────────────────
// Selected Option
// ─────────────────────────────────────────────────────────────

/** A selected product option stored in cart item JSON. */
export interface SelectedOption {
  optionGroupId: string
  optionId: string
  optionName: string
  additionalPrice: number
}

// ─────────────────────────────────────────────────────────────
// DTO — Response
// ─────────────────────────────────────────────────────────────

/** Cart item response returned in cart views. */
export interface CartItemResponse {
  id: string
  productId: string
  productName: string
  imageUrl: string | null
  unitPrice: string
  quantity: number
  subtotal: string
  selectedOptions: Array<{
    optionGroupId: string
    optionId: string
    optionName: string
    additionalPrice: string
  }>
  note: string | null
}

/** Full cart response including items, totals, and metadata. */
export interface CartResponse {
  id: string
  items: CartItemResponse[]
  itemCount: number
  subtotal: string
  total: string
  updatedAt: string
}

// ─────────────────────────────────────────────────────────────
// DTO — Request
// ─────────────────────────────────────────────────────────────

/** Add product to cart request body. */
export interface AddToCartRequest {
  productId: string
  quantity?: number
  selectedOptions?: SelectedOption[]
  note?: string
}

/** Update cart item request body (PATCH — all optional). */
export interface UpdateCartItemRequest {
  quantity?: number
  note?: string | null
}
