import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "../lib/api-client"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api/v1"

import type { PaymentResponse } from "../api"

export function usePayment(orderId: string) {
  return useQuery({
    queryKey: ["payment", orderId],
    queryFn: () => apiClient.get<PaymentResponse>(`/payments/${orderId}`),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 1, // Poll-friendly: 1 min stale
    refetchInterval: (query) => {
      const status = query.state.data?.paymentStatus
      // Auto-poll every 5s while waiting for verification
      if (status === "PENDING" || status === "AWAITING_VERIFICATION") return 5000
      return false
    },
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: { orderId: string }) =>
      apiClient.post<PaymentResponse>("/payments", body),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["payment", variables.orderId] })
      void queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] })
    },
  })
}

export function useUploadSlip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ paymentId, file }: { paymentId: string; file: File }) => {
      const formData = new FormData()
      formData.append("slip", file)

      const token = localStorage.getItem("access_token")
      return fetch(`${API_BASE_URL}/payments/${paymentId}/upload-slip`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }).then(async (res) => {
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error?.message || "Upload failed")
        }
        return res.json() as Promise<{ success: true; data: PaymentResponse; message: string }>
      }).then((res) => res.data)
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["payment"] })
    },
  })
}

export function useConfirmPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (paymentId: string) =>
      apiClient.post<PaymentResponse>(`/payments/${paymentId}/confirm`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["payment"] })
      void queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}
