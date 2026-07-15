/**
 * Rich Menu Service — manages LINE Rich Menu deployment.
 *
 * Responsibilities:
 * - Build Rich Menu config from tab definitions
 * - Create Rich Menu on LINE platform
 * - Upload Rich Menu image
 * - Set as default Rich Menu
 * - List registered Rich Menus
 *
 * Default Rich Menu layout (2500x1686 px, 4 tabs):
 *   ┌──────────┬──────────┐
 *   │   🏠      │   📋     │
 *   │  Home     │  Menu    │
 *   ├──────────┼──────────┤
 *   │  📦       │  👤     │
 *   │  Orders   │ Profile  │
 *   └──────────┴──────────┘
 */

import { AppError, ErrorCode } from "../../common/errors.js"
import { env } from "../../config/env.js"
import {
  type RichMenuArea,
  type RichMenuConfig,
  buildLiffUrl,
  createRichMenu,
  deleteRichMenu,
  getDefaultRichMenu,
  listRichMenus,
  setDefaultRichMenu,
  uploadRichMenuImage,
} from "../../lib/line-rich-menu.js"

import type {
  DeployRichMenuRequest,
  DeployRichMenuResponse,
  ListRichMenusResponse,
  RichMenuTabInput,
} from "./rich-menu.types.js"

// ─────────────────────────────────────────────────────────────
// Default Configuration
// ─────────────────────────────────────────────────────────────

const DEFAULT_TABS: RichMenuTabInput[] = [
  { label: "หน้าแรก", path: "/" },
  { label: "เมนูอาหาร", path: "/menu" },
  { label: "ออเดอร์", path: "/orders" },
  { label: "โปรไฟล์", path: "/profile" },
]

const DEFAULT_NAME = "Auan-Auan Main Menu"
const DEFAULT_CHAT_BAR_TEXT = "เปิดเมนู"

// ─────────────────────────────────────────────────────────────
// Config Builder
// ─────────────────────────────────────────────────────────────

/**
 * Build a LINE Rich Menu config from tab definitions.
 *
 * Rich Menu image is 2500x1686 px, split into a 2x2 grid.
 * Each tab occupies half the width and half the height.
 */
function buildConfigFromTabs(tabs: RichMenuTabInput[]): RichMenuConfig {
  const tabsToUse = tabs.length >= 4 ? tabs.slice(0, 4) : tabs
  const count = tabsToUse.length

  const areas: RichMenuArea[] = tabsToUse.map((tab, index) => {
    const col = index % 2
    const row = Math.floor(index / 2)
    const x = col * 1250
    const y = row * 843

    const action =
      tab.path === "/orders" || tab.path === "/profile"
        ? { type: "uri" as const, label: tab.label, uri: buildLiffUrl(tab.path) }
        : { type: "uri" as const, label: tab.label, uri: buildLiffUrl(tab.path) }

    return {
      bounds: {
        x,
        y,
        width: 1250,
        height: count <= 2 ? 1686 : 843,
      },
      action,
    }
  })

  return {
    size: { width: 2500, height: 1686 },
    selected: true,
    name: DEFAULT_NAME,
    chatBarText: DEFAULT_CHAT_BAR_TEXT,
    areas,
  }
}

// ─────────────────────────────────────────────────────────────
// Deploy
// ─────────────────────────────────────────────────────────────

/**
 * Deploy a Rich Menu to LINE.
 *
 * Flow:
 *   1. Build config from tabs (or use defaults)
 *   2. Create Rich Menu on LINE → get richMenuId
 *   3. Upload image if provided
 *   4. Set as default
 *
 * If a previous default exists, it is replaced.
 */
export async function deployRichMenu(
  request?: DeployRichMenuRequest,
): Promise<DeployRichMenuResponse> {
  if (!env.LIFF_ID && !env.FRONTEND_URL) {
    throw new AppError(
      500,
      ErrorCode.INTERNAL_ERROR,
      "LIFF_ID or FRONTEND_URL must be configured to deploy a Rich Menu",
    )
  }

  const tabs = request?.tabs ?? DEFAULT_TABS
  const config = buildConfigFromTabs(tabs)
  config.name = request?.name ?? DEFAULT_NAME
  config.chatBarText = request?.chatBarText ?? DEFAULT_CHAT_BAR_TEXT

  // Step 1: Create Rich Menu
  const richMenuId = await createRichMenu(config)

  // Step 2: Upload image if provided
  if (request?.imagePath) {
    try {
      await uploadRichMenuImage(richMenuId, request.imagePath)
    } catch {
      // If image upload fails, delete the Rich Menu to avoid broken state
      await deleteRichMenu(richMenuId)
      throw new AppError(
        400,
        ErrorCode.VALIDATION_ERROR,
        "Rich Menu image upload failed. Rich Menu creation rolled back.",
      )
    }
  }

  // Step 3: Set as default
  await setDefaultRichMenu(richMenuId)

  return {
    richMenuId,
    name: config.name,
    isDefault: true,
  }
}

// ─────────────────────────────────────────────────────────────
// List
// ─────────────────────────────────────────────────────────────

/**
 * List all registered Rich Menus on the LINE platform.
 */
export async function listAllRichMenus(): Promise<ListRichMenusResponse> {
  const menus = await listRichMenus()
  return {
    richMenus: menus.map((m) => ({ richMenuId: m.richMenuId })),
  }
}

/**
 * Get the current default Rich Menu ID.
 */
export async function getCurrentDefaultRichMenu(): Promise<string | null> {
  return getDefaultRichMenu()
}
