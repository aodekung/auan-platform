/**
 * Token hashing utilities.
 *
 * Refresh tokens are stored as SHA-256 hashes in the database.
 * Plaintext tokens are never persisted (per 100-security-rules.md).
 *
 * Uses Node.js built-in crypto module — no external dependencies.
 */

import { createHash, randomBytes } from "node:crypto"

/**
 * Generate a SHA-256 hash of a plaintext token.
 * Used to store refresh tokens securely in the database.
 */
export async function hashToken(token: string): Promise<string> {
  return createHash("sha256").update(token).digest("hex")
}

/**
 * Verify that a plaintext token matches a stored hash.
 * Timing-safe comparison is not needed here because we use
 * the full hash lookup (single-row unique index), not iteration.
 */
export async function verifyTokenHash(
  token: string,
  storedHash: string,
): Promise<boolean> {
  const hash = await hashToken(token)
  return hash === storedHash
}

/**
 * Generate a cryptographically secure random opaque token.
 * Used for refresh tokens — these are NOT JWTs.
 *
 * Returns a 64-byte hex string (128 characters).
 */
export function generateOpaqueToken(): string {
  return randomBytes(64).toString("hex")
}
