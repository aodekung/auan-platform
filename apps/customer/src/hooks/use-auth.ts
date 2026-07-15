import { useMutation } from "@tanstack/react-query"
import { useCallback } from "react"

import { apiClient } from "../lib/api-client"
import { getLiffIdToken, isLiffLoggedIn, liffLogout } from "../lib/liff"
import type { AuthProfileResponse, LoginResponse } from "../api"
import { useAuth } from "../providers/auth-provider"

// ─────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────

export function useLogin() {
  const { login } = useAuth()

  return useMutation({
    mutationFn: (idToken: string) =>
      apiClient.post<LoginResponse>("/auth/line", { idToken }),
    onSuccess: (data) => {
      login(data.accessToken, data.refreshToken, {
        userId: data.customer.id,
        displayName: data.customer.displayName,
        pictureUrl: data.customer.pictureUrl,
      })
    },
  })
}

// ─────────────────────────────────────────────────────────────
// Silent Login (auto-login when LIFF is logged in)
// ─────────────────────────────────────────────────────────────

export function useSilentLogin() {
  const { login, isAuthenticated } = useAuth()

  const silentLogin = useCallback(async (): Promise<boolean> => {
    // Already authenticated — skip
    if (isAuthenticated) return true

    // Not in LIFF or not logged in to LINE — cannot silent login
    if (!isLiffLoggedIn()) return false

    const idToken = getLiffIdToken()
    if (!idToken) return false

    try {
      const response = await apiClient.post<LoginResponse>("/auth/line", { idToken })
      login(response.accessToken, response.refreshToken, {
        userId: response.customer.id,
        displayName: response.customer.displayName,
        pictureUrl: response.customer.pictureUrl,
      })
      return true
    } catch {
      return false
    }
  }, [isAuthenticated, login])

  return { silentLogin }
}

// ─────────────────────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────────────────────

export function useLogout() {
  const { logout } = useAuth()

  return useMutation({
    mutationFn: () => apiClient.post<null>("/auth/logout"),
    onSettled: () => {
      liffLogout()
      logout()
    },
  })
}

// ─────────────────────────────────────────────────────────────
// Profile
// ─────────────────────────────────────────────────────────────

export function useAuthProfile() {
  return useMutation({
    mutationFn: () => apiClient.get<AuthProfileResponse>("/auth/me"),
  })
}
