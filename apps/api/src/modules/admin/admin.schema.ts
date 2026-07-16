/**
 * Admin module Zod validation schemas and route schemas.
 *
 * Per 90-api-rules.md: "Every request must be validated using Zod."
 */

import { z } from "zod"

// ─────────────────────────────────────────────────────────────
// Query Parameters
// ─────────────────────────────────────────────────────────────

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
})

export const customerListQuerySchema = paginationQuerySchema

export const staffListQuerySchema = paginationQuerySchema.extend({
  role: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
})

export const auditLogListQuerySchema = paginationQuerySchema.extend({
  action: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  actorId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const paymentListQuerySchema = paginationQuerySchema.extend({
  status: z.string().optional(),
})

export const customerOrderHistoryQuerySchema = paginationQuerySchema

// ─────────────────────────────────────────────────────────────
// Request Body
// ─────────────────────────────────────────────────────────────

export const createStaffBodySchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  displayName: z.string().min(1, "Display name is required").max(100),
  phoneNumber: z.string().optional(),
  role: z.string().min(1, "Role is required"),
})

export const updateStaffBodySchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  phoneNumber: z.string().optional(),
  role: z.string().min(1).optional(),
})

export const toggleStatusBodySchema = z.object({
  isActive: z.boolean(),
})

// ─────────────────────────────────────────────────────────────
// Route Schemas
// ─────────────────────────────────────────────────────────────

const successSchema = z.object({ success: z.boolean() }).passthrough()
const errorSchema = z.object({ success: z.boolean() }).passthrough()

export const dashboardRouteSchema = {
  response: {
    200: successSchema,
    401: errorSchema,
    403: errorSchema,
  },
  tags: ["Admin"],
}

export const customerListRouteSchema = {
  querystring: customerListQuerySchema,
  response: { 200: successSchema, 401: errorSchema, 403: errorSchema },
  tags: ["Admin"],
}

export const customerDetailRouteSchema = {
  params: z.object({ id: z.string().uuid() }),
  response: { 200: successSchema, 401: errorSchema, 403: errorSchema, 404: errorSchema },
  tags: ["Admin"],
}

export const customerOrdersRouteSchema = {
  params: z.object({ id: z.string().uuid() }),
  querystring: customerOrderHistoryQuerySchema,
  response: { 200: successSchema, 401: errorSchema, 403: errorSchema, 404: errorSchema },
  tags: ["Admin"],
}

export const customerToggleStatusRouteSchema = {
  params: z.object({ id: z.string().uuid() }),
  body: toggleStatusBodySchema,
  response: { 200: successSchema, 401: errorSchema, 403: errorSchema, 404: errorSchema },
  tags: ["Admin"],
}

export const staffListRouteSchema = {
  querystring: staffListQuerySchema,
  response: { 200: successSchema, 401: errorSchema, 403: errorSchema },
  tags: ["Admin"],
}

export const staffDetailRouteSchema = {
  params: z.object({ id: z.string().uuid() }),
  response: { 200: successSchema, 401: errorSchema, 403: errorSchema, 404: errorSchema },
  tags: ["Admin"],
}

export const createStaffRouteSchema = {
  body: createStaffBodySchema,
  response: { 201: successSchema, 400: errorSchema, 401: errorSchema, 403: errorSchema, 409: errorSchema },
  tags: ["Admin"],
}

export const updateStaffRouteSchema = {
  params: z.object({ id: z.string().uuid() }),
  body: updateStaffBodySchema,
  response: { 200: successSchema, 400: errorSchema, 401: errorSchema, 403: errorSchema, 404: errorSchema },
  tags: ["Admin"],
}

export const staffToggleStatusRouteSchema = {
  params: z.object({ id: z.string().uuid() }),
  body: toggleStatusBodySchema,
  response: { 200: successSchema, 401: errorSchema, 403: errorSchema, 404: errorSchema },
  tags: ["Admin"],
}

export const staffResetPasswordRouteSchema = {
  params: z.object({ id: z.string().uuid() }),
  response: { 200: successSchema, 401: errorSchema, 403: errorSchema, 404: errorSchema },
  tags: ["Admin"],
}

export const auditLogListRouteSchema = {
  querystring: auditLogListQuerySchema,
  response: { 200: successSchema, 401: errorSchema, 403: errorSchema },
  tags: ["Admin"],
}

export const systemActivityRouteSchema = {
  querystring: auditLogListQuerySchema,
  response: { 200: successSchema, 401: errorSchema, 403: errorSchema },
  tags: ["Admin"],
}

export const paymentListRouteSchema = {
  querystring: paymentListQuerySchema,
  response: { 200: successSchema, 401: errorSchema, 403: errorSchema },
  tags: ["Admin"],
}

export const paymentDetailRouteSchema = {
  params: z.object({ id: z.string().uuid() }),
  response: { 200: successSchema, 401: errorSchema, 403: errorSchema, 404: errorSchema },
  tags: ["Admin"],
}

export const orderListQuerySchema = paginationQuerySchema.extend({
  status: z.string().optional(),
})

export const orderListRouteSchema = {
  querystring: orderListQuerySchema,
  response: { 200: successSchema, 401: errorSchema, 403: errorSchema },
  tags: ["Admin"],
}

export const orderDetailRouteSchema = {
  params: z.object({ id: z.string().uuid() }),
  response: { 200: successSchema, 401: errorSchema, 403: errorSchema, 404: errorSchema },
  tags: ["Admin"],
}

export const updateOrderStatusRouteSchema = {
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    status: z.string().min(1),
    reason: z.string().max(500).optional(),
  }),
  response: { 200: successSchema, 400: errorSchema, 401: errorSchema, 403: errorSchema, 404: errorSchema },
  tags: ["Admin"],
}
