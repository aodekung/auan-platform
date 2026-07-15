import { Navigate } from "react-router-dom"
import { useAuth } from "@/providers/auth-provider"
import type { ReactNode } from "react"

export function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
