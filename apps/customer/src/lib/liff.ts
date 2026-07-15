/**
 * LIFF SDK Wrapper — pure utility functions wrapping @line/liff.
 *
 * No React dependencies. Callers are responsible for handling
 * React state / side effects (see use-liff.ts for the React hook).
 *
 * LIFF_ID is read from VITE_LIFF_ID env var (Vite client prefix).
 * If missing, all operations are no-ops — the app works in
 * standalone browser mode without LINE.
 */

import liff from "@line/liff"

const LIFF_ID = import.meta.env.VITE_LIFF_ID as string | undefined

let initialized = false
let initPromise: Promise<boolean> | null = null

// ─────────────────────────────────────────────────────────────
// Initialization
// ─────────────────────────────────────────────────────────────

/**
 * Initialize LIFF SDK. Safe to call multiple times — only
 * initializes once (singleton). Returns true on success.
 */
export async function initLiff(): Promise<boolean> {
  if (initialized) return true

  // Prevent concurrent init calls
  if (initPromise) return initPromise

  initPromise = initLiffImpl()
  return initPromise
}

async function initLiffImpl(): Promise<boolean> {
  if (!LIFF_ID) {
    console.warn("[liff] VITE_LIFF_ID not set — running in standalone mode")
    return false
  }

  try {
    await liff.init({ liffId: LIFF_ID })
    initialized = true
    return true
  } catch (error) {
    console.error("[liff] Initialization failed:", error)
    return false
  }
}

// ─────────────────────────────────────────────────────────────
// Login State
// ─────────────────────────────────────────────────────────────

/** Check whether the user is logged in to LINE within the LIFF app. */
export function isLiffLoggedIn(): boolean {
  return initialized && liff.isLoggedIn()
}

// ─────────────────────────────────────────────────────────────
// Authentication
// ─────────────────────────────────────────────────────────────

/**
 * Start LINE login flow. Redirects away from the page.
 * After authorization, LINE redirects back and the page reloads.
 */
export function liffLogin(): void {
  if (!initialized) return
  liff.login()
}

/**
 * Retrieve the LIFF ID Token (JWT issued by LINE).
 * Must be called after login or when already logged in.
 */
export function getLiffIdToken(): string | undefined {
  if (!initialized) return undefined
  try {
    return liff.getIDToken() ?? undefined
  } catch {
    return undefined
  }
}

/** Log out of LINE session within LIFF. */
export function liffLogout(): void {
  if (!initialized) return
  try {
    liff.logout()
  } catch {
    // Best-effort — LIFF logout can fail if already logged out
  }
}

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────

/** Get LIFF context: OS, language, viewport, LIFF ID, etc. */
export function getLiffContext(): ReturnType<typeof liff.getContext> | null {
  if (!initialized) return null
  return liff.getContext()
}

// ─────────────────────────────────────────────────────────────
// Share (via LINE shareTargetPicker)
// ─────────────────────────────────────────────────────────────

interface ShareOptions {
  /** Share body text. */
  text: string
  /** Optional URL appended after the text. */
  url?: string
}

/**
 * Open LINE's shareTargetPicker with the given message.
 * Requires LIFF to be running inside the LINE app.
 * Falls back to `openLiffUrl` on external browsers.
 * Returns true if the user completed sharing.
 */
export async function shareToLine({ text, url }: ShareOptions): Promise<boolean> {
  if (!initialized) return false

  if (!liff.isApiAvailable("shareTargetPicker")) {
    // External browser — open a URL-based share instead
    if (url) openLiffUrl(url)
    return false
  }

  try {
    await liff.shareTargetPicker([{ type: "text", text: url ? `${text}\n${url}` : text }])
    return true
  } catch (error) {
    // shareTargetPicker throws if user cancels — that's fine
    if ((error as { code?: string }).code === "SHARE_TARGET_PICKER_CANCELED") return false
    console.error("[liff] shareTargetPicker failed:", error)
    return false
  }
}

/** Build the full LIFF URL for a given path (uses VITE_LIFF_ID). */
function buildShareUrl(path: string): string | undefined {
  if (!LIFF_ID) return undefined
  return `https://liff.line.me/${LIFF_ID}/${path.replace(/^\//, "")}`
}

/** Share a specific product — e.g. from product detail page. */
export function shareProduct(productId: string, name: string): Promise<boolean> {
  const url = buildShareUrl(`/product/${productId}`)
  return shareToLine({ text: `อยากแชร์เมนู "${name}" จากร้านอ้วนอ้วนหม่าล่าทอด 🥢`, url })
}

/** Share the store homepage. */
export function shareStore(): Promise<boolean> {
  const url = buildShareUrl("/")
  return shareToLine({ text: "มาสั่งหม่าล่าทอดกันเถอะ! 🥢🔥", url })
}

/** Share a promotion with an optional description. */
export function sharePromotion(title: string, description?: string): Promise<boolean> {
  const url = buildShareUrl("/")
  return shareToLine({
    text: description
      ? `🔥 ${title}\n${description}`
      : `🔥 ${title}`,
    url,
  })
}

// ─────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────

/** Whether LIFF SDK is available (i.e., LIFF_ID was configured). */
export function isLiffAvailable(): boolean {
  return Boolean(LIFF_ID)
}

/** Open an external URL in the LINE in-app browser. */
export function openLiffUrl(url: string): void {
  if (!initialized) return
  liff.openWindow({ url, external: true })
}
