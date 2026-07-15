import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"

import { useAuth } from "../../providers/auth-provider"

interface PublicRouteProps {
  children: ReactNode
}

/**
 * Redirects already-authenticated users to home.
 * Use for login/register pages to prevent logged-in users from accessing them.
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
