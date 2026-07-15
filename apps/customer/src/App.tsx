import { QueryClientProvider } from "@tanstack/react-query"

import { AuthProvider } from "./providers/auth-provider"
import { queryClient } from "./providers/query-provider"
import { AppRoutes } from "./routes"
import { LiffGate } from "./hooks/use-liff"

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LiffGate>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LiffGate>
    </QueryClientProvider>
  )
}
