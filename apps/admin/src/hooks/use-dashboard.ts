import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { DashboardSummary } from "@/api"

export function useDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => apiClient.get<DashboardSummary>("/admin/dashboard"),
    refetchInterval: 30_000,
    staleTime: 1000 * 60 * 2,
  })
}
