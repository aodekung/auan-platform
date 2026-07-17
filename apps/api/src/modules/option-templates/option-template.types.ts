/**
 * Option Templates module type definitions and DTOs.
 *
 * These types define the shape of data flowing between
 * controller <-> service <-> database.
 *
 * Per 60-coding-standard.md: use interfaces for object contracts.
 * Per 90-api-rules.md: JSON properties use camelCase.
 * Per 153-pricing-rules.md: monetary values are serialized as strings.
 */

// ─────────────────────────────────────────────────────────────
// DTO — Response (Admin endpoints)
// ─────────────────────────────────────────────────────────────

/** Individual option template response (e.g., "Extra Hot", "Large"). */
export interface OptionTemplateResponse {
  id: string
  optionGroupId: string
  name: string
  additionalPrice: string // Decimal serialized as string
  displayOrder: number
  isActive: boolean
}

/** Option group template response with nested options. */
export interface OptionGroupTemplateResponse {
  id: string
  name: string
  required: boolean
  multiple: boolean
  displayOrder: number
  options: OptionTemplateResponse[]
}

/** Price override response for a specific option within an assignment. */
export interface PriceOverrideResponse {
  id: string
  optionId: string
  optionName: string
  additionalPrice: string
}

/** Assignment response linking a product to an option group template. */
export interface AssignmentResponse {
  id: string
  productId: string
  optionGroupId: string
  displayOrder: number
  optionGroup: OptionGroupTemplateResponse
  priceOverrides: PriceOverrideResponse[]
}

// ─────────────────────────────────────────────────────────────
// DTO — Customer-facing (same shape as old product-options)
// ─────────────────────────────────────────────────────────────

/**
 * Customer-facing option response — same shape as OptionResponse
 * from product-options.types.ts so the customer app works unchanged.
 */
export interface CustomerOptionResponse {
  id: string
  optionGroupId: string
  name: string
  additionalPrice: string
  displayOrder: number
  isActive: boolean
}

/**
 * Customer-facing option group response — same shape as OptionGroupResponse
 * from product-options.types.ts. The `id` here is the assignment id,
 * and `productId` is included for compatibility.
 */
export interface CustomerOptionGroupResponse {
  id: string
  productId: string
  name: string
  required: boolean
  multiple: boolean
  displayOrder: number
  options: CustomerOptionResponse[]
}

// ─────────────────────────────────────────────────────────────
// DTO — Request
// ─────────────────────────────────────────────────────────────

/** Create option group template request body. */
export interface CreateOptionGroupBody {
  name: string
  required?: boolean
  multiple?: boolean
  displayOrder?: number
}

/** Update option group template request body (all fields optional for PATCH). */
export interface UpdateOptionGroupBody {
  name?: string
  required?: boolean
  multiple?: boolean
  displayOrder?: number
}

/** Create option template within a group request body. */
export interface CreateOptionBody {
  name: string
  additionalPrice?: number
  displayOrder?: number
}

/** Update option template request body (all fields optional for PATCH). */
export interface UpdateOptionBody {
  name?: string
  additionalPrice?: number
  displayOrder?: number
  isActive?: boolean
}

/** Assign option group template to a product request body. */
export interface AssignOptionGroupBody {
  optionGroupId: string
  displayOrder?: number
}

/** Set per-product price overrides request body. */
export interface SetPriceOverrideBody {
  overrides: Array<{ optionId: string; additionalPrice: number }>
}
