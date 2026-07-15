/**
 * Category Service — business logic for category management.
 *
 * Responsibilities:
 * - List categories (public: active only, admin: all)
 * - Get single category details
 * - Create category (with name uniqueness check)
 * - Update category (with name uniqueness check)
 * - Delete (disable) category (with linked-product check)
 *
 * Per 60-architecture.md: business logic lives in services, NOT controllers.
 * Per 151-product-catalog.md: products must belong to a category.
 * Per 173-database-design.md: soft delete NOT implemented in MVP — use isActive toggle.
 *
 * All database access goes through the repository layer.
 */

import { AppError, ErrorCode } from "../../common/errors.js"
import { CategoryRepository } from "../../database/repositories/category.repository.js"

import type {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "./categories.types.js"

// ─────────────────────────────────────────────────────────────
// Repository instance (singleton per module)
// ─────────────────────────────────────────────────────────────

const categoryRepo = new CategoryRepository()

// ─────────────────────────────────────────────────────────────
// Mapper
// ─────────────────────────────────────────────────────────────

/**
 * Map a Prisma Category entity to a CategoryResponse DTO.
 * Includes productCount from a separate count query.
 */
async function mapToResponse(category: {
  id: string
  name: string
  description: string | null
  displayOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}): Promise<CategoryResponse> {
  const productCount = await categoryRepo.countProducts(category.id)

  return {
    id: category.id,
    name: category.name,
    description: category.description,
    displayOrder: category.displayOrder,
    isActive: category.isActive,
    productCount,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  }
}

// ─────────────────────────────────────────────────────────────
// Public (Customer-facing)
// ─────────────────────────────────────────────────────────────

/**
 * Get all active categories ordered by displayOrder.
 * Used for customer-facing category list.
 */
export async function getAllCategories(): Promise<CategoryResponse[]> {
  const categories = await categoryRepo.findActive()
  return Promise.all(categories.map(mapToResponse))
}

/**
 * Get a single category by ID.
 * Returns 404 if the category does not exist.
 */
export async function getCategoryById(id: string): Promise<CategoryResponse> {
  const category = await categoryRepo.findById(id)

  if (!category) {
    throw new AppError(
      404,
      ErrorCode.CATEGORY_NOT_FOUND,
      "Category not found",
    )
  }

  return mapToResponse(category)
}

// ─────────────────────────────────────────────────────────────
// Admin (Owner-only)
// ─────────────────────────────────────────────────────────────

/**
 * Create a new category.
 * Validates that the name is unique (case-insensitive).
 */
export async function createCategory(
  data: CreateCategoryRequest,
): Promise<CategoryResponse> {
  // Check for duplicate name
  const existing = await categoryRepo.findByName(data.name)
  if (existing) {
    throw new AppError(
      409,
      ErrorCode.DUPLICATE_CATEGORY_NAME,
      "A category with this name already exists",
    )
  }

  const category = await categoryRepo.create({
    name: data.name,
    description: data.description ?? null,
    displayOrder: data.displayOrder ?? 0,
    isActive: true,
  })

  return mapToResponse(category)
}

/**
 * Update an existing category.
 * Validates existence and name uniqueness if name is being changed.
 */
export async function updateCategory(
  id: string,
  data: UpdateCategoryRequest,
): Promise<CategoryResponse> {
  // Check existence
  const existing = await categoryRepo.findById(id)
  if (!existing) {
    throw new AppError(
      404,
      ErrorCode.CATEGORY_NOT_FOUND,
      "Category not found",
    )
  }

  // Check for duplicate name if name is being changed
  if (data.name && data.name !== existing.name) {
    const duplicate = await categoryRepo.findByName(data.name)
    if (duplicate) {
      throw new AppError(
        409,
        ErrorCode.DUPLICATE_CATEGORY_NAME,
        "A category with this name already exists",
      )
    }
  }

  const updated = await categoryRepo.update(id, {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
    ...(data.isActive !== undefined && { isActive: data.isActive }),
  })

  return mapToResponse(updated)
}

/**
 * Delete (disable) a category.
 *
 * Per 173-database-design.md: soft delete NOT implemented in MVP.
 * Instead, we set isActive to false.
 *
 * Rejects deletion if products are linked to the category (CONFLICT 409).
 * This prevents orphaned products and maintains data integrity.
 */
export async function deleteCategory(id: string): Promise<void> {
  // Check existence
  const existing = await categoryRepo.findById(id)
  if (!existing) {
    throw new AppError(
      404,
      ErrorCode.CATEGORY_NOT_FOUND,
      "Category not found",
    )
  }

  // Check for linked products
  const productCount = await categoryRepo.countProducts(id)
  if (productCount > 0) {
    throw new AppError(
      409,
      ErrorCode.INVALID_CATEGORY,
      `Cannot disable category: ${productCount} product(s) are linked to this category. Remove or reassign products first.`,
    )
  }

  // Disable instead of hard delete
  await categoryRepo.update(id, { isActive: false })
}
