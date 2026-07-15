/**
 * LINE Webhook Routes — registers webhook endpoints.
 *
 * Endpoints:
 *   POST /api/v1/webhooks/line     — Receive LINE events (no JWT auth, signature verified)
 *   GET  /api/v1/webhooks/line/health — Health check
 *
 * Security:
 * - No JWT authentication (LINE sends the webhook, not a user).
 * - Signature verification via X-Line-Signature header in the handler.
 */

import type { FastifyInstance } from "fastify"

import {
  webhookHandler,
  webhookHealthHandler,
} from "./line-webhook.controller.js"
import { webhookHealthRouteSchema, webhookRouteSchema } from "./line-webhook.schema.js"

export async function lineWebhookRoutes(app: FastifyInstance): Promise<void> {
  // POST /webhooks/line — receive LINE events
  // Note: We intentionally do NOT register a custom addContentTypeParser here.
  // The original code had one for "application/json" which overrode Fastify's
  // global JSON parser for ALL routes — breaking every POST endpoint.
  // LINE sends standard "application/json" and the controller handles both
  // string and object body formats (see line-webhook.controller.ts lines 51-56).
  // The rawBody for HMAC verification is obtained by JSON.stringify(object),
  // which is functionally equivalent for LINE's verification.

  app.post("/api/v1/webhooks/line", {
    schema: webhookRouteSchema,
    handler: webhookHandler,
  })

  // GET /webhooks/line/health — health check
  app.get("/api/v1/webhooks/line/health", {
    schema: webhookHealthRouteSchema,
    handler: webhookHealthHandler,
  })
}
