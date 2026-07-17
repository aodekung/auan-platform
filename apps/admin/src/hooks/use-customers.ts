import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { CustomerDetailResponse } from "@/api"

// ─────────────────────────────────────────────
// Customer List (admin view)
// ─────────────────────────────────────────────

interface CustomerFilters {
  page?: number
  pageSize?: number
  search?: string
}

export function useCustomers(filters: CustomerFilters = {}) {
  const params = new URLSearchParams()
  if (filters.page) params.set("page", String(filters.page))
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize))
  if (filters.search) params.set("search", filters.search)

  const query = params.toString()
  const endpoint = `/admin/customers${query ? `?${query}` : ""}`

  return useQuery({
    queryKey: ["admin", "customers", filters],
    queryFn: () => apiClient.get<CustomerDetailResponse[]>(endpoint),
    staleTime: 1000 * 60 * 2,
  })
}

// ─────────────────────────────────────────────
// Customer Detail
// ─────────────────────────────────────────────

export function useCustomerDetail(customerId: string) {
  return useQuery({
    queryKey: ["admin", "customers", customerId],
    queryFn: () => apiClient.get<CustomerDetailResponse>(`/admin/customers/${customerId}`),
    enabled: !!customerId,
  })
}
