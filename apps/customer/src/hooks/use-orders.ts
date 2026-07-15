import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "../lib/api-client"
import type { OrderResponse, PaginatedResponse } from "../api"

export function useOrders(filters?: { status?: string; page?: number; pageSize?: number }) {
  const params = new URLSearchParams()
  if (filters?.status) params.set("status", filters.status)
  if (filters?.page) params.set("page", String(filters.page))
  if (filters?.pageSize) params.set("pageSize", String(filters.pageSize))

  const qs = params.toString()
  const endpoint = `/orders${qs ? `?${qs}` : ""}`

  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => apiClient.get<PaginatedResponse<OrderResponse>>(endpoint),
    staleTime: 1000 * 60 * 2,
  })
}

export function useOrderDetail(orderId: string) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => apiClient.get<OrderResponse>(`/orders/${orderId}`),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 1,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: { addressId?: string; note?: string }) =>
      apiClient.post<OrderResponse>("/orders", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cart"] })
      void queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      apiClient.patch<OrderResponse>(`/orders/${orderId}/cancel`, { reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}
