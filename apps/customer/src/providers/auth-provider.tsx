import { createContext, useContext, useState, type ReactNode } from "react"

interface AuthState {
  isAuthenticated: boolean
  userId: string | null
  displayName: string | null
  pictureUrl: string | null
  phone: string | null
  refreshToken: string | null
}

interface AuthContextType extends AuthState {
  login: (token: string, refreshToken: string, user: Omit<AuthState, "isAuthenticated" | "refreshToken">) => void
  logout: () => void
  setTokens: (accessToken: string, refreshToken: string) => void
  updateProfile: (profile: { phone?: string | null; displayName?: string | null; pictureUrl?: string | null }) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const token = localStorage.getItem("access_token")
    const refreshToken = localStorage.getItem("refresh_token")
    const userId = localStorage.getItem("user_id")
    const displayName = localStorage.getItem("display_name")
    const pictureUrl = localStorage.getItem("picture_url")
    const phone = localStorage.getItem("phone")
    return {
      isAuthenticated: !!token,
      userId,
      displayName,
      pictureUrl,
      phone,
      refreshToken,
    }
  })

  const login = (
    token: string,
    refreshToken: string,
    user: Omit<AuthState, "isAuthenticated" | "refreshToken">,
  ) => {
    localStorage.setItem("access_token", token)
    localStorage.setItem("refresh_token", refreshToken)
    localStorage.setItem("user_id", user.userId ?? "")
    localStorage.setItem("display_name", user.displayName ?? "")
    localStorage.setItem("picture_url", user.pictureUrl ?? "")
    localStorage.setItem("phone", user.phone ?? "")
    setAuthState({ ...user, isAuthenticated: true, refreshToken })
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user_id")
    localStorage.removeItem("display_name")
    localStorage.removeItem("picture_url")
    localStorage.removeItem("phone")
    setAuthState({
      isAuthenticated: false,
      userId: null,
      displayName: null,
      pictureUrl: null,
      phone: null,
      refreshToken: null,
    })
  }

  /** Update tokens without changing user state (used by 401 refresh flow). */
  const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem("access_token", accessToken)
    localStorage.setItem("refresh_token", refreshToken)
    setAuthState((prev) => ({ ...prev, refreshToken }))
  }

  /** Update profile fields (e.g., phone from PATCH /auth/me). */
  const updateProfile = (profile: { phone?: string | null; displayName?: string | null; pictureUrl?: string | null }) => {
    if (profile.phone !== undefined) {
      localStorage.setItem("phone", profile.phone ?? "")
    }
    if (profile.displayName !== undefined) {
      localStorage.setItem("display_name", profile.displayName ?? "")
    }
    if (profile.pictureUrl !== undefined) {
      localStorage.setItem("picture_url", profile.pictureUrl ?? "")
    }
    setAuthState((prev) => ({
      ...prev,
      ...(profile.phone !== undefined && { phone: profile.phone }),
      ...(profile.displayName !== undefined && { displayName: profile.displayName }),
      ...(profile.pictureUrl !== undefined && { pictureUrl: profile.pictureUrl }),
    }))
  }

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, setTokens, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
