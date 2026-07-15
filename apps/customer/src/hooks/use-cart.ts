import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "../lib/api-client"
import type { CartResponse } from "../api"
import { useAuth } from "../providers/auth-provider"

export function useCart() {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ["cart"],
    queryFn: () => apiClient.get<CartResponse>("/cart"),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  })
}

export function useAddToCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: {
      productId: string
      quantity?: number
      selectedOptions?: Array<{
        optionGroupId: string
        optionId: string
        optionName: string
        additionalPrice: number
      }>
      note?: string
    }) => apiClient.post<CartResponse>("/cart/items", body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
  })
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { quantity?: number; note?: string | null } }) =>
      apiClient.patch<CartResponse>(`/cart/items/${id}`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
  })
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.delete<CartResponse>(`/cart/items/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
  })
}

export function useClearCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.delete<null>("/cart"),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
  })
}
