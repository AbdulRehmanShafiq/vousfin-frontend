import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'

/** Wait for zustand persist to rehydrate before auth redirects. */
export function useAuthHydrated() {
  const [hydrated, setHydrated] = useState(
    () => useAuthStore.persist?.hasHydrated?.() ?? false
  )

  useEffect(() => {
    const unsub = useAuthStore.persist?.onFinishHydration?.(() => setHydrated(true))
    setHydrated(useAuthStore.persist?.hasHydrated?.() ?? true)
    return () => unsub?.()
  }, [])

  return hydrated
}
