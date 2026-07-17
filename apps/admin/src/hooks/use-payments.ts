import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { PaymentResponse } from "@/api"

// ─────────────────────────────────────────────
// Payment List (admin view)
// ─────────────────────────────────────────────

interface PaymentFilters {
  page?: number
  pageSize?: number
  status?: string
}

export function usePayments(filters: PaymentFilters = {}) {
  const params = new URLSearchParams()
  if (filters.page) params.set("page", String(filters.page))
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize))
  if (filters.status) params.set("status", filters.status)

  const query = params.toString()
  const endpoint = `/admin/payments${query ? `?${query}` : ""}`

  return useQuery({
    queryKey: ["admin", "payments", filters],
    queryFn: () => apiClient.get<PaymentResponse[]>(endpoint),
    staleTime: 1000 * 60 * 2,
  })
}

// ─────────────────────────────────────────────
// Payment Detail
// ─────────────────────────────────────────────

export function usePayment(orderId: string) {
  return useQuery({
    queryKey: ["admin", "payments", orderId],
    queryFn: () => apiClient.get<PaymentResponse>(`/admin/payments/${orderId}`),
    enabled: !!orderId,
  })
}

// ─────────────────────────────────────────────
// Verify Payment
// ─────────────────────────────────────────────

export function useVerifyPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (paymentId: string) => {
      return apiClient.post<PaymentResponse>(`/admin/payments/${paymentId}/verify`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "payments"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] })
    },
  })
}

// ─────────────────────────────────────────────
// Reject Payment
// ─────────────────────────────────────────────

export function useRejectPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ paymentId, reason }: { paymentId: string; reason?: string }) => {
      return apiClient.post<PaymentResponse>(`/admin/payments/${paymentId}/reject`, { reason })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "payments"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] })
    },
  })
}
