import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useAuthHydrated } from '@/hooks/useAuthHydrated'
import SkeletonLoader from '@/components/ui/SkeletonLoader'

/**
 * After persisted auth rehydrates, refresh user profile from API
 * so businessId stays in sync with the database.
 */
export default function SessionBootstrap({ children }) {
  const hydrated = useAuthHydrated()
  const token = useAuthStore((s) => s.token)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const refreshSession = useAuthStore((s) => s.refreshSession)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    if (!hydrated) return

    let cancelled = false
    const boot = async () => {
      if (token && isAuthenticated) {
        try {
          await refreshSession()
        } catch {
          /* refreshSession clears invalid sessions */
        }
      }
      if (!cancelled) setSessionReady(true)
    }

    boot()

    const handleUnauthorized = () => {
      useAuthStore.getState().logout()
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login'
      }
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)

    return () => {
      cancelled = true
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [hydrated, token, isAuthenticated, refreshSession])

  if (!hydrated || !sessionReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-navy">
        <div className="w-64 max-w-sm space-y-4">
          <SkeletonLoader count={3} />
        </div>
      </div>
    )
  }

  return children
}
