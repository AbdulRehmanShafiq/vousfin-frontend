import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'

const IDLE_MS = 15 * 60 * 1000 // 15 minutes

export function useIdleLogout() {
  const logout = useAuthStore((s) => s.logout)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const timer = useRef(null)

  useEffect(() => {
    if (!isAuthenticated) return

    const reset = () => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => logout(), IDLE_MS)
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    reset()

    return () => {
      clearTimeout(timer.current)
      events.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [isAuthenticated, logout])
}
