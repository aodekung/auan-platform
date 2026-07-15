import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { StoreSettingsResponse, BusinessHoursResponse } from "@/api"

// ─────────────────────────────────────────────
// Types for settings API
// ─────────────────────────────────────────────

export interface SettingItem {
  key: string
  value: string
  category: string
  description: string | null
}

interface SettingsBatchBody {
  settings: Array<{ key: string; value: string }>
}

// ─────────────────────────────────────────────
// Store Settings
// ─────────────────────────────────────────────

export function useStoreSettings() {
  return useQuery({
    queryKey: ["admin", "settings", "store-info"],
    queryFn: () => apiClient.get<StoreSettingsResponse>("/settings/store"),
    staleTime: 1000 * 60 * 5,
  })
}

// ─────────────────────────────────────────────
// Business Hours
// ─────────────────────────────────────────────

export function useBusinessHours() {
  return useQuery({
    queryKey: ["admin", "settings", "business-hours"],
    queryFn: () => apiClient.get<BusinessHoursResponse>("/settings/business-hours"),
    staleTime: 1000 * 60 * 5,
  })
}

// ─────────────────────────────────────────────
// Settings by Category (generic)
// ─────────────────────────────────────────────

export function useSettingsByCategory(category: string) {
  return useQuery({
    queryKey: ["admin", "settings", "category", category],
    queryFn: () =>
      apiClient.get<SettingItem[]>(`/admin/settings?category=${category}`),
    staleTime: 1000 * 60 * 5,
  })
}

// ─────────────────────────────────────────────
// Update Settings (single)
// ─────────────────────────────────────────────

export function useUpdateSetting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      return apiClient.patch<SettingItem>(`/admin/settings/${key}`, { value })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] })
    },
  })
}

// ─────────────────────────────────────────────
// Update Settings (batch)
// ─────────────────────────────────────────────

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: SettingsBatchBody) => {
      return apiClient.patch<SettingItem[]>("/admin/settings/batch", body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] })
    },
  })
}
