/**
 * Staff Repository — data access for Staff model.
 *
 * Handles Prisma queries for staff records.
 * No business logic — only find/create/update operations.
 * Supports soft-delete via deletedAt (per 80-database-rules.md).
 */

import type { Prisma, Staff } from "@prisma/client"

import { prisma } from "../client.js"

export interface StaffQueryOptions {
  page?: number
  pageSize?: number
  search?: string
  role?: string
  isActive?: boolean
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export class StaffRepository {
  private readonly delegate = prisma.staff

  /** Find a staff member by email (active only, not soft-deleted). */
  async findByEmail(email: string): Promise<Staff | null> {
    return this.delegate.findFirst({
      where: { email, deletedAt: null },
      include: { staffRole: true },
    })
  }

  /** Find a staff member by internal UUID (active only). */
  async findById(id: string): Promise<Staff | null> {
    return this.delegate.findFirst({
      where: { id, deletedAt: null },
      include: { staffRole: true },
    })
  }

  /** Find a staff member by email including soft-deleted (for duplicate checks). */
  async findByEmailIncludeDeleted(email: string): Promise<Staff | null> {
    return this.delegate.findUnique({ where: { email } })
  }

  /**
   * List staff with pagination, search, filter, and sort.
   * Search matches displayName or email.
   */
  async findAll(options: StaffQueryOptions): Promise<{ data: Staff[]; total: number }> {
    const page = options.page ?? 1
    const pageSize = options.pageSize ?? 20
    const skip = (page - 1) * pageSize

    const where: Prisma.StaffWhereInput = { deletedAt: null }

    if (options.search) {
      where.OR = [
        { displayName: { contains: options.search, mode: "insensitive" } },
        { email: { contains: options.search, mode: "insensitive" } },
      ]
    }

    if (options.role) {
      where.role = options.role
    }

    if (options.isActive !== undefined) {
      where.isActive = options.isActive
    }

    const sortBy = options.sortBy ?? "createdAt"
    const sortOrder = options.sortOrder ?? "desc"

    const [data, total] = await prisma.$transaction([
      this.delegate.findMany({
        where,
        include: { staffRole: true },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: pageSize,
      }),
      this.delegate.count({ where }),
    ])

    return { data, total }
  }

  /** Create a new staff record. */
  async create(data: Prisma.StaffCreateInput): Promise<Staff> {
    return this.delegate.create({
      data,
      include: { staffRole: true },
    })
  }

  /** Update staff profile fields. */
  async update(id: string, data: Prisma.StaffUpdateInput): Promise<Staff> {
    return this.delegate.update({
      where: { id },
      data,
      include: { staffRole: true },
    })
  }

  /** Soft-delete a staff member by setting deletedAt. */
  async softDelete(id: string): Promise<Staff> {
    return this.delegate.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    })
  }

  /** Reactivate a soft-deleted staff member. */
  async reactivate(id: string): Promise<Staff> {
    return this.delegate.update({
      where: { id },
      data: { deletedAt: null, isActive: true },
    })
  }

  /** Count staff grouped by role. */
  async countByRole(): Promise<Array<{ role: string; _count: number }>> {
    const result = await this.delegate.groupBy({
      by: ["role"],
      where: { deletedAt: null },
      _count: true,
    })
    return result.map((r) => ({ role: r.role, _count: r._count }))
  }

  /** Count all active staff. */
  async countActive(): Promise<number> {
    return this.delegate.count({
      where: { deletedAt: null, isActive: true },
    })
  }

  /** Update lastLoginAt timestamp. */
  async updateLastLogin(id: string): Promise<void> {
    await this.delegate.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    })
  }
}
