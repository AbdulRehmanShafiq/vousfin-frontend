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
                primary: '#3DDC97',
                secondary: '#06231A',
              },
            },
            error: {
              iconTheme: {
                primary: '#F2705B',
                secondary: '#0A100D',
              },
            },
          }} 
        />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
