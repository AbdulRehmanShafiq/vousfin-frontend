import { motion, useReducedMotion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

/*
 * PageTransition — a calm fade + 8px rise on every route change (Calm redesign).
 * Keyed on pathname so it re-runs per page. Transform/opacity only, ~200ms,
 * gentle ease. Respects prefers-reduced-motion (→ instant, opacity only).
 */
export default function PageTransition({ children }) {
  const { pathname } = useLocation()
  const reduce = useReducedMotion()
  return (
    <motion.div
      key={pathname}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.12 : 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
