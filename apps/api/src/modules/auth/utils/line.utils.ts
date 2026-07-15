/**
 * LINE ID Token verification utility.
 *
 * Calls the LINE Platform API to verify a LINE ID Token
 * issued by LINE Login. Returns the user profile payload.
 *
 * Reference: https://developers.line.biz/en/reference/line-login/#verify-id-token
 */


import { AppError, ErrorCode } from "../../../common/errors.js"
import { env } from "../../../config/env.js"
import type { LineIdTokenPayload } from "../auth.types.js"

const LINE_VERIFY_URL = "https://api.line.me/oauth2/v2.1/verify"

/**
 * Verify a LINE ID Token with the LINE Platform API.
 *
 * POST https://api.line.me/oauth2/v2.1/verify
 * Body: { id_token, client_id }
 *
 * Returns the decoded LINE user profile.
 * Throws AppError (401) if the token is invalid, expired, or verification fails.
 */
export async function verifyLineIdToken(
  idToken: string,
): Promise<LineIdTokenPayload> {
  let response: Response
  let responseBody: Record<string, unknown>

  try {
    response = await fetch(LINE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        id_token: idToken,
        client_id: env.LINE_CHANNEL_ID,
      }),
    })
    responseBody = (await response.json()) as Record<string, unknown>
  } catch {
    throw new AppError(
      401,
      ErrorCode.AUTHENTICATION_ERROR,
      "Failed to connect to LINE verification service",
    )
  }

  // LINE API returns non-200 when token is invalid/expired
  if (!response.ok) {
    const error =
      typeof responseBody.error_description === "string"
        ? responseBody.error_description
        : "Invalid LINE ID Token"

    throw new AppError(
      401,
      ErrorCode.AUTHENTICATION_ERROR,
      `LINE token verification failed: ${error}`,
    )
  }

  // Validate required fields from LINE response
  if (typeof responseBody.sub !== "string" || responseBody.sub.length === 0) {
    throw new AppError(
      401,
      ErrorCode.AUTHENTICATION_ERROR,
      "LINE verification returned invalid user identity",
    )
  }

  return {
    sub: responseBody.sub,
    name:
      typeof responseBody.name === "string"
        ? responseBody.name
        : "Unknown",
    picture:
      typeof responseBody.picture === "string"
        ? responseBody.picture
        : undefined,
    email:
      typeof responseBody.email === "string"
        ? responseBody.email
        : undefined,
  }
}
