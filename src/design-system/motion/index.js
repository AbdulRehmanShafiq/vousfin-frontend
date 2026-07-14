/**
 * Ledger motion system — the ONE animation vocabulary (framer-motion).
 *
 * Rules (from the 2026-07-14 redesign spec §8.5):
 *  1. Page enter: fade + 8px rise, once — never re-animate on refetch.
 *  2. Lists: 30ms stagger on first paint only.
 *  3. Overlays: fade + scale 0.98→1; sheets slide with a spring.
 *  4. Count-up on HERO figures only, once per mount.
 *  5. Hover: color/border/opacity only — nothing that shifts layout.
 *  6. All variants degrade to opacity-only under prefers-reduced-motion
 *     (a global CSS guard also zeroes durations as a hard backstop).
 *
 * Usage:
 *   import { motion } from 'framer-motion'
 *   import { pageEnter, listStagger, listItem } from '@/design-system/motion'
 *   <motion.div {...pageEnter}>…</motion.div>
 */

/* ── Tokens ── */
export const duration = { fast: 0.14, base: 0.2, slow: 0.3 }
export const ease = {
  out: [0.16, 1, 0.3, 1],     // entrances
  inOut: [0.4, 0, 0.2, 1],    // state changes
}
export const spring = { type: 'spring', stiffness: 400, damping: 30 }

/* ── Page / section entrance (fade + 8px rise, once) ── */
export const pageEnter = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: duration.base, ease: ease.out },
}

/* ── Staggered lists — parent + child pair, first paint only ── */
export const listStagger = {
  initial: 'hidden',
  animate: 'show',
  variants: {
    hidden: {},
    show: { transition: { staggerChildren: 0.03 } },
  },
}
export const listItem = {
  variants: {
    hidden: { opacity: 0, y: 4 },
    show: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
  },
}

/* ── Overlays (menus, popovers, modals) — pair with <AnimatePresence> ── */
export const overlayPop = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.18, ease: ease.inOut },
}

/* ── Bottom sheets / side panels ── */
export const sheetSlideUp = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
  transition: { ...spring, damping: 34 },
}
export const panelSlideRight = {
  initial: { x: 24, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 24, opacity: 0 },
  transition: { duration: duration.base, ease: ease.out },
}

/* ── Buttons / tappables ── */
export const tap = { whileTap: { scale: 0.98 } }

/* ── Backdrop fade ── */
export const backdropFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: duration.fast },
}
