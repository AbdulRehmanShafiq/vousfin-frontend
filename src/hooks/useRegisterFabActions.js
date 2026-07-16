import { useEffect } from 'react'
import { useFabActions } from '@/stores/useFabActions'

/**
 * useRegisterFabActions — a page publishes the actions the mobile ⊕ should
 * offer while that page is on screen.
 *
 * Pass a fresh array each render; `run` callbacks may close over current page
 * state, so the store is refreshed every render to keep them from going stale,
 * and cleared on unmount so the ⊕ reverts to its defaults. The ⊕ lives in
 * MobileNav, a sibling of the page — republishing re-renders that one tiny
 * button, never the page, so there is no loop. (One store write per page
 * render is deliberate and cheap; it buys always-fresh callbacks without a
 * dependency array every caller would have to get right.)
 *
 * Each action: `{ id, label|labelKey, icon, run }`. The ⊕ is mobile-only, so
 * desktop simply ignores whatever is registered — pages may register
 * unconditionally.
 *
 * @param {Array<{id:string,label?:string,labelKey?:string,icon?:Function,run:Function}>} actions
 */
export function useRegisterFabActions(actions) {
  const setActions = useFabActions((s) => s.setActions)
  const clearActions = useFabActions((s) => s.clearActions)

  // Refresh every render → callbacks are never stale.
  useEffect(() => {
    setActions(actions)
  })

  // Clear only on unmount → the ⊕ falls back to its route map / Capture.
  useEffect(() => () => clearActions(), [clearActions])
}
