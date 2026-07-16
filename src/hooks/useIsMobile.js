import { useState, useEffect } from 'react'

/*
 * One line separates phone-native from desktop, and it is `lg` (1024px) —
 * the SAME line the layout already uses (`MobileNav` is `lg:hidden`,
 * `RailPanel` is `hidden lg:flex`). It was 767px, which opened a dead band at
 * 768–1023: the desktop page rendered *under* the mobile bottom bar with no
 * rail. Keep this in lockstep with those two classes.
 */
const QUERY = '(max-width: 1023px)'

// SSR-safe: matchMedia is undefined during server render, default to false.
function getInitial() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(QUERY).matches
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(getInitial)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia(QUERY)
    const onChange = (e) => setIsMobile(e.matches)
    // Older Safari only supports addListener/removeListener
    if (mql.addEventListener) mql.addEventListener('change', onChange)
    else mql.addListener(onChange)
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange)
      else mql.removeListener(onChange)
    }
  }, [])

  return isMobile
}
