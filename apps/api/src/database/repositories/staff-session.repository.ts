/**
 * Staff Session Repository — data access for StaffSession model.
 *
 * Staff sessions track active login sessions.
 * Tokens are stored as SHA-256 hashes (never plaintext).
 * Per 100-security-rules.md: "Never expose secrets or tokens in logs."
 */

import type { StaffSession } from "@prisma/client"

import { prisma } from "../client.js"

export interface CreateStaffSession {
  staffId: string
  tokenHash: string
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
}

export class StaffSessionRepository {
  private readonly delegate = prisma.staffSession

  /** Save a new staff session. */
  async save(data: CreateStaffSession): Promise<StaffSession> {
    return this.delegate.create({ data })
  }

  /** Find a session by token hash. */
  async findByHash(tokenHash: string): Promise<StaffSession | null> {
    return this.delegate.findUnique({ where: { tokenHash } })
  }

  /** Delete a session by token hash (token rotation / logout). */
  async deleteByHash(tokenHash: string): Promise<void> {
    await this.delegate.delete({ where: { tokenHash } })
  }

  /** Delete all sessions for a staff member (full logout). */
  async deleteAllForStaff(staffId: string): Promise<number> {
    const result = await this.delegate.deleteMany({ where: { staffId } })
    return result.count
  }

  /** Delete all expired sessions (cleanup). */
  async deleteExpired(): Promise<number> {
    const result = await this.delegate.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
    return result.count
  }
}
