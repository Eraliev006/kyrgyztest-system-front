import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/app/providers/query-client/query-client'
import { ThemeProvider } from '@/app/providers/theme/theme-provider'
import { AuthProvider } from '@/app/providers/auth'
import { AppRouterProvider } from '@/app/providers/router'
import { Toaster } from '@/shared/ui/sonner'

export function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppRouterProvider />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
