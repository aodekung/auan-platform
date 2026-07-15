/**
 * Authentication & Authorization middleware for Fastify.
 *
 * `authenticate` — Verifies JWT (from header or cookie) and attaches user payload.
 * `authorize`   — Checks that authenticated user has the required role.
 *
 * Per 175-auth:
 * - Every protected request must verify JWT signature, expiration, and user status.
 * - Unauthorized → 401. Forbidden → 403.
 *
 * Per AUTH_TOKEN_SOURCE config:
 * - "bearer"  → reads from Authorization header only
 * - "cookie"  → reads from httpOnly cookie only
 * - "both"     → reads from header first, falls back to cookie
 */

import type { FastifyRequest, FastifyReply } from "fastify"

import { AppError, ErrorCode } from "../../common/errors.js"
import { env } from "../../config/env.js"

import { verifyStaffAccessToken } from "./staff-auth.utils.js"
import { ACCESS_TOKEN_COOKIE_NAME } from "./utils/jwt.utils.js"
import { verifyAccessToken } from "./utils/jwt.utils.js"

// ─────────────────────────────────────────────────────────────
// Authenticate — Verify JWT
// ─────────────────────────────────────────────────────────────

/**
 * Extract access token from either Authorization header or cookie.
 * Returns undefined if no token is found.
 */
function extractToken(request: FastifyRequest): string | undefined {
  // Try Authorization header first
  const authHeader = request.headers.authorization
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7)
    if (token.length > 0) return token
  }

  // Try cookie (when AUTH_TOKEN_SOURCE is "cookie" or "both")
  if (
    env.AUTH_TOKEN_SOURCE === "cookie" ||
    env.AUTH_TOKEN_SOURCE === "both"
  ) {
    const cookieToken = request.cookies[ACCESS_TOKEN_COOKIE_NAME]
    if (cookieToken && cookieToken.length > 0) return cookieToken
  }

  return undefined
}

/**
 * Fastify preHandler hook that verifies the JWT and attaches
 * the decoded payload to request.user.
 *
 * Supports both Bearer header and httpOnly cookie based auth,
 * depending on AUTH_TOKEN_SOURCE env var.
 *
 * Usage:
 *   app.get("/protected", { preHandler: [authenticate] }, handler)
 *
 * Throws 401 if:
 * - No token found in header or cookie
 * - Token is expired or has invalid signature
 */
export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const token = extractToken(request)

  if (!token) {
    throw new AppError(
      401,
      ErrorCode.AUTHENTICATION_ERROR,
      "Missing or invalid Authorization header",
    )
  }

  try {
    const payload = verifyAccessToken(request.server, token)
    // Attach typed payload to request.user for downstream handlers.
    // @fastify/jwt sets request.user on verify, but we use our own
    // verifyAccessToken wrapper, so we set it explicitly.
    ;(request as unknown as { user: typeof payload }).user = payload
  } catch {
    throw new AppError(
      401,
      ErrorCode.AUTHENTICATION_ERROR,
      "Invalid or expired access token",
    )
  }
}

// ─────────────────────────────────────────────────────────────
// Authorize — Role-based Access Control
// ─────────────────────────────────────────────────────────────

type Role = "CUSTOMER" | "OWNER"

/**
 * Factory function that returns a preHandler checking
 * that the authenticated user has one of the allowed roles.
 *
 * Must be used AFTER `authenticate` in the preHandler chain.
 *
 * Usage:
 *   app.get("/admin/dashboard", {
 *     preHandler: [authenticate, authorize("OWNER")],
 *   }, handler)
 *
 * Throws 403 if user lacks the required role.
 */
export function authorize(...allowedRoles: Role[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const user = (request as unknown as { user?: { userId: string; lineUserId: string; role: string } }).user

    if (!user) {
      throw new AppError(
        401,
        ErrorCode.AUTHENTICATION_ERROR,
        "Authentication required",
      )
    }

    if (!allowedRoles.includes(user.role as Role)) {
      throw new AppError(
        403,
        ErrorCode.AUTHORIZATION_ERROR,
        "You do not have permission to access this resource",
      )
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Authenticate Staff — Verify Staff JWT
// ─────────────────────────────────────────────────────────────

/**
 * Fastify preHandler that verifies the Staff JWT and attaches
 * the decoded payload to request.staff.
 *
 * Uses a separate JWT secret (STAFF_JWT_SECRET) from LINE auth.
 *
 * Usage:
 *   app.get("/admin/dashboard", { preHandler: [authenticateStaff] }, handler)
 *
 * Throws 401 if token is missing or invalid.
 */
export async function authenticateStaff(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(
      401,
      ErrorCode.AUTHENTICATION_ERROR,
      "Missing or invalid Authorization header",
    )
  }

  const token = authHeader.slice(7)
  if (token.length === 0) {
    throw new AppError(
      401,
      ErrorCode.AUTHENTICATION_ERROR,
      "Missing or invalid Authorization header",
    )
  }

  try {
    const payload = verifyStaffAccessToken(token)
    ;(request as unknown as Record<string, unknown>).staff = payload
  } catch {
    throw new AppError(
      401,
      ErrorCode.INVALID_STAFF_TOKEN,
      "Invalid or expired staff access token",
    )
  }
}

// ─────────────────────────────────────────────────────────────
// Authorize Staff — Role-based Access Control
// ─────────────────────────────────────────────────────────────

/**
 * Factory that returns a preHandler checking that the authenticated
 * staff has one of the allowed roles.
 *
 * Must be used AFTER `authenticateStaff` in the preHandler chain.
 *
 * Throws 403 if staff lacks the required role.
 */
export function authorizeStaff(...allowedRoles: string[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const staff = (request as unknown as Record<string, unknown>).staff as
      | { staffId: string; email: string; role: string }
      | undefined

    if (!staff) {
      throw new AppError(
        401,
        ErrorCode.AUTHENTICATION_ERROR,
        "Staff authentication required",
      )
    }

    if (!allowedRoles.includes(staff.role)) {
      throw new AppError(
        403,
        ErrorCode.AUTHORIZATION_ERROR,
        "You do not have permission to access this resource",
      )
    }
  }
}

/**
 * PreHandler that accepts EITHER Owner (LINE JWT) OR Staff (Staff JWT).
 * Verifies the token and attaches the appropriate payload to the request.
 *
 * Usage:
 *   app.get("/admin/dashboard", {
 *     preHandler: [authenticateOrStaff, authorizeOwnerOrAdmin],
 *   }, handler)
 */
export async function authenticateOrStaff(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const token = extractToken(request)

  if (!token) {
    throw new AppError(
      401,
      ErrorCode.AUTHENTICATION_ERROR,
      "Missing or invalid Authorization header",
    )
  }

  // Try Owner (LINE JWT) first
  try {
    const payload = verifyAccessToken(request.server, token)
    ;(request as unknown as { user: typeof payload }).user = payload
    return // Owner verified
  } catch {
    // Not a valid customer/owner token — try staff
  }

  // Try Staff JWT
  try {
    const payload = verifyStaffAccessToken(token)
    ;(request as unknown as Record<string, unknown>).staff = payload
    return // Staff verified
  } catch {
    // Neither token type is valid
  }

  throw new AppError(
    401,
    ErrorCode.AUTHENTICATION_ERROR,
    "Invalid or expired access token",
  )
}

/**
 * Factory that checks if the caller is Owner (LINE) or has one of the
 * allowed staff roles.
 *
 * Must be used AFTER `authenticateOrStaff`.
 */
export function authorizeOwnerOrAdmin(...allowedStaffRoles: string[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const user = (request as unknown as Record<string, unknown>).user as
      | { userId: string; lineUserId: string; role: string }
      | undefined

    if (user && user.role === "OWNER") {
      return // Owner has full access
    }

    const staff = (request as unknown as Record<string, unknown>).staff as
      | { staffId: string; email: string; role: string }
      | undefined

    if (staff && allowedStaffRoles.includes(staff.role)) {
      return // Staff with allowed role
    }

    throw new AppError(
      403,
      ErrorCode.AUTHORIZATION_ERROR,
      "You do not have permission to access this resource",
    )
  }
}
