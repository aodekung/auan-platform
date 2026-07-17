import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/providers/auth-provider"
import type { StaffLoginResponse, StaffMeResponse } from "@/api"

const TOKEN_KEY = "admin_access_token"
const SESSION_KEY = "admin_session_token"

// ─────────────────────────────────────────────
// Staff Login
// ─────────────────────────────────────────────

interface LoginCredentials {
  email: string
  password: string
}

export function useLogin() {
  const { login: setAuth } = useAuth()

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      return apiClient.post<StaffLoginResponse>("/auth/staff/login", credentials)
    },
    onSuccess: (data) => {
      setAuth(data.accessToken, data.sessionToken, data.staff)
    },
  })
}

// ─────────────────────────────────────────────
// Staff Logout
// ─────────────────────────────────────────────

export function useLogout() {
  const { logout: clearAuth } = useAuth()

  return useMutation({
    mutationFn: async () => {
      const sessionToken = localStorage.getItem(SESSION_KEY)
      if (sessionToken) {
        try {
          await apiClient.post("/auth/staff/logout", { sessionToken })
        } catch {
          // Logout API call may fail if token expired — clear local state regardless
        }
      }
    },
    onSettled: () => {
      clearAuth()
      window.location.replace("/admin/login")
    },
  })
}

// ─────────────────────────────────────────────
// Staff Refresh Token
// ─────────────────────────────────────────────

export function useRefreshToken() {
  const { login: setAuth } = useAuth()

  return useMutation({
    mutationFn: async () => {
      const sessionToken = localStorage.getItem(SESSION_KEY)
      if (!sessionToken) throw new Error("No session token")
      return apiClient.post<StaffLoginResponse>("/auth/staff/refresh", { sessionToken })
    },
    onSuccess: (data) => {
      localStorage.setItem(TOKEN_KEY, data.accessToken)
      localStorage.setItem(SESSION_KEY, data.sessionToken)
      setAuth(data.accessToken, data.sessionToken, data.staff)
    },
  })
}

// ─────────────────────────────────────────────
// Staff Me (fetch current profile)
// ─────────────────────────────────────────────

export function useStaffMe() {
  const { updateProfile } = useAuth()

  return useMutation({
    mutationFn: async () => {
      return apiClient.get<StaffMeResponse>("/auth/staff/me")
    },
    onSuccess: (data) => {
      updateProfile(data.displayName, data.role)
    },
  })
}
