import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { AuditLogResponse } from "@/api"

// ─────────────────────────────────────────────
// Audit Log List (admin view)
// ─────────────────────────────────────────────

interface AuditLogFilters {
  page?: number
  pageSize?: number
  action?: string
  entityType?: string
  actorId?: string
  startDate?: string
  endDate?: string
}

export function useAuditLogs(filters: AuditLogFilters = {}) {
  const params = new URLSearchParams()
  if (filters.page) params.set("page", String(filters.page))
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize))
  if (filters.action) params.set("action", filters.action)
  if (filters.entityType) params.set("entityType", filters.entityType)
  if (filters.actorId) params.set("actorId", filters.actorId)
  if (filters.startDate) params.set("startDate", filters.startDate)
  if (filters.endDate) params.set("endDate", filters.endDate)

  const query = params.toString()
  const endpoint = `/admin/audit-logs${query ? `?${query}` : ""}`

  return useQuery({
    queryKey: ["admin", "audit-logs", filters],
    queryFn: () => apiClient.get<AuditLogResponse[]>(endpoint),
    staleTime: 1000 * 60 * 2,
  })
}
