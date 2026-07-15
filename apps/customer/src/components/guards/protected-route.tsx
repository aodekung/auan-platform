import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"

import { useAuth } from "../../providers/auth-provider"

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Redirects unauthenticated users to /login.
 * Wrap pages that require authentication (checkout, orders, profile, etc.)
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
