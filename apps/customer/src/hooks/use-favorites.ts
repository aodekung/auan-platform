import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "../lib/api-client"
import type { FavoriteCheckResponse, FavoriteResponse } from "../api"
import { useAuth } from "../providers/auth-provider"

export function useFavorites() {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ["favorites"],
    queryFn: () => apiClient.get<FavoriteResponse[]>("/customers/me/favorites"),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  })
}

export function useIsFavorited(productId: string) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ["favorites", "check", productId],
    queryFn: () =>
      apiClient.get<FavoriteCheckResponse>(
        `/customers/me/favorites/check/${productId}`,
      ),
    enabled: isAuthenticated && !!productId,
    staleTime: 1000 * 60 * 2,
    select: (data) => data.isFavorited,
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      productId,
      isFavorited,
    }: {
      productId: string
      isFavorited: boolean
    }) => {
      if (isFavorited) {
        await apiClient.delete(`/customers/me/favorites/${productId}`)
        return { isFavorited: false }
      } else {
        await apiClient.post(`/customers/me/favorites/${productId}`)
        return { isFavorited: true }
      }
    },
    onMutate: async ({ productId, isFavorited }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["favorites"] })
      await queryClient.cancelQueries({
        queryKey: ["favorites", "check", productId],
      })

      // Snapshot previous values
      const previousFavorites = queryClient.getQueryData<FavoriteResponse[]>([
        "favorites",
      ])
      const previousCheck = queryClient.getQueryData<FavoriteCheckResponse>([
        "favorites",
        "check",
        productId,
      ])

      // Optimistic update for the list
      if (previousFavorites) {
        if (isFavorited) {
          queryClient.setQueryData(
            ["favorites"],
            previousFavorites.filter((f) => f.productId !== productId),
          )
        } else {
          queryClient.setQueryData(["favorites"], [
            ...previousFavorites,
            {
              id: "optimistic",
              productId,
              createdAt: new Date().toISOString(),
            },
          ])
        }
      }

      // Optimistic update for check
      queryClient.setQueryData(
        ["favorites", "check", productId],
        { isFavorited: !isFavorited },
      )

      return { previousFavorites, previousCheck }
    },
    onError: (_err, { productId }, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(["favorites"], context.previousFavorites)
      }
      if (context?.previousCheck !== undefined) {
        queryClient.setQueryData(
          ["favorites", "check", productId],
          context.previousCheck,
        )
      }
    },
    onSettled: () => {
      // Always refetch after mutation settles
      void queryClient.invalidateQueries({ queryKey: ["favorites"] })
    },
  })
}

export function useAddFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) =>
      apiClient.post<FavoriteResponse>(
        `/customers/me/favorites/${productId}`,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["favorites"] })
    },
  })
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) =>
      apiClient.delete(`/customers/me/favorites/${productId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["favorites"] })
    },
  })
}
