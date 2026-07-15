/**
 * Zod validation schemas for the Auth module.
 *
 * Every request body is validated through these schemas
 * before reaching the service layer (per 90-api-rules.md).
 *
 * Endpoints:
 *   POST /auth/line     — LINE Login
 *   POST /auth/refresh  — Refresh tokens
 *   POST /auth/logout   — Logout
 *   GET  /auth/me       — Current user
 */

import { z } from "zod"

// ─────────────────────────────────────────────────────────────
// Request Schemas
// ─────────────────────────────────────────────────────────────

/** POST /auth/line — LINE ID Token must be a non-empty string. */
export const lineLoginBodySchema = z.object({
  idToken: z
    .string({ required_error: "idToken is required" })
    .min(1, "idToken must not be empty"),
})

export type LineLoginBody = z.infer<typeof lineLoginBodySchema>

/** POST /auth/refresh — Refresh token must be a non-empty string. */
export const refreshTokenBodySchema = z.object({
  refreshToken: z
    .string({ required_error: "refreshToken is required" })
    .min(1, "refreshToken must not be empty"),
})

export type RefreshTokenBody = z.infer<typeof refreshTokenBodySchema>

/** PATCH /auth/me — Phone number update (Thai format). */
export const updateMeBodySchema = z.object({
  phone: z
    .string()
    .regex(/^0\d{8,9}$/, "Invalid Thai phone number (must start with 0, 9-10 digits)")
    .optional(),
})

export type UpdateMeBody = z.infer<typeof updateMeBodySchema>

// ─────────────────────────────────────────────────────────────
// Response Schemas (for Fastify + Swagger)
// ─────────────────────────────────────────────────────────────

const customerProfileSchema = z.object({
  id: z.string().uuid(),
  lineUserId: z.string(),
  displayName: z.string(),
  pictureUrl: z.string(),
  phone: z.string().nullable(),
  role: z.enum(["CUSTOMER", "OWNER"]),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})

const customerBasicSchema = customerProfileSchema.pick({
  id: true,
  lineUserId: true,
  displayName: true,
  pictureUrl: true,
})

// ─────────────────────────────────────────────────────────────
// Route Schemas
// ─────────────────────────────────────────────────────────────

/** POST /api/v1/auth/line */
export const lineLoginRouteSchema = {
  description: "Login with LINE ID Token",
  tags: ["Auth"],
  body: lineLoginBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: z.object({
        accessToken: z.string(),
        refreshToken: z.string(),
        expiresIn: z.number(),
        customer: customerBasicSchema,
      }),
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** POST /api/v1/auth/refresh */
export const refreshRouteSchema = {
  description: "Refresh access token",
  tags: ["Auth"],
  body: refreshTokenBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: z.object({
        accessToken: z.string(),
        refreshToken: z.string(),
        expiresIn: z.number(),
      }),
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** POST /api/v1/auth/logout */
export const logoutRouteSchema = {
  description: "Logout current user and invalidate refresh tokens",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      success: z.literal(true),
      data: z.null(),
      message: z.string(),
    }),
    401: errorResponseSchema,
  },
} as const

/** GET /api/v1/auth/me */
export const meRouteSchema = {
  description: "Get current user profile",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      success: z.literal(true),
      data: customerProfileSchema,
      message: z.string(),
    }),
    401: errorResponseSchema,
    404: errorResponseSchema,
  },
} as const

/** PATCH /api/v1/auth/me */
export const updateMeRouteSchema = {
  description: "Update current user profile (phone only)",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  body: updateMeBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: customerProfileSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    404: errorResponseSchema,
  },
} as const

// ─────────────────────────────────────────────────────────────
// Staff Auth Schemas
// ─────────────────────────────────────────────────────────────

export const staffLoginBodySchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const staffRefreshBodySchema = z.object({
  sessionToken: z.string().min(1, "Session token is required"),
})

export const staffLogoutBodySchema = z.object({
  sessionToken: z.string().optional(),
})

/** POST /api/v1/auth/staff/login */
export const staffLoginRouteSchema = {
  description: "Staff login with email and password",
  tags: ["Auth"],
  body: staffLoginBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: z.object({
        accessToken: z.string(),
        sessionToken: z.string(),
        expiresIn: z.number(),
        staff: z.object({
          id: z.string(),
          email: z.string(),
          displayName: z.string(),
          role: z.string(),
        }),
      }),
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** POST /api/v1/auth/staff/refresh */
export const staffRefreshRouteSchema = {
  description: "Refresh staff access token",
  tags: ["Auth"],
  body: staffRefreshBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: z.object({
        accessToken: z.string(),
        sessionToken: z.string(),
        expiresIn: z.number(),
      }),
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** POST /api/v1/auth/staff/logout */
export const staffLogoutRouteSchema = {
  description: "Logout staff and invalidate session tokens",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  body: staffLogoutBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: z.null(),
      message: z.string(),
    }),
    401: errorResponseSchema,
  },
} as const

/** GET /api/v1/auth/staff/me */
export const staffMeRouteSchema = {
  description: "Get current staff profile",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      success: z.literal(true),
      data: z.object({
        id: z.string(),
        email: z.string(),
        displayName: z.string(),
        phoneNumber: z.string().nullable(),
        avatarUrl: z.string().nullable(),
        role: z.string(),
        lastLoginAt: z.string().nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
      }),
      message: z.string(),
    }),
    401: errorResponseSchema,
    404: errorResponseSchema,
  },
} as const
