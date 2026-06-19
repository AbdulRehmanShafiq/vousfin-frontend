import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'

// Wraps any clickable in a "magnetic" field: the element eases toward the cursor
// while hovered, then springs back. Renders a <motion.button> by default.
// Disabled under reduced motion (renders a plain element).
export default function MagneticButton({
  children, className = '', onClick, strength = 0.4, as = 'button', type = 'button', ...rest
}) {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.3 })
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.3 })

  const handleMove = (e) => {
    if (reduced || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => { x.set(0); y.set(0) }

  const Comp = as === 'a' ? motion.a : motion.button
  const extra = as === 'a' ? {} : { type }

  return (
    <Comp
      ref={ref}
      {...extra}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={reduced ? undefined : { x: sx, y: sy }}
      className={className}
      data-cursor="hot"
      whileTap={reduced ? undefined : { scale: 0.96 }}
      {...rest}
    >
      {children}
    </Comp>
  )
}
