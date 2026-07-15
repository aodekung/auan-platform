import { useQuery } from "@tanstack/react-query"

import { apiClient } from "../lib/api-client"
import type { OptionGroupResponse, PaginatedResponse, ProductResponse } from "../api"

export function useProducts(filters?: {
  categoryId?: string
  search?: string
  page?: number
  pageSize?: number
}) {
  const params = new URLSearchParams()
  if (filters?.categoryId) params.set("categoryId", filters.categoryId)
  if (filters?.search) params.set("search", filters.search)
  if (filters?.page) params.set("page", String(filters.page))
  if (filters?.pageSize) params.set("pageSize", String(filters.pageSize))

  const qs = params.toString()
  const endpoint = `/products${qs ? `?${qs}` : ""}`

  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => apiClient.get<PaginatedResponse<ProductResponse>>(endpoint),
    staleTime: 1000 * 60 * 5,
  })
}

export function useProductDetail(productId: string) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => apiClient.get<ProductResponse>(`/products/${productId}`),
    enabled: !!productId,
  })
}

export function useProductOptions(productId: string) {
  return useQuery({
    queryKey: ["product-options", productId],
    queryFn: () => apiClient.get<OptionGroupResponse[]>(`/products/${productId}/options`),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  })
}
