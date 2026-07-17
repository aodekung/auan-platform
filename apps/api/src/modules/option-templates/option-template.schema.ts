/**
 * Zod validation schemas for the Option Templates module.
 *
 * Every request body is validated through these schemas
 * before reaching the service layer (per 90-api-rules.md).
 *
 * Endpoints:
 *   GET  /admin/option-groups                        — List option group templates (Staff)
 *   POST /admin/option-groups                        — Create option group template (Staff)
 *   PATCH /admin/option-groups/:id                   — Update option group template (Staff)
 *   DELETE /admin/option-groups/:id                  — Delete option group template (Staff)
 *   POST /admin/option-groups/:groupId/options       — Add option to group (Staff)
 *   PATCH /admin/option-groups/:groupId/options/:id  — Update option (Staff)
 *   DELETE /admin/option-groups/:groupId/options/:id — Soft-disable option (Staff)
 *   GET  /products/:productId/option-assignments     — List assignments (Staff)
 *   POST /products/:productId/option-assignments     — Assign group to product (Staff)
 *   DELETE /products/:productId/option-assignments/:groupId — Unassign (Staff)
 *   PATCH /products/:productId/option-assignments/:groupId/overrides — Set overrides (Staff)
 */

import { z } from "zod"

// ─────────────────────────────────────────────────────────────
// Request Body Schemas
// ─────────────────────────────────────────────────────────────

/** POST /admin/option-groups — Create an option group template. */
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

/** PATCH /admin/option-groups/:id — Update an option group template (all optional). */
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

/** POST /admin/option-groups/:groupId/options — Add an option to a group. */
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

/** PATCH /admin/option-groups/:groupId/options/:id — Update an option (all optional). */
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

/** POST /products/:productId/option-assignments — Assign option group to product. */
export const assignOptionGroupBodySchema = z.object({
  optionGroupId: z.string({ required_error: "optionGroupId is required" }).uuid("optionGroupId must be a valid UUID"),
  displayOrder: z
    .number({ invalid_type_error: "displayOrder must be a number" })
    .int("displayOrder must be an integer")
    .min(0, "displayOrder must be 0 or greater")
    .optional(),
})

export type AssignOptionGroupBody = z.infer<typeof assignOptionGroupBodySchema>

/** PATCH /products/:productId/option-assignments/:groupId/overrides — Set price overrides. */
export const setPriceOverrideBodySchema = z.object({
  overrides: z
    .array(
      z.object({
        optionId: z.string().uuid("optionId must be a valid UUID"),
        additionalPrice: z.number().min(0, "Price must be 0 or greater"),
      }),
    )
    .min(1, "At least one override is required"),
})

export type SetPriceOverrideBody = z.infer<typeof setPriceOverrideBodySchema>

// ─────────────────────────────────────────────────────────────
// Response Schemas (for Swagger)
// ─────────────────────────────────────────────────────────────

const optionTemplateSchema = z.object({
  id: z.string().uuid(),
  optionGroupId: z.string().uuid(),
  name: z.string(),
  additionalPrice: z.string(),
  displayOrder: z.number(),
  isActive: z.boolean(),
})

const optionGroupTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  required: z.boolean(),
  multiple: z.boolean(),
  displayOrder: z.number(),
  options: z.array(optionTemplateSchema),
})

const priceOverrideSchema = z.object({
  id: z.string().uuid(),
  optionId: z.string().uuid(),
  optionName: z.string(),
  additionalPrice: z.string(),
})

const assignmentSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  optionGroupId: z.string().uuid(),
  displayOrder: z.number(),
  optionGroup: optionGroupTemplateSchema,
  priceOverrides: z.array(priceOverrideSchema),
})

const errorResponseSchema = z.object({
  success: z.boolean(),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})

// ─────────────────────────────────────────────────────────────
// Route Schemas — Admin Option Group Templates
// ─────────────────────────────────────────────────────────────

/** GET /api/v1/admin/option-groups */
export const listOptionGroupsRouteSchema = {
  description: "Get all option group templates with their options",
  tags: ["Option Templates"],
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      success: z.literal(true),
      data: z.array(optionGroupTemplateSchema),
      message: z.string(),
    }),
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** POST /api/v1/admin/option-groups */
export const createOptionGroupRouteSchema = {
  description: "Create a new option group template (Staff only)",
  tags: ["Option Templates"],
  security: [{ bearerAuth: [] }],
  body: createOptionGroupBodySchema,
  response: {
    201: z.object({
      success: z.literal(true),
      data: optionGroupTemplateSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** PATCH /api/v1/admin/option-groups/:id */
export const updateOptionGroupRouteSchema = {
  description: "Update an option group template (Staff only)",
  tags: ["Option Templates"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    id: z.string().uuid(),
  }),
  body: updateOptionGroupBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: optionGroupTemplateSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** DELETE /api/v1/admin/option-groups/:id */
export const deleteOptionGroupRouteSchema = {
  description: "Delete an option group template and all its options (Staff only)",
  tags: ["Option Templates"],
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

// ─────────────────────────────────────────────────────────────
// Route Schemas — Admin Options within Group Templates
// ─────────────────────────────────────────────────────────────

/** POST /api/v1/admin/option-groups/:groupId/options */
export const createOptionRouteSchema = {
  description: "Add an option to an option group template (Staff only)",
  tags: ["Option Templates"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    groupId: z.string().uuid(),
  }),
  body: createOptionBodySchema,
  response: {
    201: z.object({
      success: z.literal(true),
      data: optionTemplateSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** PATCH /api/v1/admin/option-groups/:groupId/options/:id */
export const updateOptionRouteSchema = {
  description: "Update an option within a group template (Staff only)",
  tags: ["Option Templates"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    groupId: z.string().uuid(),
    id: z.string().uuid(),
  }),
  body: updateOptionBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: optionTemplateSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** DELETE /api/v1/admin/option-groups/:groupId/options/:id */
export const deleteOptionRouteSchema = {
  description: "Soft-disable an option (set isActive=false) (Staff only)",
  tags: ["Option Templates"],
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

// ─────────────────────────────────────────────────────────────
// Route Schemas — Product Assignments
// ─────────────────────────────────────────────────────────────

/** GET /api/v1/products/:productId/option-assignments */
export const listAssignmentsRouteSchema = {
  description: "Get all option group assignments for a product (Staff only)",
  tags: ["Option Templates"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    productId: z.string().uuid(),
  }),
  response: {
    200: z.object({
      success: z.literal(true),
      data: z.array(assignmentSchema),
      message: z.string(),
    }),
    401: errorResponseSchema,
    403: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** POST /api/v1/products/:productId/option-assignments */
export const assignOptionGroupRouteSchema = {
  description: "Assign an option group template to a product (Staff only)",
  tags: ["Option Templates"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    productId: z.string().uuid(),
  }),
  body: assignOptionGroupBodySchema,
  response: {
    201: z.object({
      success: z.literal(true),
      data: assignmentSchema,
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

/** DELETE /api/v1/products/:productId/option-assignments/:groupId */
export const removeAssignmentRouteSchema = {
  description: "Remove an option group template assignment from a product (Staff only)",
  tags: ["Option Templates"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    productId: z.string().uuid(),
    groupId: z.string().uuid(),
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

/** PATCH /api/v1/products/:productId/option-assignments/:groupId/overrides */
export const setPriceOverridesRouteSchema = {
  description: "Set per-product price overrides for an assigned option group (Staff only)",
  tags: ["Option Templates"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    productId: z.string().uuid(),
    groupId: z.string().uuid(),
  }),
  body: setPriceOverrideBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: z.array(priceOverrideSchema),
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const
