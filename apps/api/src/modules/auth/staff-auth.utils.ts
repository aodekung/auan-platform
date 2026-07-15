/**
 * Staff authentication utility functions.
 *
 * Provides password hashing (bcrypt) and JWT operations
 * for staff auth flow (separate from LINE customer auth).
 *
 * Uses a separate JWT secret (STAFF_JWT_SECRET) from customer auth
 * to allow independent key rotation and lifecycle management.
 * Uses jsonwebtoken directly (not @fastify/jwt) because Fastify JWT
 * v9 does not support per-call secret overriding.
 *
 * Per 100-security-rules.md: "Never expose secrets or tokens in logs."
 * Per 175-authentication-authorization.md: "Authorization must always
 * occur on the server."
 */

import { createHash, randomBytes } from "node:crypto"

import jwt from "jsonwebtoken"

import { env } from "../../config/env.js"

import type { StaffJwtPayload } from "./auth.types.js"

// ─────────────────────────────────────────────────────────────
// Password Hashing (bcrypt)
// ─────────────────────────────────────────────────────────────

/**
 * Hash a plaintext password using bcrypt.
 * Salt rounds configured via BCRYPT_SALT_ROUNDS env var (default: 12).
 */
export async function hashPassword(plainText: string): Promise<string> {
  const bcrypt = await import("bcrypt")
  return bcrypt.hash(plainText, env.BCRYPT_SALT_ROUNDS)
}

/**
 * Verify a plaintext password against a stored bcrypt hash.
 * Uses timing-safe comparison internally (bcrypt.compare).
 */
export async function verifyPassword(
  plainText: string,
  storedHash: string,
): Promise<boolean> {
  const bcrypt = await import("bcrypt")
  return bcrypt.compare(plainText, storedHash)
}

// ─────────────────────────────────────────────────────────────
// JWT Access Token — Staff
// ─────────────────────────────────────────────────────────────

/**
 * Generate a signed JWT access token for staff.
 * Uses STAFF_JWT_SECRET (separate from customer JWT).
 * Expires in STAFF_JWT_EXPIRY_HOURS (default: 8h).
 */
export function generateStaffAccessToken(
  payload: StaffJwtPayload,
): string {
  return jwt.sign(payload, env.STAFF_JWT_SECRET, {
    expiresIn: `${env.STAFF_JWT_EXPIRY_HOURS}h`,
  })
}

/**
 * Verify and decode a staff JWT access token.
 * Throws on invalid signature, malformed token, or expiration.
 */
export function verifyStaffAccessToken(
  token: string,
): StaffJwtPayload {
  return jwt.verify(token, env.STAFF_JWT_SECRET) as StaffJwtPayload
}

// ─────────────────────────────────────────────────────────────
// Refresh / Session Token — Staff
// ─────────────────────────────────────────────────────────────

/**
 * Hash a plaintext session token using SHA-256.
 * Stored hashes are never plaintext (per 100-security-rules.md).
 */
export async function hashSessionToken(token: string): Promise<string> {
  return createHash("sha256").update(token).digest("hex")
}

/**
 * Generate a cryptographically secure random opaque session token.
 * Returns a 64-byte hex string (128 characters).
 */
export function generateSessionToken(): string {
  return randomBytes(64).toString("hex")
}
