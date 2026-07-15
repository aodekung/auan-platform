/**
 * Zod validation schemas for the Product Options module.
 *
 * Every request body is validated through these schemas
 * before reaching the service layer (per 90-api-rules.md).
 *
 * Endpoints:
 *   GET  /products/:productId/options                — List option groups (public)
 *   POST /products/:productId/options                — Create option group (Owner)
 *   PATCH /product-options/:id                       — Update option group (Owner)
 *   DELETE /product-options/:id                      — Delete option group (Owner)
 *   POST /product-options/:groupId/options           — Add option to group (Owner)
 *   PATCH /product-options/:groupId/options/:id      — Update option (Owner)
 *   DELETE /product-options/:groupId/options/:id     — Soft-disable option (Owner)
 */

import { z } from "zod"

// ─────────────────────────────────────────────────────────────
// Request Body Schemas
// ─────────────────────────────────────────────────────────────

/** POST /products/:productId/options — Create an option group. */
export const createOptionGroupBodySchema = z.object({
  name: z
    .string({ required_error: "name is required" })
    .min(1, "Name must be 1-100 characters")
    .max(100, "Name must be 1-100 characters"),
  required: z.boolean().optional().default(true),
  multiple: z.boolean().optional().default(false),
  displayOrder: z
    .number({ invalid_type_error: "displayOrder must be a number" })
    .int("displayOrder must be an integer")
    .min(0, "displayOrder must be 0 or greater")
    .optional(),
})

export type CreateOptionGroupBody = z.infer<typeof createOptionGroupBodySchema>

/** PATCH /product-options/:id — Update an option group (all optional). */
export const updateOptionGroupBodySchema = z.object({
  name: z
    .string()
    .min(1, "Name must be 1-100 characters")
    .max(100, "Name must be 1-100 characters")
    .optional(),
  required: z.boolean().optional(),
  multiple: z.boolean().optional(),
  displayOrder: z
    .number({ invalid_type_error: "displayOrder must be a number" })
    .int("displayOrder must be an integer")
    .min(0, "displayOrder must be 0 or greater")
    .optional(),
})

export type UpdateOptionGroupBody = z.infer<typeof updateOptionGroupBodySchema>

/** POST /product-options/:groupId/options — Add an option to a group. */
export const createOptionBodySchema = z.object({
  name: z
    .string({ required_error: "name is required" })
    .min(1, "Name must be 1-100 characters")
    .max(100, "Name must be 1-100 characters"),
  additionalPrice: z
    .number({ required_error: "additionalPrice is required" })
    .min(0, "Price must be 0 or greater")
    .optional()
    .default(0),
  displayOrder: z
    .number({ invalid_type_error: "displayOrder must be a number" })
    .int("displayOrder must be an integer")
    .min(0, "displayOrder must be 0 or greater")
    .optional(),
})

export type CreateOptionBody = z.infer<typeof createOptionBodySchema>

/** PATCH /product-options/:groupId/options/:id — Update an option (all optional). */
export const updateOptionBodySchema = z.object({
  name: z
    .string()
    .min(1, "Name must be 1-100 characters")
    .max(100, "Name must be 1-100 characters")
    .optional(),
  additionalPrice: z
    .number()
    .min(0, "Price must be 0 or greater")
    .optional(),
  displayOrder: z
    .number({ invalid_type_error: "displayOrder must be a number" })
    .int("displayOrder must be an integer")
    .min(0, "displayOrder must be 0 or greater")
    .optional(),
  isActive: z.boolean().optional(),
})

export type UpdateOptionBody = z.infer<typeof updateOptionBodySchema>

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

/** GET /api/v1/products/:productId/options */
export const listOptionGroupsRouteSchema = {
  description: "Get all option groups with their active options for a product",
  tags: ["Product Options"],
  params: z.object({
    productId: z.string().uuid(),
  }),
  response: {
    200: z.object({
      success: z.literal(true),
      data: z.array(optionGroupSchema),
      message: z.string(),
    }),
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** POST /api/v1/products/:productId/options */
export const createOptionGroupRouteSchema = {
  description: "Create an option group for a product (Owner only)",
  tags: ["Product Options"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    productId: z.string().uuid(),
  }),
  body: createOptionGroupBodySchema,
  response: {
    201: z.object({
      success: z.literal(true),
      data: optionGroupSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** PATCH /api/v1/product-options/:id */
export const updateOptionGroupRouteSchema = {
  description: "Update an option group (Owner only)",
  tags: ["Product Options"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    id: z.string().uuid(),
  }),
  body: updateOptionGroupBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: optionGroupSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** DELETE /api/v1/product-options/:id */
export const deleteOptionGroupRouteSchema = {
  description: "Delete an option group and all its options (Owner only)",
  tags: ["Product Options"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    id: z.string().uuid(),
  }),
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

/** POST /api/v1/product-options/:groupId/options */
export const createOptionRouteSchema = {
  description: "Add an option to an option group (Owner only)",
  tags: ["Product Options"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    groupId: z.string().uuid(),
  }),
  body: createOptionBodySchema,
  response: {
    201: z.object({
      success: z.literal(true),
      data: optionSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** PATCH /api/v1/product-options/:groupId/options/:id */
export const updateOptionRouteSchema = {
  description: "Update an option within a group (Owner only)",
  tags: ["Product Options"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    groupId: z.string().uuid(),
    id: z.string().uuid(),
  }),
  body: updateOptionBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: optionSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** DELETE /api/v1/product-options/:groupId/options/:id */
export const deleteOptionRouteSchema = {
  description: "Soft-disable an option (set isActive=false) (Owner only)",
  tags: ["Product Options"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    groupId: z.string().uuid(),
    id: z.string().uuid(),
  }),
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
