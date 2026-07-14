import { useCallback, useState } from 'react'

/**
 * useListViewState — saved-views-lite (Ledger spec §7.2, wave 2).
 *
 * Persists a work view's filter state (search text, status filter, sort…)
 * per list, per browser, so returning to a list restores how you left it.
 *
 *   const [view, setView] = useListViewState('invoices', { query: '', state: '' })
 *   setView({ query: 'INV-20' })          // merges + persists
 *
 * localStorage first; a server-side saved-views engine can replace the
 * storage layer later without touching call sites.
 */
export function useListViewState(listKey, defaults) {
  const storageKey = `vf-view-${listKey}`
  const [view, setViewState] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? { ...defaults, ...JSON.parse(raw) } : defaults
    } catch {
      return defaults
    }
  })

  const setView = useCallback((patch) => {
    setViewState((prev) => {
      const next = { ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [storageKey])

  return [view, setView]
}
