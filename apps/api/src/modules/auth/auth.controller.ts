/**
 * Auth Controller — handles HTTP request/response for auth endpoints.
 *
 * Per 60-coding-standard.md: Controllers parse requests, validate input,
 * delegate to services, and return responses.
 * Business logic lives in services, NOT here.
 */

import type { FastifyRequest, FastifyReply } from "fastify"

import { successResponse } from "../../common/response.js"
import { env } from "../../config/env.js"

import type { LineLoginBody, RefreshTokenBody } from "./auth.schema.js"
import { logout, loginWithLine, getMe, refreshTokens, loginWithStaff, refreshStaffToken, staffLogout, getStaffMe } from "./auth.service.js"
import type { JwtPayload } from "./auth.types.js"
import {
  clearTokenCookies,
  isCookieAuthEnabled,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "./utils/jwt.utils.js"

// ─────────────────────────────────────────────────────────────
// POST /api/v1/auth/line
// ─────────────────────────────────────────────────────────────

export async function lineLoginHandler(
  request: FastifyRequest<{ Body: LineLoginBody }>,
  reply: FastifyReply,
): Promise<void> {
  const { idToken } = request.body
  const result = await loginWithLine(request.server, idToken)

  // Set cookies if cookie auth is enabled
  if (isCookieAuthEnabled()) {
    setAccessTokenCookie(reply, result.accessToken)
    setRefreshTokenCookie(
      reply,
      result.refreshToken,
      env.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60,
    )
  }

  void reply.code(200).send(
    successResponse(result, "Login successful"),
  )
}

// ─────────────────────────────────────────────────────────────
// POST /api/v1/auth/refresh
// ─────────────────────────────────────────────────────────────

export async function refreshHandler(
  request: FastifyRequest<{ Body: RefreshTokenBody }>,
  reply: FastifyReply,
): Promise<void> {
  const { refreshToken } = request.body
  const result = await refreshTokens(request.server, refreshToken)

  // Set cookies if cookie auth is enabled
  if (isCookieAuthEnabled()) {
    setAccessTokenCookie(reply, result.accessToken)
    setRefreshTokenCookie(
      reply,
      result.refreshToken,
      env.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60,
    )
  }

  void reply.code(200).send(
    successResponse(result, "Token refreshed successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// POST /api/v1/auth/logout
// ─────────────────────────────────────────────────────────────

export async function logoutHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = request.user as unknown as JwtPayload

  // Try to get refresh token from body (optional) for single-device logout
  const body = request.body as { refreshToken?: string } | undefined
  const refreshTokenPlaintext = body?.refreshToken

  await logout(user.userId, refreshTokenPlaintext)

  // Clear cookies if cookie auth is enabled
  if (isCookieAuthEnabled()) {
    clearTokenCookies(reply)
  }

  void reply.code(200).send(
    successResponse(null, "Logged out successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/auth/me
// ─────────────────────────────────────────────────────────────

export async function meHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = request.user as unknown as JwtPayload
  const profile = await getMe(user.userId)

  void reply.code(200).send(
    successResponse(profile, "Profile retrieved successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// Staff Auth Handlers
// ─────────────────────────────────────────────────────────────

export async function staffLoginHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = request.body as { email: string; password: string }
  const result = await loginWithStaff(request.server, body.email, body.password)
  void reply.code(200).send(successResponse(result))
}

export async function staffRefreshHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = request.body as { sessionToken: string }
  const result = await refreshStaffToken(request.server, body.sessionToken)
  void reply.code(200).send(successResponse(result))
}

export async function staffLogoutHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const staff = (request as unknown as Record<string, unknown>).staff as { staffId: string }
  const body = request.body as { sessionToken?: string } | null
  await staffLogout(staff.staffId, body?.sessionToken)
  void reply.code(200).send(successResponse(null, "Logged out successfully"))
}

export async function staffMeHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const staff = (request as unknown as Record<string, unknown>).staff as { staffId: string }
  const result = await getStaffMe(staff.staffId)
  void reply.code(200).send(successResponse(result))
}
