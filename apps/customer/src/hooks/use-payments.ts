import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { PaymentResponse } from "../api"

import { apiClient } from "../lib/api-client"

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
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1] // Remove data URI prefix
          resolve(base64)
        }
        reader.onerror = () => reject(new Error("ไม่สามารถอ่านไฟล์ได้"))
        reader.readAsDataURL(file)
      }).then((base64) => {
        return apiClient.post<PaymentResponse>(`/payments/${paymentId}/upload-slip`, {
          slipBase64: base64,
          fileName: file.name,
        })
      })
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["payment", variables.paymentId] })
    },
  })
}

export function useConfirmPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (paymentId: string) =>
      apiClient.post<PaymentResponse>(`/payments/${paymentId}/confirm`),
    onSuccess: (_data, paymentId) => {
      void queryClient.invalidateQueries({ queryKey: ["payment", paymentId] })
    },
  })
}
