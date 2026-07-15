import { useQuery } from "@tanstack/react-query"

import { apiClient } from "../lib/api-client"
import type { CategoryResponse } from "../api"

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => apiClient.get<CategoryResponse[]>("/categories"),
    staleTime: 1000 * 60 * 10, // 10 min — categories rarely change
  })
}
