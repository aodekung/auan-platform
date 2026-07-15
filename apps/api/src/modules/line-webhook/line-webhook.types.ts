/**
 * LINE Webhook Types — type definitions for webhook events and DTOs.
 *
 * Per LINE Platform docs:
 * https://developers.line.biz/en/reference/messaging-api/#webhook-event-objects
 */

// ─────────────────────────────────────────────────────────────
// LINE Webhook Event Types
// ─────────────────────────────────────────────────────────────

/** Source (user who triggered the event). */
export interface LineEventSource {
  type: "user" | "group" | "room"
  userId?: string
}

/** Base webhook event structure. */
export interface LineWebhookEvent {
  type: string
  source: LineEventSource
  timestamp: number
  mode: string
  replyToken?: string
  webhookEventId: string
}

/** Message event (text messages). */
export interface LineMessageEvent extends LineWebhookEvent {
  type: "message"
  message: {
    id: string
    type: string
    text?: string
  }
}

/** Follow event (user added official account as friend). */
export interface LineFollowEvent extends LineWebhookEvent {
  type: "follow"
}

/** Unfollow event (user blocked official account). */
export interface LineUnfollowEvent extends LineWebhookEvent {
  type: "unfollow"
}

/** Postback event (rich menu / LIFF interaction). */
export interface LinePostbackEvent extends LineWebhookEvent {
  type: "postback"
  postback: {
    data: string
    params?: Record<string, string>
  }
}

/** All event types union. */
export type LineEvent =
  | LineMessageEvent
  | LineFollowEvent
  | LineUnfollowEvent
  | LinePostbackEvent

/** Incoming webhook body from LINE. */
export interface LineWebhookBody {
  destination: string
  events: LineEvent[]
}

// ─────────────────────────────────────────────────────────────
// Response DTOs
// ─────────────────────────────────────────────────────────────

export interface WebhookHealthResponse {
  status: string
  timestamp: string
}
