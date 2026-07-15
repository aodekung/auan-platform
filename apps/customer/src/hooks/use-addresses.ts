import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "../lib/api-client"
import type { AddressResponse } from "../api"

export function useAddresses() {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: () => apiClient.get<AddressResponse[]>("/addresses"),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: { building: "A" | "B" | "C" | "D"; roomNumber: string; note?: string; isDefault?: boolean }) =>
      apiClient.post<AddressResponse>("/addresses", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["addresses"] })
    },
  })
}

export function useUpdateAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { building?: string; roomNumber?: string; note?: string } }) =>
      apiClient.patch<AddressResponse>(`/addresses/${id}`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["addresses"] })
    },
  })
}

export function useDeleteAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.delete<AddressResponse>(`/addresses/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["addresses"] })
    },
  })
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.patch<AddressResponse>(`/addresses/${id}/default`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["addresses"] })
    },
  })
}
