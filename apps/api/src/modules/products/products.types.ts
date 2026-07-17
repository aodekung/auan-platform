/**
 * Product module type definitions and DTOs.
 *
 * These types define the shape of data flowing between
 * controller <-> service <-> repository.
 *
 * Per 60-coding-standard.md: use interfaces for object contracts.
 * Per 90-api-rules.md: JSON properties use camelCase.
 */

import type { OptionGroupResponse } from "../product-options/product-options.types.js"

// ─────────────────────────────────────────────────────────────
// DTO — Response
// ─────────────────────────────────────────────────────────────

/** Product response for list endpoints. */
export interface ProductResponse {
  id: string
  categoryId: string
  sku: string | null
  name: string
  nameEn: string | null
  description: string | null
  imageUrl: string | null
  price: string
  status: string
  displayOrder: number
  quantity: number
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

/** Product detail response — includes category relation and option groups. */
export interface ProductDetailResponse extends ProductResponse {
  category: {
    id: string
    name: string
  }
  optionGroups: OptionGroupResponse[]
}

// ─────────────────────────────────────────────────────────────
// DTO — Request
// ─────────────────────────────────────────────────────────────

/** Create product request body. */
export interface CreateProductRequest {
  categoryId: string
  sku?: string
  name: string
  nameEn?: string
  description?: string
  imageUrl?: string
  price: number
  displayOrder?: number
  quantity?: number
  isAvailable?: boolean
  status?: string
}

/** Update product request body (all fields optional for PATCH). */
export interface UpdateProductRequest {
  categoryId?: string
  sku?: string
  name?: string
  nameEn?: string
  description?: string
  imageUrl?: string
  price?: number
  displayOrder?: number
  quantity?: number
  isAvailable?: boolean
  status?: string
}

// ─────────────────────────────────────────────────────────────
// DTO — Query
// ─────────────────────────────────────────────────────────────

/** Query parameters for GET /products. */
export interface ProductQueryParams {
  categoryId?: string
  search?: string
  sort?: string
  order?: "asc" | "desc"
  page?: number
  pageSize?: number
}
