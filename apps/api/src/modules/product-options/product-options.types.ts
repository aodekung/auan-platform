/**
 * Product Options module type definitions and DTOs.
 *
 * These types define the shape of data flowing between
 * controller <-> service <-> database.
 *
 * Per 60-coding-standard.md: use interfaces for object contracts.
 * Per 90-api-rules.md: JSON properties use camelCase.
 * Per 153-pricing-rules.md: monetary values are serialized as strings.
 */

// ─────────────────────────────────────────────────────────────
// DTO — Response
// ─────────────────────────────────────────────────────────────

/** Individual option response (e.g., "Extra Hot", "Large"). */
export interface OptionResponse {
  id: string
  optionGroupId: string
  name: string
  additionalPrice: string // Decimal serialized as string
  displayOrder: number
  isActive: boolean
}

/** Option group response with nested active options. */
export interface OptionGroupResponse {
  id: string
  productId: string
  name: string
  required: boolean
  multiple: boolean
  displayOrder: number
  options: OptionResponse[]
}

// ─────────────────────────────────────────────────────────────
// DTO — Request
// ─────────────────────────────────────────────────────────────

/** Create option group request body. */
export interface CreateOptionGroupRequest {
  name: string
  required?: boolean
  multiple?: boolean
  displayOrder?: number
}

/** Update option group request body (all fields optional for PATCH). */
export interface UpdateOptionGroupRequest {
  name?: string
  required?: boolean
  multiple?: boolean
  displayOrder?: number
}

/** Create option within a group request body. */
export interface CreateOptionRequest {
  name: string
  additionalPrice?: number
  displayOrder?: number
}

/** Update option request body (all fields optional for PATCH). */
export interface UpdateOptionRequest {
  name?: string
  additionalPrice?: number
  displayOrder?: number
  isActive?: boolean
}
