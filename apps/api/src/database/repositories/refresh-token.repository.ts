/**
 * Refresh Token Repository — data access for RefreshToken model.
 *
 * Handles storage and retrieval of hashed refresh tokens.
 * Tokens are stored as SHA-256 hashes; plaintext tokens are never persisted.
 * Per 100-security-rules.md: "Never store secrets in source code."
 */

import type { Prisma, RefreshToken } from "@prisma/client"

import { prisma } from "../client.js"

export class RefreshTokenRepository {
  private readonly delegate = prisma.refreshToken

  /**
   * Save a hashed refresh token for a user.
   *
   * Uses UncheckedCreateInput so we can pass the raw scalar FK (userId)
   * instead of the relation syntax (customer: { connect: { id: ... } }).
   */
  async save(
    data: Prisma.RefreshTokenUncheckedCreateInput,
  ): Promise<RefreshToken> {
    return this.delegate.create({ data })
  }

  /**
   * Find a refresh token record by its hash.
   */
  async findByHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.delegate.findUnique({ where: { tokenHash } })
  }

  /**
   * Delete a single refresh token by its hash.
   * Used during token rotation (refresh flow).
   */
  async deleteByHash(tokenHash: string): Promise<void> {
    await this.delegate.delete({ where: { tokenHash } })
  }

  /**
   * Delete all refresh tokens for a given user.
   * Used during logout (invalidate all sessions).
   */
  async deleteAllForUser(userId: string): Promise<number> {
    const result = await this.delegate.deleteMany({ where: { userId } })
    return result.count
  }

  /**
   * Delete expired refresh tokens.
   * Should be called periodically (e.g., cron job).
   */
  async deleteExpired(): Promise<number> {
    const result = await this.delegate.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
    return result.count
  }
}
