import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { OrderResponse, OrderListItemResponse, PaginatedResponse } from "@/api"
import type { OrderStatus } from "@auan/types"

// ─────────────────────────────────────────────
// Order List (admin view)
// ─────────────────────────────────────────────

interface OrderFilters {
  page?: number
  pageSize?: number
  status?: string
  search?: string
}

export function useOrders(filters: OrderFilters = {}) {
  const params = new URLSearchParams()
  if (filters.page) params.set("page", String(filters.page))
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize))
  if (filters.status) params.set("status", filters.status)
  if (filters.search) params.set("search", filters.search)

  const query = params.toString()
  const endpoint = `/admin/orders${query ? `?${query}` : ""}`

  return useQuery({
    queryKey: ["admin", "orders", filters],
    queryFn: () => apiClient.get<PaginatedResponse<OrderListItemResponse>>(endpoint),
    staleTime: 1000 * 60 * 2,
  })
}

// ─────────────────────────────────────────────
// Order Detail
// ─────────────────────────────────────────────

export function useOrderDetail(orderId: string) {
  return useQuery({
    queryKey: ["admin", "orders", orderId],
    queryFn: () => apiClient.get<OrderResponse>(`/admin/orders/${orderId}`),
    enabled: !!orderId,
  })
}

// ─────────────────────────────────────────────
// Update Order Status
// ─────────────────────────────────────────────

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ orderId, status, reason }: { orderId: string; status: OrderStatus; reason?: string }) => {
      return apiClient.patch<OrderResponse>(`/admin/orders/${orderId}/status`, { status, reason })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] })
    },
  })
}

// ─────────────────────────────────────────────
// Cancel Order
// ─────────────────────────────────────────────

export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason?: string }) => {
      return apiClient.patch<OrderResponse>(`/admin/orders/${orderId}/cancel`, { reason })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] })
    },
  })
}
