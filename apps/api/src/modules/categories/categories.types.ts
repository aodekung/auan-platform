/**
 * Category module type definitions and DTOs.
 *
 * These types define the shape of data flowing between
 * controller <-> service <-> repository.
 *
 * Per 60-coding-standard.md: use interfaces for object contracts.
 */

// ─────────────────────────────────────────────────────────────
// DTO — Response
// ─────────────────────────────────────────────────────────────

/** Category response returned in list and detail endpoints. */
export interface CategoryResponse {
  id: string
  name: string
  description: string | null
  displayOrder: number
  isActive: boolean
  productCount: number
  createdAt: string
  updatedAt: string
}

// ─────────────────────────────────────────────────────────────
// DTO — Request
// ─────────────────────────────────────────────────────────────

/** Create category request body. */
export interface CreateCategoryRequest {
  name: string
  description?: string
  displayOrder?: number
}

/** Update category request body (all fields optional for PATCH). */
export interface UpdateCategoryRequest {
  name?: string
  description?: string | null
  displayOrder?: number
  isActive?: boolean
}
