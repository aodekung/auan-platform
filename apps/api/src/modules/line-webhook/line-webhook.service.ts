/**
 * LINE Webhook Service — processes incoming LINE webhook events.
 *
 * Responsibilities:
 * - Verify webhook signature (via line-messaging.ts)
 * - Route events to appropriate handlers by type
 * - Handle follow, unfollow, message, and postback events
 * - Always return quickly (LINE requires response within 5s)
 *
 * Per 100-security-rules.md: Never trust client-side identity.
 * Per 159-notification-rules.md: Log all webhook events.
 */

import type { LineEvent, LineFollowEvent, LineUnfollowEvent } from "./line-webhook.types.js"
import { verifyWebhookSignature } from "../../lib/line-messaging.js"

// ─────────────────────────────────────────────────────────────
// Webhook Processing
// ─────────────────────────────────────────────────────────────

export interface WebhookProcessResult {
  processed: number
  errors: number
}

/**
 * Verify and process incoming LINE webhook events.
 *
 * Flow:
 *   1. Verify X-Line-Signature against raw body
 *   2. Parse events array
 *   3. Process each event by type
 *   4. Return summary (never throw — always return 200 to LINE)
 */
export function processWebhook(
  rawBody: string,
  signature: string,
  events: LineEvent[],
): WebhookProcessResult {
  // Step 1: Verify signature
  const isValid = verifyWebhookSignature(rawBody, signature)
  if (!isValid) {
    return { processed: 0, errors: 1 }
  }

  // Step 2: Process each event
  let processed = 0
  let errors = 0

  for (const event of events) {
    try {
      processEvent(event)
      processed++
    } catch {
      errors++
    }
  }

  return { processed, errors }
}

// ─────────────────────────────────────────────────────────────
// Event Handlers
// ─────────────────────────────────────────────────────────────

function processEvent(event: LineEvent): void {
  switch (event.type) {
    case "follow":
      handleFollow(event as LineFollowEvent)
      break
    case "unfollow":
      handleUnfollow(event as LineUnfollowEvent)
      break
    case "message":
      handleMessage(event)
      break
    case "postback":
      handlePostback(event)
      break
    default:
      // Ignore unknown event types gracefully
      break
  }
}

/**
 * Handle follow event — customer added the official account as a friend.
 *
 * Future: auto-send welcome message, log to analytics.
 */
function handleFollow(_event: LineFollowEvent): void {
  const userId = _event.source.userId
  // Log or track follow event
  // Future: send welcome message via pushMessage()
  void userId
}

/**
 * Handle unfollow event — customer blocked the official account.
 *
 * Note: LINE does not provide a reply token for unfollow events.
 * We cannot send messages back.
 */
function handleUnfollow(_event: LineUnfollowEvent): void {
  const userId = _event.source.userId
  // Log or track unfollow event
  void userId
}

/**
 * Handle message event — customer sent a text message.
 *
 * Future: implement chatbot, auto-reply, order status lookup.
 */
function handleMessage(event: LineEvent): void {
  const userId = event.source.userId
  // Log received message
  void userId
}

/**
 * Handle postback event — customer interacted with rich menu or LIFF.
 *
 * Postback data contains the action identifier.
 * Format: "action=value" (e.g., "open_menu", "open_orders").
 */
function handlePostback(event: LineEvent): void {
  const userId = event.source.userId
  const postback = (event as unknown as { postback: { data: string } }).postback
  const data = postback?.data ?? ""

  void userId
  void data
}
