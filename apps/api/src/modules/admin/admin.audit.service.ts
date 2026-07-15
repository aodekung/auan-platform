/**
 * Admin Audit Log Service.
 *
 * Provides paginated audit log queries for the admin dashboard.
 * Uses AuditLogRepository with filtering support.
 *
 * Per 100-security-rules.md: "Critical operations must be auditable."
 */

import { AuditLogRepository } from "../../database/repositories/audit-log.repository.js"
import type { AuditLogQueryOptions } from "../../database/repositories/audit-log.repository.js"

import type { AuditLogListQuery } from "./admin.types.js"

const auditLogRepo = new AuditLogRepository()

/**
 * List audit logs with pagination, filtering, and sorting.
 */
export async function listAuditLogs(query: AuditLogListQuery) {
  const options: AuditLogQueryOptions = {
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 20,
    action: query.action,
    entityType: query.entityType,
    entityId: query.entityId,
    actorId: query.actorId,
    startDate: query.startDate ? new Date(query.startDate) : undefined,
    endDate: query.endDate ? new Date(query.endDate) : undefined,
    sortBy: query.sortBy ?? "createdAt",
    sortOrder: (query.sortOrder ?? "desc") as "asc" | "desc",
  }

  return auditLogRepo.findAll(options)
}

/**
 * Get system activity logs.
 * Alias for audit logs filtered to system-level actions.
 */
export async function getSystemActivity(query: AuditLogListQuery) {
  const options: AuditLogQueryOptions = {
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 20,
    action: query.action,
    entityType: query.entityType,
    entityId: query.entityId,
    actorId: query.actorId,
    startDate: query.startDate ? new Date(query.startDate) : undefined,
    endDate: query.endDate ? new Date(query.endDate) : undefined,
    sortBy: query.sortBy ?? "createdAt",
    sortOrder: (query.sortOrder ?? "desc") as "asc" | "desc",
  }

  return auditLogRepo.findAll(options)
}
