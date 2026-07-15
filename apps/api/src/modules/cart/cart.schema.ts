/**
 * Zod validation schemas for the Cart module.
 *
 * Every request body is validated through these schemas
 * before reaching the service layer (per 90-api-rules.md).
 *
 * Endpoints:
 *   GET    /cart              — Get cart
 *   POST   /cart/items         — Add item to cart
 *   PATCH  /cart/items/:id    — Update cart item
 *   DELETE /cart/items/:id    — Remove cart item
 *   DELETE /cart              — Clear cart
 */

import { z } from "zod"

// ─────────────────────────────────────────────────────────────
// Request Schemas
// ─────────────────────────────────────────────────────────────

/** Selected option within add-to-cart request. */
export const selectedOptionSchema = z.object({
  optionGroupId: z.string().min(1, "optionGroupId is required"),
  optionId: z.string().min(1, "optionId is required"),
  optionName: z.string().min(1, "optionName is required"),
  additionalPrice: z
    .number({ invalid_type_error: "additionalPrice must be a number" })
    .min(0, "additionalPrice must be 0 or greater"),
})

/** POST /cart/items — Add a product to the cart. */
export const addToCartBodySchema = z.object({
  productId: z
    .string({ required_error: "productId is required" })
    .min(1, "productId must not be empty"),
  quantity: z
    .number({ invalid_type_error: "quantity must be a number" })
    .int("quantity must be an integer")
    .min(1, "quantity must be at least 1")
    .max(50, "quantity must not exceed 50")
    .optional()
    .default(1),
  selectedOptions: z
    .array(selectedOptionSchema)
    .optional()
    .default([]),
  note: z
    .string()
    .max(500, "note must not exceed 500 characters")
    .optional(),
})

export type AddToCartBody = z.infer<typeof addToCartBodySchema>

/** PATCH /cart/items/:id — Update a cart item (all optional). */
export const updateCartItemBodySchema = z.object({
  quantity: z
    .number({ invalid_type_error: "quantity must be a number" })
    .int("quantity must be an integer")
    .min(1, "quantity must be at least 1")
    .max(50, "quantity must not exceed 50")
    .optional(),
  note: z
    .string()
    .max(500, "note must not exceed 500 characters")
    .nullable()
    .optional(),
})

export type UpdateCartItemBody = z.infer<typeof updateCartItemBodySchema>

// ─────────────────────────────────────────────────────────────
// Response Schemas (for Swagger)
// ─────────────────────────────────────────────────────────────

const selectedOptionResponseSchema = z.object({
  optionGroupId: z.string(),
  optionId: z.string(),
  optionName: z.string(),
  additionalPrice: z.string(),
})

const cartItemResponseSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  productName: z.string(),
  imageUrl: z.string().nullable(),
  unitPrice: z.string(),
  quantity: z.number(),
  subtotal: z.string(),
  selectedOptions: z.array(selectedOptionResponseSchema),
  note: z.string().nullable(),
})

const cartResponseSchema = z.object({
  id: z.string().uuid(),
  items: z.array(cartItemResponseSchema),
  itemCount: z.number(),
  subtotal: z.string(),
  total: z.string(),
  updatedAt: z.string(),
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

/** GET /api/v1/cart */
export const getCartRouteSchema = {
  description: "Get customer shopping cart",
  tags: ["Cart"],
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      success: z.literal(true),
      data: cartResponseSchema,
      message: z.string(),
    }),
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** POST /api/v1/cart/items */
export const addToCartRouteSchema = {
  description: "Add product to cart (auto-creates cart if needed)",
  tags: ["Cart"],
  security: [{ bearerAuth: [] }],
  body: addToCartBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: cartResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    404: errorResponseSchema,
    409: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** PATCH /api/v1/cart/items/:id */
export const updateCartItemRouteSchema = {
  description: "Update cart item quantity or note",
  tags: ["Cart"],
  security: [{ bearerAuth: [] }],
  body: updateCartItemBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: cartResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** DELETE /api/v1/cart/items/:id */
export const removeCartItemRouteSchema = {
  description: "Remove item from cart",
  tags: ["Cart"],
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      success: z.literal(true),
      data: cartResponseSchema,
      message: z.string(),
    }),
    401: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** DELETE /api/v1/cart */
export const clearCartRouteSchema = {
  description: "Clear entire cart (remove all items)",
  tags: ["Cart"],
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      success: z.literal(true),
      data: z.null(),
      message: z.string(),
    }),
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const
