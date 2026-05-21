import { useEffect } from 'react'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routes } from './routes'
import SessionBootstrap from '@/components/auth/SessionBootstrap'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

function AppRoutes() {
  return useRoutes(routes)
}

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SessionBootstrap>
          <AppRoutes />
        </SessionBootstrap>
        <Toaster 
          position="top-right" 
          toastOptions={{ 
            duration: 4000,
            className: '!bg-charcoal !text-text-primary !border !border-glass !shadow-elevated',
            success: {
              iconTheme: {
                primary: '#06B6D4',
                secondary: '#1E293B',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#1E293B',
              },
            },
          }} 
        />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
