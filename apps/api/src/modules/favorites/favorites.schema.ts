/**
 * Zod validation schemas for the Favorites module.
 */

import { z } from "zod"

// ─────────────────────────────────────────────────────────────
// Response Schemas (for Swagger)
// ─────────────────────────────────────────────────────────────

const favoriteProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameEn: z.string().nullable(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  price: z.string(),
  status: z.string(),
  isAvailable: z.boolean(),
  displayOrder: z.number(),
  category: z.object({ id: z.string(), name: z.string() }),
})

const favoriteResponseSchema = z.object({
  id: z.string(),
  productId: z.string(),
  product: favoriteProductSchema.optional(),
  createdAt: z.string(),
})

const favoriteCheckSchema = z.object({
  isFavorited: z.boolean(),
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

/** GET /api/v1/customers/me/favorites */
export const listFavoritesRouteSchema = {
  description: "List customer's favorite products",
  tags: ["Favorites"],
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      success: z.literal(true),
      data: z.array(favoriteResponseSchema),
      message: z.string(),
    }),
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** POST /api/v1/customers/me/favorites/:productId */
export const addFavoriteRouteSchema = {
  description: "Add product to favorites",
  tags: ["Favorites"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    productId: z.string().min(1),
  }),
  response: {
    201: z.object({
      success: z.literal(true),
      data: favoriteResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    404: errorResponseSchema,
    409: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** DELETE /api/v1/customers/me/favorites/:productId */
export const removeFavoriteRouteSchema = {
  description: "Remove product from favorites",
  tags: ["Favorites"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    productId: z.string().min(1),
  }),
  response: {
    200: z.object({
      success: z.literal(true),
      data: z.null(),
      message: z.string(),
    }),
    401: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** GET /api/v1/customers/me/favorites/check/:productId */
export const checkFavoriteRouteSchema = {
  description: "Check if product is in customer's favorites",
  tags: ["Favorites"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    productId: z.string().min(1),
  }),
  response: {
    200: z.object({
      success: z.literal(true),
      data: favoriteCheckSchema,
      message: z.string(),
    }),
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const
