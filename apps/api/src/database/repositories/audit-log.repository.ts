/**
 * Audit Log Repository — data access for AuditLog model.
 *
 * Centralized audit trail for critical business actions.
 * Records are immutable — never updated or deleted.
 *
 * Per 80-database-rules.md: "Critical business actions should remain traceable."
 * Per 170-system-architecture.md: Audit Logs track user actions and data changes.
 * Reusable by any module that needs audit logging.
 */

import { Prisma } from "@prisma/client"

import { prisma } from "../client.js"

export interface AuditLogEntry {
  action: string
  entityType?: string
  entityId?: string
  actorId?: string
  actorName?: string
  details?: unknown
  ipAddress?: string
  userAgent?: string
}

export interface AuditLogQueryOptions {
  page?: number
  pageSize?: number
  action?: string
  entityType?: string
  entityId?: string
  actorId?: string
  startDate?: Date
  endDate?: Date
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export class AuditLogRepository {
  private readonly delegate = prisma.auditLog

  /**
   * Create an audit log entry.
   */
  async log(entry: AuditLogEntry): Promise<void> {
    await this.delegate.create({
      data: {
        action: entry.action,
        entityType: entry.entityType ?? null,
        entityId: entry.entityId ?? null,
        actorId: entry.actorId ?? null,
        actorName: entry.actorName ?? null,
        details: entry.details !== undefined ? entry.details as Prisma.InputJsonValue : Prisma.JsonNull,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
      },
    })
  }

  /**
   * Find audit logs for a specific entity.
   */
  async findByEntity(entityType: string, entityId: string): Promise<unknown[]> {
    return this.delegate.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: "desc" },
    })
  }

  /**
   * Find audit logs by action type.
   */
  async findByAction(action: string): Promise<unknown[]> {
    return this.delegate.findMany({
      where: { action },
      orderBy: { createdAt: "desc" },
    })
  }

  /**
   * Find audit logs with pagination, filtering, and sorting.
   * Used by Admin Audit Log API.
   */
  async findAll(options: AuditLogQueryOptions): Promise<{ data: unknown[]; total: number }> {
    const page = options.page ?? 1
    const pageSize = options.pageSize ?? 20
    const skip = (page - 1) * pageSize

    const where: Prisma.AuditLogWhereInput = {}

    if (options.action) {
      where.action = options.action
    }

    if (options.entityType) {
      where.entityType = options.entityType
    }

    if (options.entityId) {
      where.entityId = options.entityId
    }

    if (options.actorId) {
      where.actorId = options.actorId
    }

    if (options.startDate || options.endDate) {
      where.createdAt = {}
      if (options.startDate) {
        where.createdAt.gte = options.startDate
      }
      if (options.endDate) {
        where.createdAt.lte = options.endDate
      }
    }

    const sortBy = options.sortBy ?? "createdAt"
    const sortOrder = options.sortOrder ?? "desc"

    const [data, total] = await prisma.$transaction([
      this.delegate.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: pageSize,
      }),
      this.delegate.count({ where }),
    ])

    return { data, total }
  }
}
