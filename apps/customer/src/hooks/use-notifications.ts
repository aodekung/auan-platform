import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "../lib/api-client"
import type { NotificationResponse, PaginatedResponse } from "../api"

export function useNotifications(filters?: {
  status?: string
  type?: string
  unreadOnly?: boolean
  page?: number
  pageSize?: number
}) {
  const params = new URLSearchParams()
  if (filters?.status) params.set("status", filters.status)
  if (filters?.type) params.set("type", filters.type)
  if (filters?.unreadOnly) params.set("unreadOnly", "true")
  if (filters?.page) params.set("page", String(filters.page))
  if (filters?.pageSize) params.set("pageSize", String(filters.pageSize))

  const qs = params.toString()
  const endpoint = `/notifications${qs ? `?${qs}` : ""}`

  return useQuery({
    queryKey: ["notifications", filters],
    queryFn: () => apiClient.get<PaginatedResponse<NotificationResponse>>(endpoint),
    staleTime: 1000 * 60 * 2,
  })
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => apiClient.get<{ count: number }>("/notifications/unread-count"),
    staleTime: 1000 * 30, // Check frequently
    refetchInterval: 30_000, // Poll every 30s
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.patch<NotificationResponse>(`/notifications/${id}/read`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] })
      void queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.patch<{ count: number }>("/notifications/read-all"),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] })
      void queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] })
    },
  })
}
