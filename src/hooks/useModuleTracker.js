import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import dashboardService from '@/services/dashboard.service'
import { shortcutForPath } from '@/components/layout/nav.config'

/*
 * useModuleTracker — records which module the user opens as they navigate, so
 * the dashboard can surface their most-used shortcuts. Fire-and-forget: a
 * tracking failure never affects navigation. Debounced per path so a single
 * visit counts once. Command-bar selections navigate too, so this one hook
 * captures both "most used" and "recently opened".
 */
export function useModuleTracker() {
  const { pathname } = useLocation()
  const lastRef = useRef(null)

  useEffect(() => {
    const shortcut = shortcutForPath(pathname)
    if (!shortcut || lastRef.current === shortcut.path) return
    lastRef.current = shortcut.path
    dashboardService.recordModuleUsage(shortcut).catch(() => {})
  }, [pathname])
}
