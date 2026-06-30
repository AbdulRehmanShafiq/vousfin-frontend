import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Footer from '@/pages/landing/sections/Footer'

/**
 * Shared shell for public (no-auth) marketing/legal/docs pages. Reuses the
 * landing theme tokens (scoped under .vf-landing) and the landing Footer so the
 * whole public surface stays visually consistent. Lightweight on purpose — no
 * heavy 3D/scroll libs, so these pages load fast.
 */
export default function PublicLayout({ title, children }) {
  useEffect(() => {
    if (title) document.title = `${title} · VousFin`
    return () => { document.title = 'VousFin' }
  }, [title])

  return (
    <div className="vf-landing min-h-[100dvh] bg-[#1A1714] text-[#F5F0E8]">
      <header className="sticky top-0 z-40 border-b border-[#C8A96E]/[0.08] bg-[#1A1714]/85 backdrop-blur-md">
        <div className="content-max flex h-16 items-center justify-between">
          <Link to="/" className="font-display text-xl font-semibold" aria-label="VousFin home">
            <span className="text-[#F5F0E8]">vous</span><span className="text-gold-gradient">Fin</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link to="/docs" className="text-[#A89B8C] transition-colors hover:text-[#C8A96E]">Documentation</Link>
            <Link to="/login" className="text-[#A89B8C] transition-colors hover:text-[#C8A96E]">Sign in</Link>
            <Link
              to="/register"
              className="rounded-lg border border-[#C8A96E]/30 bg-[#C8A96E]/10 px-3 py-1.5 text-[#F5F0E8] transition-colors hover:bg-[#C8A96E]/20"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="content-max py-14 sm:py-20">{children}</main>

      <Footer />
    </div>
  )
}
