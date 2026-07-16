import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { StaffDetailResponse, StaffRole, ResetPasswordResponse } from "@/api"

// ─────────────────────────────────────────────
// Staff List
// ─────────────────────────────────────────────

export function useStaffList() {
  return useQuery({
    queryKey: ["admin", "staff"],
    queryFn: () => apiClient.get<StaffDetailResponse[]>("/admin/staff"),
    staleTime: 1000 * 60 * 2,
  })
}

// ─────────────────────────────────────────────
// Staff Detail
// ─────────────────────────────────────────────

export function useStaffDetail(id: string) {
  return useQuery({
    queryKey: ["admin", "staff", id],
    queryFn: () => apiClient.get<StaffDetailResponse>(`/admin/staff/${id}`),
    enabled: !!id,
  })
}

// ─────────────────────────────────────────────
// Create Staff
// ─────────────────────────────────────────────

interface CreateStaffBody {
  email: string
  displayName: string
  role: StaffRole
  password: string
  phoneNumber?: string
}

export function useCreateStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: CreateStaffBody) => {
      return apiClient.post<StaffDetailResponse>("/admin/staff", body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "staff"] })
    },
  })
}

// ─────────────────────────────────────────────
// Update Staff
// ─────────────────────────────────────────────

interface UpdateStaffBody {
  id: string
  displayName?: string
  role?: StaffRole
  isActive?: boolean
  phoneNumber?: string
}

export function useUpdateStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...body }: UpdateStaffBody) => {
      return apiClient.put<StaffDetailResponse>(`/admin/staff/${id}`, body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "staff"] })
    },
  })
}

// ─────────────────────────────────────────────
// Delete Staff (soft delete)
// ─────────────────────────────────────────────

export function useToggleStaffStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiClient.patch<StaffDetailResponse>(`/admin/staff/${id}/status`, { isActive })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "staff"] })
    },
  })
}

/** @deprecated Use useToggleStaffStatus instead — backend has no DELETE route */
export function useDeleteStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiClient.patch<StaffDetailResponse>(`/admin/staff/${id}/status`, { isActive })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "staff"] })
    },
  })
}

// ─────────────────────────────────────────────
// Reset Password
// ─────────────────────────────────────────────

export function useResetPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.post<ResetPasswordResponse>(`/admin/staff/${id}/reset-password`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "staff"] })
    },
  })
}
