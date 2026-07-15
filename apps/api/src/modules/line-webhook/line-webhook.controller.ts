/**
 * LINE Webhook Controller — HTTP handlers for webhook endpoints.
 *
 * Per LINE Platform docs:
 * - Webhook must respond within 5 seconds.
 * - Always return 200 even if processing fails.
 * - Signature verification is done via X-Line-Signature header.
 */

import type { FastifyRequest, FastifyReply } from "fastify"

import { successResponse } from "../../common/response.js"
import { processWebhook } from "./line-webhook.service.js"
import type { LineWebhookBody } from "./line-webhook.types.js"

// ─────────────────────────────────────────────────────────────
// POST /api/v1/webhooks/line
// ─────────────────────────────────────────────────────────────

/**
 * Receive webhook events from LINE Platform.
 *
 * The raw body string is needed for signature verification (HMAC-SHA256),
 * so we read it from request.body which Fastify parses as JSON.
 *
 * LINE sends the raw body and expects a 200 response within 5 seconds.
 */
export async function webhookHandler(
  request: FastifyRequest<{
    Body: LineWebhookBody
    Headers: { "x-line-signature"?: string }
  }>,
  reply: FastifyReply,
): Promise<void> {
  const signature = request.headers["x-line-signature"]
  const body = request.body

  if (!signature) {
    void reply.code(401).send(
      successResponse({ error: "Missing X-Line-Signature" }, "Unauthorized"),
    )
    return
  }

  const result = processWebhook(
    JSON.stringify(body),
    signature,
    body.events,
  )

  void reply.code(200).send(
    successResponse(
      { processed: result.processed, errors: result.errors },
      "Webhook received",
    ),
  )
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/webhooks/line/health
// ─────────────────────────────────────────────────────────────

/**
 * Health check for the webhook endpoint.
 * Used by monitoring tools and LINE Developers Console verification.
 */
export async function webhookHealthHandler(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  void reply.code(200).send(
    successResponse(
      { status: "ok", timestamp: new Date().toISOString() },
      "Webhook endpoint is active",
    ),
  )
}
