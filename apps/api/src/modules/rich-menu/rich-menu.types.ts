/**
 * Rich Menu Types — type definitions for rich menu configuration and DTOs.
 */

import type { RichMenuConfig, RichMenuResponse } from "../../lib/line-rich-menu.js"

// ─────────────────────────────────────────────────────────────
// Rich Menu Area Configuration (simplified for API)
// ─────────────────────────────────────────────────────────────

export interface RichMenuAreaInput {
  label: string
  action: "uri" | "message"
  uri?: string
  text?: string
}

export interface RichMenuTabInput {
  label: string
  path: string
}

// ─────────────────────────────────────────────────────────────
// Deploy Request / Response
// ─────────────────────────────────────────────────────────────

export interface DeployRichMenuRequest {
  name?: string
  chatBarText?: string
  tabs?: RichMenuTabInput[]
  imagePath?: string
}

export interface DeployRichMenuResponse {
  richMenuId: string
  name: string
  isDefault: boolean
}

// ─────────────────────────────────────────────────────────────
// List Response
// ─────────────────────────────────────────────────────────────

export interface RichMenuListItem {
  richMenuId: string
}

export interface ListRichMenusResponse {
  richMenus: RichMenuListItem[]
}

// ─────────────────────────────────────────────────────────────
// Internal config builder (converts tabs to LINE Rich Menu format)
// ─────────────────────────────────────────────────────────────

export interface BuiltRichMenuConfig extends RichMenuConfig {
  _built: true
}
