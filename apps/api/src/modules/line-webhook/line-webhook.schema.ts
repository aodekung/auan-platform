/**
 * LINE Webhook Schema — Zod validation schemas and Fastify route schemas.
 *
 * LINE sends webhook events as POST with JSON body.
 * The endpoint must return 200 quickly (within 5 seconds).
 * No authentication — verification is done via X-Line-Signature.
 */

import { z } from "zod"

// ─────────────────────────────────────────────────────────────
// Zod Schemas (runtime validation)
// ─────────────────────────────────────────────────────────────

/** Webhook event source. */
const eventSourceSchema = z.object({
  type: z.enum(["user", "group", "room"]),
  userId: z.string().optional(),
})

/** Base event schema. */
const baseEventSchema = z.object({
  type: z.string(),
  source: eventSourceSchema,
  timestamp: z.number(),
  mode: z.string(),
  webhookEventId: z.string(),
})

/** Full webhook body schema. */
const webhookBodySchema = z.object({
  destination: z.string(),
  events: z.array(baseEventSchema.passthrough()),
})

export { webhookBodySchema }

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

export const webhookRouteSchema = {
  description: "LINE Webhook endpoint",
  tags: ["LINE Webhook"],
  body: webhookBodySchema,
  response: {
    200: successResponseSchema,
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

export const webhookHealthRouteSchema = {
  description: "Check webhook endpoint health",
  tags: ["LINE Webhook"],
  response: {
    200: successResponseSchema,
  },
} as const
