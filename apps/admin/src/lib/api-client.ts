import type { ApiResponse, ApiError } from "@auan/types"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api/v1"

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getToken(): string | null {
    return localStorage.getItem("admin_access_token")
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    }

    // Only set Content-Type when there is a body to send.
    // Sending Content-Type with an empty body causes Fastify to reject the request.
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

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid — clear tokens
        localStorage.removeItem("admin_access_token")
        localStorage.removeItem("admin_session_token")
        // Throw a custom error name so TanStack Query retry can detect it
        const err = new Error("Unauthorized")
        err.name = "UnauthorizedError"
        throw err
      }
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

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
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
