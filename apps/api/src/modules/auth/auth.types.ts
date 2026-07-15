/**
 * Auth module type definitions and DTOs.
 *
 * These types define the shape of data flowing between
 * controller ↔ service ↔ external LINE API.
 *
 * Also includes declaration merge for @fastify/jwt so that
 * request.user and app.jwt.sign() are strongly typed.
 */

// ─────────────────────────────────────────────────────────────
// LINE API
// ─────────────────────────────────────────────────────────────

/** Response from LINE ID Token Verification API. */
export interface LineIdTokenPayload {
  /** LINE User ID (unique identifier). */
  sub: string
  /** Display name. */
  name: string
  /** Profile picture URL. */
  picture?: string
  /** Email (if scope includes email). */
  email?: string
}

// ─────────────────────────────────────────────────────────────
// JWT PAYLOAD
// ─────────────────────────────────────────────────────────────

/** JWT payload embedded in access token (per 175-auth). */
export interface JwtPayload {
  userId: string
  lineUserId: string
  role: "CUSTOMER" | "OWNER"
}

// ─────────────────────────────────────────────────────────────
// DTO — Request
// ─────────────────────────────────────────────────────────────

export interface LineLoginRequest {
  /** LINE ID Token received from LINE Login. */
  idToken: string
}

export interface RefreshTokenRequest {
  /** Opaque refresh token string. */
  refreshToken: string
}

// ─────────────────────────────────────────────────────────────
// DTO — Response
// ─────────────────────────────────────────────────────────────

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  customer: {
    id: string
    lineUserId: string
    displayName: string
    pictureUrl: string
  }
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface MeResponse {
  id: string
  lineUserId: string
  displayName: string
  pictureUrl: string
  phone: string | null
  role: "CUSTOMER" | "OWNER"
  createdAt: string
  updatedAt: string
}

// ─────────────────────────────────────────────────────────────
// STAFF AUTH DTOs
// ─────────────────────────────────────────────────────────────

/** JWT payload for staff access tokens (separate from LINE customer JWT). */
export interface StaffJwtPayload {
  staffId: string
  email: string
  role: string
}

export interface StaffLoginRequest {
  email: string
  password: string
}

export interface StaffLoginResponse {
  accessToken: string
  sessionToken: string
  expiresIn: number
  staff: {
    id: string
    email: string
    displayName: string
    role: string
  }
}

export interface StaffMeResponse {
  id: string
  email: string
  displayName: string
  phoneNumber: string | null
  avatarUrl: string | null
  role: string
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface StaffRefreshRequest {
  sessionToken: string
}

export interface StaffRefreshResponse {
  accessToken: string
  sessionToken: string
  expiresIn: number
}

// ─────────────────────────────────────────────────────────────
// @fastify/jwt declaration merge
// ─────────────────────────────────────────────────────────────

/**
 * Declaration merge for @fastify/jwt.
 * After this, request.user is typed as JwtPayload.
 */
declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtPayload
    user: JwtPayload
  }
}
