import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

// A luminous two-part cursor (precise dot + lagging gold ring) that grows over
// interactive elements. Desktop + fine-pointer only; fully disabled under
// reduced motion. Pure DOM + rAF — no React re-renders per frame.
export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const root = document.querySelector('.vf-landing')
    const dot = dotRef.current
    const ring = ringRef.current
    if (!root || !dot || !ring) return
    root.classList.add('vf-cursor-on')

    let mx = window.innerWidth / 2, my = window.innerHeight / 2
    let rx = mx, ry = my
    let raf

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`
      const hot = !!(e.target.closest && e.target.closest('a, button, [data-cursor="hot"]'))
      ring.classList.toggle('is-hot', hot)
    }
    const loop = () => {
      rx += (mx - rx) * 0.18
      ry += (my - ry) * 0.18
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }
    const onLeave = () => { dot.style.opacity = '0'; ring.style.opacity = '0' }
    const onEnter = () => { dot.style.opacity = '1'; ring.style.opacity = '1' }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      root.classList.remove('vf-cursor-on')
    }
  }, [reduced])

  if (reduced) return null
  return (
    <>
      <div ref={ringRef} className="vf-cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="vf-cursor-dot" aria-hidden="true" />
    </>
  )
}
