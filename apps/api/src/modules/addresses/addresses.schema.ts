/**
 * Zod validation schemas for the Addresses module.
 *
 * Every request body is validated through these schemas
 * before reaching the service layer (per 90-api-rules.md).
 *
 * Per 100-security-rules.md: validate all external input.
 * Building must be exactly A, B, C, D (Regent Home Bangson Phase 27 & 28).
 */

import { z } from "zod"

import { BUILDINGS } from "./addresses.types.js"

// ─────────────────────────────────────────────────────────────
// Request Schemas
// ─────────────────────────────────────────────────────────────

export const createAddressBodySchema = z.object({
  building: z.enum(BUILDINGS, {
    required_error: "Building is required (A, B, C, D)",
    invalid_type_error: "Building must be one of A, B, C, D",
  }),
  roomNumber: z
    .string({ required_error: "Room number is required" })
    .min(1, "Room number is required"),
  note: z
    .string()
    .max(500, "Note must not exceed 500 characters")
    .optional(),
  isDefault: z.boolean().optional(),
})

export type CreateAddressBody = z.infer<typeof createAddressBodySchema>

export const updateAddressBodySchema = z.object({
  building: z.enum(BUILDINGS, {
    invalid_type_error: "Building must be one of A, B, C, D",
  }).optional(),
  roomNumber: z.string().min(1, "Room number must not be empty").optional(),
  note: z.string().max(500, "Note must not exceed 500 characters").optional(),
})

export type UpdateAddressBody = z.infer<typeof updateAddressBodySchema>

// ─────────────────────────────────────────────────────────────
// Response Schemas (for Swagger)
// ─────────────────────────────────────────────────────────────

const addressResponseSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  building: z.string(),
  roomNumber: z.string().nullable(),
  note: z.string().nullable(),
  isDefault: z.boolean(),
  createdAt: z.string(),
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
// Route Schemas (Fastify route options for Swagger)
// ─────────────────────────────────────────────────────────────

/** GET /api/v1/addresses */
export const listAddressesRouteSchema = {
  description: "List all addresses for the authenticated customer",
  tags: ["Addresses"],
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      success: z.literal(true),
      data: z.array(addressResponseSchema),
      message: z.string(),
    }),
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** POST /api/v1/addresses */
export const createAddressRouteSchema = {
  description: "Create a new delivery address",
  tags: ["Addresses"],
  security: [{ bearerAuth: [] }],
  body: createAddressBodySchema,
  response: {
    201: z.object({
      success: z.literal(true),
      data: addressResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** PATCH /api/v1/addresses/:id */
export const updateAddressRouteSchema = {
  description: "Update an existing address",
  tags: ["Addresses"],
  security: [{ bearerAuth: [] }],
  body: updateAddressBodySchema,
  params: z.object({
    id: z.string({ required_error: "Address ID is required" }),
  }),
  response: {
    200: z.object({
      success: z.literal(true),
      data: addressResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** DELETE /api/v1/addresses/:id */
export const deleteAddressRouteSchema = {
  description: "Delete an address",
  tags: ["Addresses"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    id: z.string({ required_error: "Address ID is required" }),
  }),
  response: {
    200: z.object({
      success: z.literal(true),
      data: z.object({ id: z.string() }),
      message: z.string(),
    }),
    401: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** PATCH /api/v1/addresses/:id/default */
export const setDefaultAddressRouteSchema = {
  description: "Set an address as the default address",
  tags: ["Addresses"],
  security: [{ bearerAuth: [] }],
  params: z.object({
    id: z.string({ required_error: "Address ID is required" }),
  }),
  response: {
    200: z.object({
      success: z.literal(true),
      data: addressResponseSchema,
      message: z.string(),
    }),
    401: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const
