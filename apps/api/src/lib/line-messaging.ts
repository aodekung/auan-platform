/**
 * LINE Messaging API Client — pure fetch-based client.
 *
 * Sends push/multicast/broadcast messages via the LINE Messaging API.
 * Uses `LINE_MESSAGING_ACCESS_TOKEN` (falls back to `LINE_CHANNEL_ACCESS_TOKEN`).
 *
 * No npm dependency required — uses native fetch.
 *
 * Reference: https://developers.line.biz/en/reference/messaging-api/
 */

import crypto from "node:crypto"

import { env } from "../config/env.js"

const MESSAGING_API_BASE = "https://api.line.me/v2/bot"

// ─────────────────────────────────────────────────────────────
// Token resolution
// ─────────────────────────────────────────────────────────────

function getMessagingAccessToken(): string {
  return (
    env.LINE_MESSAGING_ACCESS_TOKEN ?? env.LINE_CHANNEL_ACCESS_TOKEN ?? ""
  )
}

// ─────────────────────────────────────────────────────────────
// Common headers
// ─────────────────────────────────────────────────────────────

function getHeaders(): Record<string, string> {
  const token = getMessagingAccessToken()
  if (!token) {
    throw new Error("LINE Messaging API access token is not configured")
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}

// ─────────────────────────────────────────────────────────────
// Push / Multicast / Broadcast
// ─────────────────────────────────────────────────────────────

/**
 * Send a push message to a single user.
 */
export async function pushMessage(
  lineUserId: string,
  messages: LineMessage[],
): Promise<void> {
  const response = await fetch(`${MESSAGING_API_BASE}/message/push`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ to: lineUserId, messages }),
  })

  if (!response.ok) {
    const body = (await response.json()) as Record<string, unknown>
    throw new Error(
      `LINE Messaging API push failed: ${body.message ?? response.statusText}`,
    )
  }
}

/**
 * Send messages to multiple users (up to 150).
 */
export async function multicast(
  lineUserIds: string[],
  messages: LineMessage[],
): Promise<void> {
  const response = await fetch(`${MESSAGING_API_BASE}/message/multicast`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ to: lineUserIds, messages }),
  })

  if (!response.ok) {
    const body = (await response.json()) as Record<string, unknown>
    throw new Error(
      `LINE Messaging API multicast failed: ${body.message ?? response.statusText}`,
    )
  }
}

/**
 * Broadcast a message to all friends of the LINE Official Account.
 */
export async function broadcast(
  messages: LineMessage[],
): Promise<void> {
  const response = await fetch(`${MESSAGING_API_BASE}/message/broadcast`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ messages }),
  })

  if (!response.ok) {
    const body = (await response.json()) as Record<string, unknown>
    throw new Error(
      `LINE Messaging API broadcast failed: ${body.message ?? response.statusText}`,
    )
  }
}

// ─────────────────────────────────────────────────────────────
// Webhook Signature Verification
// ─────────────────────────────────────────────────────────────

/**
 * Verify the X-Line-Signature header against the request body.
 * Uses LINE_CHANNEL_SECRET to compute the HMAC-SHA256 signature.
 *
 * Returns true if the signature matches.
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
): boolean {
  if (!env.LINE_CHANNEL_SECRET) {
    throw new Error("LINE_CHANNEL_SECRET is not configured")
  }

  const expected = crypto
    .createHmac("sha256", env.LINE_CHANNEL_SECRET)
    .update(body)
    .digest("base64")

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature),
  )
}

// ─────────────────────────────────────────────────────────────
// Message Types
// ─────────────────────────────────────────────────────────────

/** LINE Messaging API message types supported by this client. */
export type LineMessage = LineTextMessage

export interface LineTextMessage {
  type: "text"
  text: string
}

// ─────────────────────────────────────────────────────────────
// Convenience: create text message helper
// ─────────────────────────────────────────────────────────────

/**
 * Create a text message object for use with push/multicast/broadcast.
 */
export function textMessage(text: string): LineMessage {
  return { type: "text", text }
}
