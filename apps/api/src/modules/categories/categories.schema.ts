/**
 * Zod validation schemas for the Category module.
 *
 * Every request body is validated through these schemas
 * before reaching the service layer (per 90-api-rules.md).
 *
 * Endpoints:
 *   GET  /categories           — Category list (public)
 *   GET  /categories/:id       — Category detail (public)
 *   POST /categories           — Create category (Owner)
 *   PATCH /categories/:id      — Update category (Owner)
 *   DELETE /categories/:id     — Delete (disable) category (Owner)
 */

import { z } from "zod"

// ─────────────────────────────────────────────────────────────
// Request Schemas
// ─────────────────────────────────────────────────────────────

/** POST /categories — Create a category. */
export const createCategoryBodySchema = z.object({
  name: z
    .string({ required_error: "name is required" })
    .min(1, "name must not be empty")
    .max(100, "name must not exceed 100 characters"),
  description: z
    .string()
    .max(500, "description must not exceed 500 characters")
    .optional(),
  displayOrder: z
    .number({ invalid_type_error: "displayOrder must be a number" })
    .int("displayOrder must be an integer")
    .min(0, "displayOrder must be 0 or greater")
    .optional(),
})

export type CreateCategoryBody = z.infer<typeof createCategoryBodySchema>

/** PATCH /categories/:id — Update a category (all optional). */
export const updateCategoryBodySchema = z.object({
  name: z
    .string()
    .min(1, "name must not be empty")
    .max(100, "name must not exceed 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "description must not exceed 500 characters")
    .nullable()
    .optional(),
  displayOrder: z
    .number({ invalid_type_error: "displayOrder must be a number" })
    .int("displayOrder must be an integer")
    .min(0, "displayOrder must be 0 or greater")
    .optional(),
  isActive: z.boolean().optional(),
})

export type UpdateCategoryBody = z.infer<typeof updateCategoryBodySchema>

// ─────────────────────────────────────────────────────────────
// Response Schemas (for Swagger)
// ─────────────────────────────────────────────────────────────

const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  displayOrder: z.number(),
  isActive: z.boolean(),
  productCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})

// ─────────────────────────────────────────────────────────────
// Route Schemas
// ─────────────────────────────────────────────────────────────

/** GET /api/v1/categories */
export const listCategoriesRouteSchema = {
  description: "Get all active categories",
  tags: ["Categories"],
  response: {
    200: z.object({
      success: z.literal(true),
      data: z.array(categorySchema),
      message: z.string(),
    }),
    500: errorResponseSchema,
  },
} as const

/** GET /api/v1/categories/:id */
export const getCategoryRouteSchema = {
  description: "Get category details",
  tags: ["Categories"],
  response: {
    200: z.object({
      success: z.literal(true),
      data: categorySchema,
      message: z.string(),
    }),
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** POST /api/v1/categories */
export const createCategoryRouteSchema = {
  description: "Create a new category (Owner only)",
  tags: ["Categories"],
  security: [{ bearerAuth: [] }],
  body: createCategoryBodySchema,
  response: {
    201: z.object({
      success: z.literal(true),
      data: categorySchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    409: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** PATCH /api/v1/categories/:id */
export const updateCategoryRouteSchema = {
  description: "Update a category (Owner only)",
  tags: ["Categories"],
  security: [{ bearerAuth: [] }],
  body: updateCategoryBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: categorySchema,
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

/** DELETE /api/v1/categories/:id */
export const deleteCategoryRouteSchema = {
  description: "Disable a category (Owner only)",
  tags: ["Categories"],
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
    409: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const
