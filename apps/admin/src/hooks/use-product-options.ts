import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { OptionGroupResponse, ProductOptionResponse } from "@/api"

// ─────────────────────────────────────────────
// Option Groups (admin)
// ─────────────────────────────────────────────

export function useProductOptions(productId: string) {
  return useQuery({
    queryKey: ["admin", "products", productId, "options"],
    queryFn: () =>
      apiClient.get<OptionGroupResponse[]>(
        `/admin/products/${productId}/options`,
      ),
    enabled: !!productId,
    staleTime: 1000 * 60 * 2,
  })
}

// ─────────────────────────────────────────────
// Create / Update / Delete Option Group
// ─────────────────────────────────────────────

interface CreateOptionGroupPayload {
  productId: string
  name: string
  required?: boolean
  multiple?: boolean
  displayOrder?: number
}

export function useCreateOptionGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, ...body }: CreateOptionGroupPayload) =>
      apiClient.post<OptionGroupResponse>(
        `/admin/products/${productId}/options`,
        body,
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", variables.productId, "options"],
      })
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] })
    },
  })
}

interface UpdateOptionGroupPayload {
  id: string
  productId: string
  name?: string
  required?: boolean
  multiple?: boolean
  displayOrder?: number
}

export function useUpdateOptionGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, productId, ...body }: UpdateOptionGroupPayload) =>
      apiClient.patch<OptionGroupResponse>(
        `/admin/product-options/${id}`,
        body,
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", variables.productId, "options"],
      })
    },
  })
}

export function useDeleteOptionGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, productId }: { id: string; productId: string }) =>
      apiClient.delete(`/admin/product-options/${id}`),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", variables.productId, "options"],
      })
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] })
    },
  })
}

// ─────────────────────────────────────────────
// Create / Update / Delete Option (within a group)
// ─────────────────────────────────────────────

interface CreateOptionPayload {
  groupId: string
  productId: string
  name: string
  additionalPrice?: number
  displayOrder?: number
}

export function useCreateOption() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ groupId, ...body }: CreateOptionPayload) =>
      apiClient.post<ProductOptionResponse>(
        `/admin/product-options/${groupId}/options`,
        body,
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", variables.productId, "options"],
      })
    },
  })
}

interface UpdateOptionPayload {
  groupId: string
  id: string
  productId: string
  name?: string
  additionalPrice?: number
  displayOrder?: number
  isActive?: boolean
}

export function useUpdateOption() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ groupId, id, ...body }: UpdateOptionPayload) =>
      apiClient.patch<ProductOptionResponse>(
        `/admin/product-options/${groupId}/options/${id}`,
        body,
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", variables.productId, "options"],
      })
    },
  })
}

export function useDeleteOption() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      groupId,
      id,
      productId,
    }: {
      groupId: string
      id: string
      productId: string
    }) =>
      apiClient.delete(
        `/admin/product-options/${groupId}/options/${id}`,
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", variables.productId, "options"],
      })
    },
  })
}
