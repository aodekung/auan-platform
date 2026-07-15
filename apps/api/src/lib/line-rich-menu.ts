/**
 * LINE Rich Menu API Client — pure fetch-based client.
 *
 * Creates, uploads, and manages LINE Rich Menus via the
 * LINE Messaging API's Rich Menu endpoints.
 *
 * No npm dependency required — uses native fetch.
 *
 * Reference: https://developers.line.biz/en/reference/messaging-api/#rich-menu
 */

import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

import { env } from "../config/env.js"

const RICH_MENU_API_BASE = "https://api.line.me/v2/bot/richmenu"

// ─────────────────────────────────────────────────────────────
// Token / Headers
// ─────────────────────────────────────────────────────────────

function getHeaders(): Record<string, string> {
  const token =
    env.LINE_MESSAGING_ACCESS_TOKEN ?? env.LINE_CHANNEL_ACCESS_TOKEN ?? ""
  if (!token) {
    throw new Error("LINE Messaging API access token is not configured")
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface RichMenuArea {
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
  action: RichMenuAction
}

export interface RichMenuAction {
  type: "uri" | "message"
  label: string
  uri?: string
  text?: string
}

export interface RichMenuConfig {
  size: {
    width: number
    height: number
  }
  selected: boolean
  name: string
  chatBarText: string
  areas: RichMenuArea[]
}

export interface RichMenuResponse {
  richMenuId: string
}

// ─────────────────────────────────────────────────────────────
// API Functions
// ─────────────────────────────────────────────────────────────

/**
 * Create a new Rich Menu on LINE platform.
 * Returns the richMenuId.
 */
export async function createRichMenu(
  config: RichMenuConfig,
): Promise<string> {
  const response = await fetch(RICH_MENU_API_BASE, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(config),
  })

  if (!response.ok) {
    const body = (await response.json()) as Record<string, unknown>
    throw new Error(
      `LINE Rich Menu create failed: ${body.message ?? response.statusText}`,
    )
  }

  const data = (await response.json()) as RichMenuResponse
  return data.richMenuId
}

/**
 * Upload a Rich Menu image.
 * Image must be JPEG or PNG, at most 1MB.
 * Size must match the rich menu dimensions.
 */
export async function uploadRichMenuImage(
  richMenuId: string,
  imagePath: string,
): Promise<void> {
  const absolutePath = resolve(imagePath)
  const imageBuffer = await readFile(absolutePath)

  const response = await fetch(`${RICH_MENU_API_BASE}/${richMenuId}/content`, {
    method: "POST",
    headers: {
      Authorization: getHeaders().Authorization,
      "Content-Type": "image/jpeg",
    },
    body: imageBuffer,
  })

  if (!response.ok) {
    const body = (await response.json()) as Record<string, unknown>
    throw new Error(
      `LINE Rich Menu image upload failed: ${body.message ?? response.statusText}`,
    )
  }
}

/**
 * Set a Rich Menu as the default for all users.
 */
export async function setDefaultRichMenu(richMenuId: string): Promise<void> {
  const token =
    env.LINE_MESSAGING_ACCESS_TOKEN ?? env.LINE_CHANNEL_ACCESS_TOKEN ?? ""

  const response = await fetch(
    `https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Length": "0",
      },
    },
  )

  if (!response.ok) {
    throw new Error(
      `LINE Rich Menu set default failed: ${response.statusText}`,
    )
  }
}

/**
 * Delete a Rich Menu.
 */
export async function deleteRichMenu(richMenuId: string): Promise<void> {
  const response = await fetch(`${RICH_MENU_API_BASE}/${richMenuId}`, {
    method: "DELETE",
    headers: getHeaders(),
  })

  if (!response.ok) {
    throw new Error(
      `LINE Rich Menu delete failed: ${response.statusText}`,
    )
  }
}

/**
 * List all Rich Menus registered on the LINE platform.
 */
export async function listRichMenus(): Promise<RichMenuResponse[]> {
  const response = await fetch(RICH_MENU_API_BASE, {
    headers: getHeaders(),
  })

  if (!response.ok) {
    throw new Error(
      `LINE Rich Menu list failed: ${response.statusText}`,
    )
  }

  return response.json() as Promise<RichMenuResponse[]>
}

/**
 * Get the default Rich Menu ID (for the user's own default).
 */
export async function getDefaultRichMenu(): Promise<string | null> {
  const token =
    env.LINE_MESSAGING_ACCESS_TOKEN ?? env.LINE_CHANNEL_ACCESS_TOKEN ?? ""

  const response = await fetch(
    "https://api.line.me/v2/bot/user/all/richmenu",
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )

  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error(
      `LINE Rich Menu get default failed: ${response.statusText}`,
    )
  }

  const data = (await response.json()) as RichMenuResponse
  return data.richMenuId
}

// ─────────────────────────────────────────────────────────────
// LIFF URL Builder
// ─────────────────────────────────────────────────────────────

/**
 * Build a LIFF URL with an optional path.
 * Uses LIFF_ID from env if configured.
 */
export function buildLiffUrl(path?: string): string {
  if (!env.LIFF_ID) {
    return env.FRONTEND_URL ?? "/"
  }

  const base = `https://liff.line.me/${env.LIFF_ID}`
  if (!path || path === "/") return base
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}
