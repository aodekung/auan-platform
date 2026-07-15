/**
 * JWT utility functions for the Auth module.
 *
 * Wraps @fastify/jwt token operations with typed payload support.
 * Access Token: 24h expiry (per 175-authentication-authorization.md).
 * Refresh Token: opaque string (NOT a JWT), handled by hash.utils.ts.
 */

import type { FastifyInstance, FastifyReply } from "fastify"

import { env } from "../../../config/env.js"
import type { JwtPayload } from "../auth.types.js"

/** Cookie name for access token (used when AUTH_TOKEN_SOURCE includes "cookie"). */
export const ACCESS_TOKEN_COOKIE_NAME = "access_token"

/** Cookie name for refresh token (used when AUTH_TOKEN_SOURCE includes "cookie"). */
export const REFRESH_TOKEN_COOKIE_NAME = "refresh_token"

/**
 * Generate a signed JWT access token.
 *
 * Payload contains only non-sensitive identifiers —
 * never store secrets or personal data in JWT (per 175-auth).
 */
export function generateAccessToken(
  app: FastifyInstance,
  payload: JwtPayload,
): string {
  return app.jwt.sign(payload, { expiresIn: "24h" })
}

/**
 * Verify and decode a JWT access token.
 *
 * Returns the typed payload if the token is valid and not expired.
 * Throws on invalid signature, malformed token, or expiration.
 */
export function verifyAccessToken(
  app: FastifyInstance,
  token: string,
): JwtPayload {
  return app.jwt.verify<JwtPayload>(token)
}

/**
 * Set the access token as an httpOnly cookie on the reply.
 * Only used when AUTH_TOKEN_SOURCE is "cookie" or "both".
 */
export function setAccessTokenCookie(
  reply: FastifyReply,
  token: string,
): void {
  reply.setCookie(ACCESS_TOKEN_COOKIE_NAME, token, {
    httpOnly: env.JWT_COOKIE_HTTP_ONLY,
    secure: env.JWT_COOKIE_SECURE,
    sameSite: env.JWT_COOKIE_SAME_SITE,
    path: env.JWT_COOKIE_PATH,
    domain: env.JWT_COOKIE_DOMAIN ?? undefined,
    maxAge: 24 * 60 * 60, // 24 hours in seconds
  })
}

/**
 * Set the refresh token as an httpOnly cookie on the reply.
 * Only used when AUTH_TOKEN_SOURCE is "cookie" or "both".
 */
export function setRefreshTokenCookie(
  reply: FastifyReply,
  token: string,
  maxAgeSeconds: number,
): void {
  reply.setCookie(REFRESH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true, // Refresh tokens are ALWAYS httpOnly
    secure: env.JWT_COOKIE_SECURE,
    sameSite: env.JWT_COOKIE_SAME_SITE,
    path: env.JWT_COOKIE_PATH,
    domain: env.JWT_COOKIE_DOMAIN ?? undefined,
    maxAge: maxAgeSeconds,
  })
}

/**
 * Clear both token cookies from the reply.
 * Used during logout.
 */
export function clearTokenCookies(reply: FastifyReply): void {
  reply.clearCookie(ACCESS_TOKEN_COOKIE_NAME, {
    path: env.JWT_COOKIE_PATH,
    domain: env.JWT_COOKIE_DOMAIN ?? undefined,
  })
  reply.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    path: env.JWT_COOKIE_PATH,
    domain: env.JWT_COOKIE_DOMAIN ?? undefined,
  })
}

/**
 * Check if cookie-based authentication is enabled.
 */
export function isCookieAuthEnabled(): boolean {
  return (
    env.AUTH_TOKEN_SOURCE === "cookie" ||
    env.AUTH_TOKEN_SOURCE === "both"
  )
}
