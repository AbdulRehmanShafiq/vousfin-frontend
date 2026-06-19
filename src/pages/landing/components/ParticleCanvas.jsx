import { useRef, useEffect } from 'react'

const PARTICLE_COUNT = 60
const GOLD_COLOR = '#C8A96E'
const CONNECTION_DISTANCE = 120
const MOUSE_REPULSION_RADIUS = 150
const MOUSE_REPULSION_FORCE = 0.8

export default function ParticleCanvas() {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    // Initialize particles
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 1 + Math.random() * 2,
      opacity: 0.1 + Math.random() * 0.5,
    }))

    function handleMouseMove(e) {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    function handleMouseLeave() {
      mouseRef.current = { x: -9999, y: -9999 }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    function animate() {
      const w = window.innerWidth
      const h = window.innerHeight
      ctx.clearRect(0, 0, w, h)

      const particles = particlesRef.current
      const mouse = mouseRef.current

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Apply mouse repulsion
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MOUSE_REPULSION_RADIUS && dist > 0) {
          const force = (MOUSE_REPULSION_RADIUS - dist) / MOUSE_REPULSION_RADIUS
          p.vx += (dx / dist) * force * MOUSE_REPULSION_FORCE
          p.vy += (dy / dist) * force * MOUSE_REPULSION_FORCE
        }

        // Apply velocity with damping
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.99
        p.vy *= 0.99

        // Gentle ambient drift
        p.vx += (Math.random() - 0.5) * 0.01
        p.vy += (Math.random() - 0.5) * 0.01

        // Wrap around edges
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = GOLD_COLOR
        ctx.globalAlpha = p.opacity
        ctx.fill()
      }

      ctx.globalAlpha = 1

      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const cdx = a.x - b.x
          const cdy = a.y - b.y
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy)
          if (cdist < CONNECTION_DISTANCE) {
            const lineOpacity = (1 - cdist / CONNECTION_DISTANCE) * 0.08
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = GOLD_COLOR
            ctx.globalAlpha = lineOpacity
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto"
      style={{ width: '100%', height: '100%' }}
    />
  )
}
