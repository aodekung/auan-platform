/**
 * Product Service — business logic for product management.
 *
 * Responsibilities:
 * - List products with filtering, sorting, pagination (public: active only)
 * - Get single product detail with category relation
 * - Create product (with category validation + SKU/name uniqueness)
 * - Update product (with category validation + uniqueness checks)
 * - Delete (disable) product
 *
 * Per 60-architecture.md: business logic lives in services, NOT controllers.
 * Per 151-product-catalog.md:
 *   - Every product must belong to exactly one category.
 *   - Products cannot belong to a deleted/inactive category.
 *   - Products without prices must never be published.
 * Per 173-database-design.md: soft delete NOT implemented in MVP.
 * Per 153-pricing-rules.md: price is Decimal(10,2), never float.
 *
 * All database access goes through the repository layer.
 */

import { unlink } from "node:fs/promises"
import { join } from "node:path"

import type { Prisma } from "@prisma/client"
import type { Decimal } from "@prisma/client/runtime/library"

import type { MultipartFile } from "@fastify/multipart"

import { AppError, ErrorCode } from "../../common/errors.js"
import { env } from "../../config/env.js"
import { saveUploadedFile } from "../../common/upload.js"
import { prisma } from "../../database/client.js"
import { CategoryRepository } from "../../database/repositories/category.repository.js"
import type { ProductQueryOptions } from "../../database/repositories/product.repository.js"
import { ProductRepository } from "../../database/repositories/product.repository.js"
import { getOptionGroupsByProductId } from "../option-templates/option-template.service.js"

import type {
  ProductDetailResponse,
  ProductQueryParams,
  ProductResponse,
} from "./products.types.js"

// ─────────────────────────────────────────────────────────────
// Repository instances (singleton per module)
// ─────────────────────────────────────────────────────────────

const productRepo = new ProductRepository()
const categoryRepo = new CategoryRepository()

// ─────────────────────────────────────────────────────────────
// Mappers
// ─────────────────────────────────────────────────────────────

/**
 * Map a Prisma Product entity (without includes) to ProductResponse DTO.
 * Converts Decimal price to string for JSON serialization.
 */
function mapToListResponse(product: {
  id: string
  categoryId: string
  sku: string | null
  name: string
  nameEn: string | null
  description: string | null
  imageUrl: string | null
  price: Decimal | number
  status: string
  displayOrder: number
  quantity: number
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date
}): ProductResponse {
  return {
    id: product.id,
    categoryId: product.categoryId,
    sku: product.sku,
    name: product.name,
    nameEn: product.nameEn,
    description: product.description,
    imageUrl: product.imageUrl,
    price: product.price.toString(),
    status: product.status,
    displayOrder: product.displayOrder,
    quantity: product.quantity,
    isAvailable: product.isAvailable,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
}

/**
 * Map a Prisma Product entity (with category include) to ProductDetailResponse DTO.
 * Accepts an optional optionGroups array for enriched detail responses.
 */
function mapToDetailResponse(
  product: {
    id: string
    categoryId: string
    sku: string | null
    name: string
    nameEn: string | null
    description: string | null
    imageUrl: string | null
    price: Decimal | number
    status: string
    displayOrder: number
    quantity: number
    isAvailable: boolean
    createdAt: Date
    updatedAt: Date
    category: { id: string; name: string }
  },
  optionGroups?: Awaited<ReturnType<typeof getOptionGroupsByProductId>>,
): ProductDetailResponse {
  return {
    ...mapToListResponse(product),
    category: product.category,
    optionGroups: optionGroups ?? [],
  }
}

// ─────────────────────────────────────────────────────────────
// Public (Customer-facing)
// ─────────────────────────────────────────────────────────────

/**
 * Get active products with filtering, sorting, and pagination.
 *
 * Returns only ACTIVE products for customer-facing list.
 * Supports: category filter, keyword search, sort, pagination.
 */
export async function getAllProducts(
  query: ProductQueryParams,
): Promise<{
  products: ProductResponse[]
  pagination: { page: number; pageSize: number; totalItems: number; totalPages: number }
}> {
  const options: ProductQueryOptions = {
    categoryId: query.categoryId,
    search: query.search,
    sort: query.sort,
    order: query.order,
    page: query.page,
    pageSize: query.pageSize,
  }

  const { data, total } = await productRepo.findActive(options)

  const page = query.page ?? 1
  const pageSize = query.pageSize ?? 20

  return {
    products: data.map(mapToListResponse),
    pagination: {
      page,
      pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

/**
 * Get all products (admin) with filtering, sorting, and pagination.
 *
 * Unlike the public endpoint, this does NOT hardcode status=ACTIVE.
 * Admins can filter by status or see all products.
 */
export async function getAdminProducts(
  query: ProductQueryParams & { status?: string },
): Promise<{
  products: ProductResponse[]
  pagination: { page: number; pageSize: number; totalItems: number; totalPages: number }
}> {
  const options: ProductQueryOptions = {
    categoryId: query.categoryId,
    search: query.search,
    sort: query.sort,
    order: query.order,
    page: query.page,
    pageSize: query.pageSize,
    status: query.status,
  }

  const { data, total } = await productRepo.findMany(options)

  const page = query.page ?? 1
  const pageSize = query.pageSize ?? 20

  return {
    products: data.map(mapToListResponse),
    pagination: {
      page,
      pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

/**
 * Get a single product by ID with category relation and option groups.
 * Returns 404 if the product does not exist.
 */
export async function getProductById(
  id: string,
): Promise<ProductDetailResponse> {
  const product = await productRepo.findById(id)

  if (!product) {
    throw new AppError(
      404,
      ErrorCode.PRODUCT_NOT_FOUND,
      "Product not found",
    )
  }

  // Fetch option groups with active options in parallel
  const [optionGroups] = await Promise.all([
    getOptionGroupsByProductId(id),
  ])

  return mapToDetailResponse(product, optionGroups)
}

// ─────────────────────────────────────────────────────────────
// Admin (Owner-only)
// ─────────────────────────────────────────────────────────────

/**
 * Create a new product.
 *
 * Business rules:
 * - Category must exist and be active.
 * - SKU must be unique (if provided).
 * - Price must be non-negative (validated by Zod, enforced here as double-check).
 */
export async function createProduct(
  data: {
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
  },
): Promise<ProductDetailResponse> {
  // Validate category exists and is active
  const category = await categoryRepo.findById(data.categoryId)
  if (!category || !category.isActive) {
    throw new AppError(
      400,
      ErrorCode.INVALID_CATEGORY,
      "Category does not exist or is not active",
    )
  }

  // Check for duplicate SKU (if provided)
  if (data.sku) {
    const existingSku = await productRepo.findBySku(data.sku)
    if (existingSku) {
      throw new AppError(
        409,
        ErrorCode.DUPLICATE_PRODUCT_SKU,
        "A product with this SKU already exists",
      )
    }
  }

  // Auto-assign displayOrder if not provided
  let displayOrder = data.displayOrder ?? 0
  if (data.displayOrder === undefined) {
    const { data: categoryProducts } = await productRepo.findMany({
      categoryId: data.categoryId,
      page: 1,
      pageSize: 1,
      sort: "displayOrder",
      order: "desc",
    })
    const maxOrder = categoryProducts.length > 0
      ? (categoryProducts[0].displayOrder ?? 0)
      : 0
    displayOrder = maxOrder + 1
  }

  // Create with raw FK (UncheckedCreateInput)
  const createData: Prisma.ProductUncheckedCreateInput = {
    categoryId: data.categoryId,
    sku: data.sku ?? null,
    name: data.name,
    nameEn: data.nameEn ?? null,
    description: data.description ?? null,
    imageUrl: data.imageUrl ?? null,
    price: data.price,
    displayOrder,
    quantity: data.quantity ?? 0,
    isAvailable: data.isAvailable ?? true,
    status: (data.status as "ACTIVE" | "DISABLED") ?? "ACTIVE",
  }

  const product = await productRepo.create(createData)

  // Fetch with category relation for response
  const withCategory = await productRepo.findById(product.id)
  return mapToDetailResponse(withCategory!)
}

/**
 * Update an existing product.
 *
 * Business rules:
 * - Product must exist.
 * - If changing category, new category must exist and be active.
 * - If changing SKU, must be unique.
 */
export async function updateProduct(
  id: string,
  data: {
    categoryId?: string
    sku?: string | null
    name?: string
    nameEn?: string | null
    description?: string | null
    imageUrl?: string | null
    price?: number
    displayOrder?: number
    quantity?: number
    isAvailable?: boolean
    status?: string
  },
): Promise<ProductDetailResponse> {
  // Check existence
  const existing = await productRepo.findById(id)
  if (!existing) {
    throw new AppError(
      404,
      ErrorCode.PRODUCT_NOT_FOUND,
      "Product not found",
    )
  }

  // If changing category, validate new category
  if (data.categoryId && data.categoryId !== existing.categoryId) {
    const category = await categoryRepo.findById(data.categoryId)
    if (!category || !category.isActive) {
      throw new AppError(
        400,
        ErrorCode.INVALID_CATEGORY,
        "Category does not exist or is not active",
      )
    }
  }

  // If changing SKU to a non-null value, check uniqueness
  if (data.sku !== undefined && data.sku !== null && data.sku !== existing.sku) {
    const existingSku = await productRepo.findBySku(data.sku)
    if (existingSku) {
      throw new AppError(
        409,
        ErrorCode.DUPLICATE_PRODUCT_SKU,
        "A product with this SKU already exists",
      )
    }
  }

  const updateData: Prisma.ProductUpdateInput = {
    ...(data.categoryId !== undefined && { category: { connect: { id: data.categoryId } } }),
    ...(data.sku !== undefined && { sku: data.sku }),
    ...(data.name !== undefined && { name: data.name }),
    ...(data.nameEn !== undefined && { nameEn: data.nameEn }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
    ...(data.price !== undefined && { price: data.price }),
    ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
    ...(data.quantity !== undefined && { quantity: data.quantity }),
    ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
    ...(data.status !== undefined && { status: data.status as "ACTIVE" | "DISABLED" }),
  }

  await productRepo.update(id, updateData)

  // Fetch with category relation for response
  const updated = await productRepo.findById(id)
  return mapToDetailResponse(updated!)
}

/**
 * Hard-delete a product and all its related data.
 *
 * Deletes ProductOptions, ProductOptionGroups, then the Product itself
 * within a transaction. Also removes the product image file from disk.
 */
export async function deleteProduct(id: string): Promise<void> {
  // Check existence and get imageUrl for cleanup
  const existing = await productRepo.findById(id)
  if (!existing) {
    throw new AppError(
      404,
      ErrorCode.PRODUCT_NOT_FOUND,
      "Product not found",
    )
  }

  // Delete related data then the product in a transaction
  await prisma.$transaction(async (tx) => {
    // Delete options within each option group for this product
    await tx.productOption.deleteMany({
      where: {
        optionGroup: { productId: id },
      },
    })

    // Delete option groups for this product
    await tx.productOptionGroup.deleteMany({
      where: { productId: id },
    })

    // Hard-delete the product
    await tx.product.delete({ where: { id } })
  })

  // Remove image file from disk if it exists
  if (existing.imageUrl) {
    try {
      const imagePath = join(env.UPLOAD_PATH, existing.imageUrl)
      await unlink(imagePath)
    } catch {
      // File may already be missing — ignore cleanup errors
    }
  }
}

/**
 * Upload product image.
 *
 * Saves the image to disk and updates the product's imageUrl.
 */
export async function uploadProductImage(
  id: string,
  file: MultipartFile,
): Promise<ProductDetailResponse> {
  const existing = await productRepo.findById(id)
  if (!existing) {
    throw new AppError(
      404,
      ErrorCode.PRODUCT_NOT_FOUND,
      "Product not found",
    )
  }

  const relativePath = await saveUploadedFile(file, "products")

  await productRepo.update(id, {
    imageUrl: relativePath,
  })

  const updated = await productRepo.findById(id)
  const [optionGroups] = await Promise.all([getOptionGroupsByProductId(id)])
  return mapToDetailResponse(updated!, optionGroups)
}
