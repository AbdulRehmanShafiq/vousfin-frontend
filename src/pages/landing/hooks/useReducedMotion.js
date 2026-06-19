import { useState, useEffect } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function getInitial() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(QUERY).matches
}

// Exported BOTH named and default — the ported sections import it both ways.
export function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(getInitial)

  useEffect(() => {
    const mql = window.matchMedia(QUERY)
    const handler = (e) => setPrefersReduced(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return prefersReduced
}

export default useReducedMotion
