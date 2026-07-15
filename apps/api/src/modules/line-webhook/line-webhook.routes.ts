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
  // addContentTypeParser with rawBody captures the original body string
  // before Fastify parses it as JSON. This is required for LINE webhook
  // signature verification (HMAC-SHA256 against raw bytes).
  app.addContentTypeParser("application/json", {
    parseAs: "string",
  }, (_req, body: string, done) => {
    done(null, body)
  })

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
