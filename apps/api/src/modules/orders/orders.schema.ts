/**
 * Zod validation schemas for the Orders module.
 *
 * Every request body/query is validated through these schemas
 * before reaching the service layer (per 90-api-rules.md).
 *
 * Endpoints:
 *   POST   /api/v1/orders              — Create order from cart
 *   GET    /api/v1/orders              — List customer orders
 *   GET    /api/v1/orders/:id          — Order detail
 *   PATCH  /api/v1/orders/:id/cancel   — Cancel order
 *   PATCH  /api/v1/orders/:id/status   — Update order status (owner)
 */

import { z } from "zod"

// ─────────────────────────────────────────────────────────────
// Request Schemas
// ─────────────────────────────────────────────────────────────

/** POST /api/v1/orders — Create order from cart. */
export const createOrderBodySchema = z.object({
  addressId: z.string().uuid().optional(),
  note: z.string().max(500).optional(),
})

export type CreateOrderBody = z.infer<typeof createOrderBodySchema>

/** PATCH /api/v1/orders/:id/cancel — Cancel order. */
export const cancelOrderBodySchema = z.object({
  reason: z.string().max(500).optional(),
})

export type CancelOrderBody = z.infer<typeof cancelOrderBodySchema>

/** PATCH /api/v1/orders/:id/status — Update order status (owner). */
export const updateOrderStatusBodySchema = z.object({
  status: z.string().min(1),
  reason: z.string().max(500).optional(),
})

export type UpdateOrderStatusBody = z.infer<typeof updateOrderStatusBodySchema>

/** GET /api/v1/orders — List orders query params. */
export const orderQuerySchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
})

export type OrderQuery = z.infer<typeof orderQuerySchema>

// ─────────────────────────────────────────────────────────────
// Response Schemas (for Swagger)
// ─────────────────────────────────────────────────────────────

const orderItemOptionResponseSchema = z.object({
  id: z.string().uuid(),
  optionName: z.string(),
  additionalPrice: z.string(),
})

const orderItemResponseSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  productName: z.string(),
  quantity: z.number().int(),
  unitPrice: z.string(),
  subtotal: z.string(),
  options: z.array(orderItemOptionResponseSchema),
})

const orderStatusHistoryResponseSchema = z.object({
  id: z.string().uuid(),
  fromStatus: z.string().nullable(),
  toStatus: z.string(),
  reason: z.string().nullable(),
  changedBy: z.string().nullable(),
  createdAt: z.string(),
})

const orderResponseSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(),
  customerId: z.string().uuid(),
  addressId: z.string().uuid().nullable(),
  subtotal: z.string(),
  total: z.string(),
  orderStatus: z.string(),
  paymentStatus: z.string(),
  note: z.string().nullable(),
  items: z.array(orderItemResponseSchema),
  statusHistory: z.array(orderStatusHistoryResponseSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const orderListItemResponseSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string(),
  subtotal: z.string(),
  total: z.string(),
  orderStatus: z.string(),
  paymentStatus: z.string(),
  note: z.string().nullable(),
  itemCount: z.number().int(),
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

/** POST /api/v1/orders */
export const createOrderRouteSchema = {
  description: "Create a new order from the customer's cart",
  tags: ["Orders"],
  security: [{ bearerAuth: [] }],
  body: createOrderBodySchema,
  response: {
    201: z.object({
      success: z.literal(true),
      data: orderResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** GET /api/v1/orders */
export const listOrdersRouteSchema = {
  description: "List customer orders (paginated)",
  tags: ["Orders"],
  security: [{ bearerAuth: [] }],
  querystring: orderQuerySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: z.array(orderListItemResponseSchema),
      pagination: z.object({
        page: z.number().int(),
        pageSize: z.number().int(),
        totalItems: z.number().int(),
        totalPages: z.number().int(),
      }),
    }),
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** GET /api/v1/orders/:id */
export const getOrderRouteSchema = {
  description: "Get order detail by ID",
  tags: ["Orders"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    id: z.string().uuid(),
  }),
  response: {
    200: z.object({
      success: z.literal(true),
      data: orderResponseSchema,
      message: z.string(),
    }),
    401: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** PATCH /api/v1/orders/:id/cancel */
export const cancelOrderRouteSchema = {
  description: "Cancel an order",
  tags: ["Orders"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    id: z.string().uuid(),
  }),
  body: cancelOrderBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: orderResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** PATCH /api/v1/orders/:id/status */
export const updateOrderStatusRouteSchema = {
  description: "Update order status (owner only)",
  tags: ["Orders"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    id: z.string().uuid(),
  }),
  body: updateOrderStatusBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: orderResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const
