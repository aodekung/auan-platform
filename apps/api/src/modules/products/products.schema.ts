/**
 * Zod validation schemas for the Product module.
 *
 * Every request body and query string is validated through these schemas
 * before reaching the service layer (per 90-api-rules.md).
 *
 * Endpoints:
 *   GET  /products              — Product list (public, with query params)
 *   GET  /products/:id          — Product detail (public)
 *   POST /products              — Create product (Owner)
 *   PATCH /products/:id         — Update product (Owner)
 *   DELETE /products/:id        — Delete (disable) product (Owner)
 */

import { z } from "zod"

// ─────────────────────────────────────────────────────────────
// Request Body Schemas
// ─────────────────────────────────────────────────────────────

/** POST /products — Create a product. */
export const createProductBodySchema = z.object({
  categoryId: z
    .string({ required_error: "categoryId is required" })
    .min(1, "categoryId must not be empty"),
  sku: z
    .string()
    .max(50, "sku must not exceed 50 characters")
    .optional(),
  name: z
    .string({ required_error: "name is required" })
    .min(1, "name must not be empty")
    .max(200, "name must not exceed 200 characters"),
  nameEn: z
    .string()
    .max(200, "nameEn must not exceed 200 characters")
    .optional(),
  description: z
    .string()
    .max(2000, "description must not exceed 2000 characters")
    .optional(),
  imageUrl: z
    .string()
    .url("imageUrl must be a valid URL")
    .optional()
    .or(z.literal("")),
  price: z
    .number({ required_error: "price is required" })
    .nonnegative("price must be 0 or greater"),
  displayOrder: z
    .number({ invalid_type_error: "displayOrder must be a number" })
    .int("displayOrder must be an integer")
    .min(0, "displayOrder must be 0 or greater")
    .optional(),
  quantity: z
    .number({ invalid_type_error: "quantity must be a number" })
    .int("quantity must be an integer")
    .min(0, "quantity must be 0 or greater")
    .optional(),
  isAvailable: z.boolean().optional(),
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
})

export type CreateProductBody = z.infer<typeof createProductBodySchema>

/** PATCH /products/:id — Update a product (all optional). */
export const updateProductBodySchema = z.object({
  categoryId: z
    .string()
    .min(1, "categoryId must not be empty")
    .optional(),
  sku: z
    .string()
    .max(50, "sku must not exceed 50 characters")
    .nullable()
    .optional(),
  name: z
    .string()
    .min(1, "name must not be empty")
    .max(200, "name must not exceed 200 characters")
    .optional(),
  nameEn: z
    .string()
    .max(200, "nameEn must not exceed 200 characters")
    .nullable()
    .optional(),
  description: z
    .string()
    .max(2000, "description must not exceed 2000 characters")
    .nullable()
    .optional(),
  imageUrl: z
    .string()
    .url("imageUrl must be a valid URL")
    .nullable()
    .optional()
    .or(z.literal("")),
  price: z
    .number()
    .nonnegative("price must be 0 or greater")
    .optional(),
  displayOrder: z
    .number({ invalid_type_error: "displayOrder must be a number" })
    .int("displayOrder must be an integer")
    .min(0, "displayOrder must be 0 or greater")
    .optional(),
  quantity: z
    .number()
    .int("quantity must be an integer")
    .min(0, "quantity must be 0 or greater")
    .optional(),
  isAvailable: z.boolean().optional(),
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
})

export type UpdateProductBody = z.infer<typeof updateProductBodySchema>

// ─────────────────────────────────────────────────────────────
// Query String Schema
// ─────────────────────────────────────────────────────────────

/** GET /products — Query parameters for filtering, sorting, pagination. */
export const productQuerySchema = z.object({
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
  sort: z
    .enum(["displayOrder", "price", "name", "createdAt"])
    .optional(),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
})

export type ProductQuery = z.infer<typeof productQuerySchema>

/** GET /admin/products — Admin query with status filter. */
export const adminProductQuerySchema = productQuerySchema.extend({
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
})

export type AdminProductQuery = z.infer<typeof adminProductQuerySchema>

// ─────────────────────────────────────────────────────────────
// Response Schemas (for Swagger)
// ─────────────────────────────────────────────────────────────

const optionSchema = z.object({
  id: z.string().uuid(),
  optionGroupId: z.string().uuid(),
  name: z.string(),
  additionalPrice: z.string(),
  displayOrder: z.number(),
  isActive: z.boolean(),
})

const optionGroupSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  name: z.string(),
  required: z.boolean(),
  multiple: z.boolean(),
  displayOrder: z.number(),
  options: z.array(optionSchema),
})

const productSchema = z.object({
  id: z.string().uuid(),
  categoryId: z.string().uuid(),
  sku: z.string().nullable(),
  name: z.string(),
  nameEn: z.string().nullable(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  price: z.string(),
  status: z.string(),
  displayOrder: z.number(),
  quantity: z.number(),
  isAvailable: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const productDetailSchema = productSchema.extend({
  category: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
  optionGroups: z.array(optionGroupSchema),
})

const paginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
})

const errorResponseSchema = z.object({
  success: z.boolean(),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})

// ─────────────────────────────────────────────────────────────
// Route Schemas
// ─────────────────────────────────────────────────────────────

/** GET /api/v1/products */
export const listProductsRouteSchema = {
  description: "Get product list with filtering, sorting, and pagination",
  tags: ["Products"],
  querystring: productQuerySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: z.array(productSchema),
      pagination: paginationSchema,
      message: z.string(),
    }),
    500: errorResponseSchema,
  },
} as const

/** GET /api/v1/products/:id */
export const getProductRouteSchema = {
  description: "Get product details",
  tags: ["Products"],
  response: {
    200: z.object({
      success: z.literal(true),
      data: productDetailSchema,
      message: z.string(),
    }),
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** POST /api/v1/products */
export const createProductRouteSchema = {
  description: "Create a new product (Owner only)",
  tags: ["Products"],
  security: [{ bearerAuth: [] }],
  body: createProductBodySchema,
  response: {
    201: z.object({
      success: z.literal(true),
      data: productDetailSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    409: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** PATCH /api/v1/products/:id */
export const updateProductRouteSchema = {
  description: "Update a product (Owner only)",
  tags: ["Products"],
  security: [{ bearerAuth: [] }],
  body: updateProductBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: productDetailSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    404: errorResponseSchema,
    409: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** DELETE /api/v1/products/:id */
export const deleteProductRouteSchema = {
  description: "Disable a product (Owner only)",
  tags: ["Products"],
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      success: z.literal(true),
      data: z.null(),
      message: z.string(),
    }),
    401: errorResponseSchema,
    403: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const
