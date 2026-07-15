/**
 * Auth routes — registers all /api/v1/auth/* endpoints.
 *
 * Endpoints:
 *   POST /api/v1/auth/line     — LINE Login (public)
 *   POST /api/v1/auth/refresh  — Refresh tokens (public, has refresh token)
 *   POST /api/v1/auth/logout    — Logout (authenticated)
 *   GET  /api/v1/auth/me        — Current user profile (authenticated)
 */

import type { FastifyInstance } from "fastify"

import {
  lineLoginHandler,
  logoutHandler,
  meHandler,
  updateMeHandler,
  refreshHandler,
  staffLoginHandler,
  staffLogoutHandler,
  staffMeHandler,
  staffRefreshHandler,
} from "./auth.controller.js"
import { authenticate, authenticateStaff } from "./auth.middleware.js"
import {
  lineLoginRouteSchema,
  logoutRouteSchema,
  meRouteSchema,
  updateMeRouteSchema,
  refreshRouteSchema,
  staffLoginRouteSchema,
  staffLogoutRouteSchema,
  staffMeRouteSchema,
  staffRefreshRouteSchema,
} from "./auth.schema.js"

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // ── POST /auth/line ────────────────────────────────────────
  // Public endpoint — no authentication required.
  // Stricter rate limit: 10 req/min (override global 100/min).
  app.post("/api/v1/auth/line", {
    schema: lineLoginRouteSchema,
    config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    handler: lineLoginHandler,
  })

  // ── POST /auth/refresh ────────────────────────────────────
  // Public endpoint — refresh token is sent in the body.
  app.post("/api/v1/auth/refresh", {
    schema: refreshRouteSchema,
    handler: refreshHandler,
  })

  // ── POST /auth/logout ──────────────────────────────────────
  // Requires valid JWT access token.
  app.post("/api/v1/auth/logout", {
    schema: logoutRouteSchema,
    preHandler: [authenticate],
    handler: logoutHandler,
  })

  // ── GET /auth/me ──────────────────────────────────────────
  // Requires valid JWT access token.
  app.get("/api/v1/auth/me", {
    schema: meRouteSchema,
    preHandler: [authenticate],
    handler: meHandler,
  })

  // ── PATCH /auth/me ────────────────────────────────────────
  // Requires valid JWT access token.
  app.patch("/api/v1/auth/me", {
    schema: updateMeRouteSchema,
    preHandler: [authenticate],
    handler: updateMeHandler,
  })

  // ── POST /auth/staff/login ────────────────────────────────
  app.post("/api/v1/auth/staff/login", {
    schema: staffLoginRouteSchema,
    handler: staffLoginHandler,
  })

  // ── POST /auth/staff/refresh ─────────────────────────────
  app.post("/api/v1/auth/staff/refresh", {
    schema: staffRefreshRouteSchema,
    handler: staffRefreshHandler,
  })

  // ── POST /auth/staff/logout ──────────────────────────────
  app.post("/api/v1/auth/staff/logout", {
    schema: staffLogoutRouteSchema,
    preHandler: [authenticateStaff],
    handler: staffLogoutHandler,
  })

  // ── GET /auth/staff/me ──────────────────────────────────
  app.get("/api/v1/auth/staff/me", {
    schema: staffMeRouteSchema,
    preHandler: [authenticateStaff],
    handler: staffMeHandler,
  })
}
