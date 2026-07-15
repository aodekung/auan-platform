import { QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "./providers/auth-provider"
import { queryClient } from "./providers/query-provider"
import { AppRoutes } from "./routes/index"

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  )
}
