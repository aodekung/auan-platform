/**
 * Staff Role Repository — data access for StaffRole model.
 *
 * StaffRole acts as an enum-like reference table with metadata.
 * No business logic — only read operations.
 */

import type { StaffRole } from "@prisma/client"

import { prisma } from "../client.js"

export class StaffRoleRepository {
  private readonly delegate = prisma.staffRole

  /** Find a staff role by name. */
  async findByName(name: string): Promise<StaffRole | null> {
    return this.delegate.findUnique({ where: { name } })
  }

  /** Get all staff roles. */
  async findAll(): Promise<StaffRole[]> {
    return this.delegate.findMany({ orderBy: { name: "asc" } })
  }

  /** Get only active staff roles. */
  async findActive(): Promise<StaffRole[]> {
    return this.delegate.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    })
  }
}
