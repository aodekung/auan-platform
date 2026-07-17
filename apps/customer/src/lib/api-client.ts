import type { ApiResponse, LoginResponse } from "../api"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api/v1"

interface ApiError {
  success: false
  error: {
    code: string
    message: string
  }
}

// ─────────────────────────────────────────────────────────────
// Token helpers
// ─────────────────────────────────────────────────────────────

function getAccessToken(): string | null {
  return localStorage.getItem("access_token")
}

function getRefreshToken(): string | null {
  return localStorage.getItem("refresh_token")
}

function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem("access_token", accessToken)
  localStorage.setItem("refresh_token", refreshToken)
}

function clearTokens(): void {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
  localStorage.removeItem("user_id")
  localStorage.removeItem("display_name")
  localStorage.removeItem("picture_url")
}

// ─────────────────────────────────────────────────────────────
// Refresh logic
// ─────────────────────────────────────────────────────────────

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

/**
 * Attempt to refresh the access token using the stored refresh token.
 * Returns a new access token on success, or null on failure.
 * Concurrent calls coalesce into a single request.
 */
async function refreshAccessToken(): Promise<string | null> {
  // Return existing in-flight refresh
  if (isRefreshing && refreshPromise) return refreshPromise

  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) return null

      const data: ApiResponse<LoginResponse> = await response.json()
      setTokens(data.data.accessToken, data.data.refreshToken)
      return data.data.accessToken
    } catch {
      return null
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

// ─────────────────────────────────────────────────────────────
// 401 handler — redirect to login
// ─────────────────────────────────────────────────────────────

function handleAuthFailure(): void {
  clearTokens()
  // Redirect to login page on next tick so the current request chain completes
  window.location.href = "/login"
}

// ─────────────────────────────────────────────────────────────
// API Client
// ─────────────────────────────────────────────────────────────

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = getAccessToken()
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    }

    // Only set Content-Type for requests with a body (sending Content-Type with an
    // empty body causes Fastify to reject the request)
    if (options.body) {
      headers["Content-Type"] = "application/json"
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    // 401 — attempt refresh then retry once
    if (response.status === 401) {
      const newToken = await refreshAccessToken()
      if (newToken) {
        // Retry original request with new token
        const retryHeaders: Record<string, string> = {
          ...((options.headers as Record<string, string>) || {}),
          Authorization: `Bearer ${newToken}`,
        }

        if (options.body) {
          retryHeaders["Content-Type"] = "application/json"
        }

        const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers: retryHeaders,
        })

        if (!retryResponse.ok) {
          let errorMessage = "An error occurred"
          try {
            const error: ApiError = await retryResponse.json()
            errorMessage = error.error?.message || errorMessage
          } catch {
            // Response body is not JSON — use default message
          }
          throw new Error(errorMessage)
        }

        const data: ApiResponse<T> = await retryResponse.json()
        return data.data
      }

      // Refresh failed — redirect to login
      handleAuthFailure()
      throw new Error("Session expired. Please sign in again.")
    }

    if (!response.ok) {
      let errorMessage = "An error occurred"
      try {
        const error: ApiError = await response.json()
        errorMessage = error.error?.message || errorMessage
      } catch {
        // Response body is not JSON — use default message
      }
      throw new Error(errorMessage)
    }

    const data: ApiResponse<T> = await response.json()
    return data.data
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint)
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
