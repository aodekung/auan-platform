import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { StaffRole } from "@auan/types"

// ─────────────────────────────────────────────
// Auth state
// ─────────────────────────────────────────────

interface AuthState {
  isAuthenticated: boolean
  staffId: string | null
  email: string | null
  displayName: string | null
  role: StaffRole | null
}

interface AuthContextValue extends AuthState {
  login: (accessToken: string, sessionToken: string, staff: { id: string; email: string; displayName: string; role: StaffRole }) => void
  logout: () => void
  updateProfile: (displayName: string, role: StaffRole) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEYS = {
  accessToken: "admin_access_token",
  sessionToken: "admin_session_token",
  staffId: "admin_staff_id",
  email: "admin_email",
  displayName: "admin_display_name",
  role: "admin_staff_role",
} as const

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const token = localStorage.getItem(STORAGE_KEYS.accessToken)
    return {
      isAuthenticated: !!token,
      staffId: localStorage.getItem(STORAGE_KEYS.staffId),
      email: localStorage.getItem(STORAGE_KEYS.email),
      displayName: localStorage.getItem(STORAGE_KEYS.displayName),
      role: (localStorage.getItem(STORAGE_KEYS.role) as StaffRole) || null,
    }
  })

  const login = useCallback(
    (
      accessToken: string,
      sessionToken: string,
      staff: { id: string; email: string; displayName: string; role: StaffRole },
    ) => {
      localStorage.setItem(STORAGE_KEYS.accessToken, accessToken)
      localStorage.setItem(STORAGE_KEYS.sessionToken, sessionToken)
      localStorage.setItem(STORAGE_KEYS.staffId, staff.id)
      localStorage.setItem(STORAGE_KEYS.email, staff.email)
      localStorage.setItem(STORAGE_KEYS.displayName, staff.displayName)
      localStorage.setItem(STORAGE_KEYS.role, staff.role)

      setAuthState({
        isAuthenticated: true,
        staffId: staff.id,
        email: staff.email,
        displayName: staff.displayName,
        role: staff.role,
      })
    },
    [],
  )

  const logout = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
    setAuthState({
      isAuthenticated: false,
      staffId: null,
      email: null,
      displayName: null,
      role: null,
    })
  }, [])

  const updateProfile = useCallback((displayName: string, role: StaffRole) => {
    localStorage.setItem(STORAGE_KEYS.displayName, displayName)
    localStorage.setItem(STORAGE_KEYS.role, role)
    setAuthState((prev) => ({ ...prev, displayName, role }))
  }, [])

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
