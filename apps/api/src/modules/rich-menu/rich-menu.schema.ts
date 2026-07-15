/**
 * Rich Menu Schema — Zod validation and Fastify route schemas.
 */

import { z } from "zod"

// ─────────────────────────────────────────────────────────────
// Zod Schemas
// ─────────────────────────────────────────────────────────────

const richMenuTabSchema = z.object({
  label: z.string().max(20),
  path: z.string().startsWith("/"),
})

const deployRichMenuBodySchema = z.object({
  name: z.string().max(50).optional(),
  chatBarText: z.string().max(14).optional(),
  tabs: z.array(richMenuTabSchema).optional(),
  imagePath: z.string().optional(),
})

export { deployRichMenuBodySchema }

// ─────────────────────────────────────────────────────────────
// Fastify Route Schemas
// ─────────────────────────────────────────────────────────────

const errorResponseSchema = z.object({
  success: z.boolean(),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})

const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  message: z.string().optional(),
})

export const deployRichMenuRouteSchema = {
  description: "Deploy a LINE Rich Menu (Owner only)",
  tags: ["Admin - Rich Menu"],
  security: [{ bearerAuth: [] }],
  body: deployRichMenuBodySchema,
  response: {
    200: successResponseSchema,
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

export const listRichMenusRouteSchema = {
  description: "List registered LINE Rich Menus (Owner only)",
  tags: ["Admin - Rich Menu"],
  security: [{ bearerAuth: [] }],
  response: {
    200: successResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
  },
} as const
