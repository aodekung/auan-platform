import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

// ─────────────────────────────────────────────
// Response types
// ─────────────────────────────────────────────

interface OptionTemplateOption {
  id: string
  name: string
  additionalPrice: string
  displayOrder: number
  isActive: boolean
}

export interface OptionGroupTemplate {
  id: string
  name: string
  required: boolean
  multiple: boolean
  displayOrder: number
  isActive: boolean
  options: OptionTemplateOption[]
}

interface OptionAssignment {
  id: string
  optionGroupId: string
  optionGroupName: string
  required: boolean
  multiple: boolean
  displayOrder: number
}

// ─────────────────────────────────────────────
// Option Groups (global templates)
// ─────────────────────────────────────────────

export function useOptionGroups() {
  return useQuery({
    queryKey: ["admin", "option-groups"],
    queryFn: () =>
      apiClient.get<OptionGroupTemplate[]>("/admin/option-groups"),
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateOptionGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: { name: string; required?: boolean; multiple?: boolean }) =>
      apiClient.post<OptionGroupTemplate>("/admin/option-groups", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "option-groups"] })
    },
  })
}

export function useUpdateOptionGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; required?: boolean; multiple?: boolean }) =>
      apiClient.patch<OptionGroupTemplate>(`/admin/option-groups/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "option-groups"] })
    },
  })
}

export function useDeleteOptionGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      apiClient.delete(`/admin/option-groups/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "option-groups"] })
    },
  })
}

// ─────────────────────────────────────────────
// Options (within a group)
// ─────────────────────────────────────────────

export function useCreateOption() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ groupId, ...body }: { groupId: string; name: string; additionalPrice?: string }) =>
      apiClient.post<OptionTemplateOption>(
        `/admin/option-groups/${groupId}/options`,
        body,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "option-groups"] })
    },
  })
}

export function useUpdateOption() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      groupId,
      id,
      ...body
    }: {
      groupId: string
      id: string
      name?: string
      additionalPrice?: string
    }) =>
      apiClient.patch<OptionTemplateOption>(
        `/admin/option-groups/${groupId}/options/${id}`,
        body,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "option-groups"] })
    },
  })
}

export function useDeleteOption() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ groupId, id }: { groupId: string; id: string }) =>
      apiClient.delete(`/admin/option-groups/${groupId}/options/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "option-groups"] })
    },
  })
}

// ─────────────────────────────────────────────
// Product Option Assignments
// ─────────────────────────────────────────────

export function useProductOptionAssignments(productId: string) {
  return useQuery({
    queryKey: ["admin", "products", productId, "option-assignments"],
    queryFn: () =>
      apiClient.get<OptionAssignment[]>(
        `/products/${productId}/option-assignments`,
      ),
    enabled: !!productId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useAssignOptionGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      ...body
    }: {
      productId: string
      optionGroupId: string
    }) =>
      apiClient.post(
        `/products/${productId}/option-assignments`,
        body,
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", variables.productId, "option-assignments"],
      })
    },
  })
}

export function useRemoveOptionAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      groupId,
    }: {
      productId: string
      groupId: string
    }) =>
      apiClient.delete(
        `/products/${productId}/option-assignments/${groupId}`,
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", variables.productId, "option-assignments"],
      })
    },
  })
}
