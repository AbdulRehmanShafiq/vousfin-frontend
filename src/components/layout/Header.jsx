import { useRef, useState } from 'react'
import { Bell, LogOut, Palette, ShieldCheck, MessageSquare, ChevronDown } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { useFeedbackStore } from '@/stores/useFeedbackStore'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { cn } from '@/utils/cn'
import vousFinLogo from '@/assets/vousfin-logo.png'
import { pageTitleFor } from './nav.config'

export default function Header() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const setFeedbackOpen = useFeedbackStore((s) => s.setIsOpen)
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  useOnClickOutside(menuRef, () => setMenuOpen(false))

  // Title derives from the same nav model the rail renders — no drift.
  const title = pageTitleFor(location.pathname)
  const initial = user?.fullName?.charAt(0)?.toUpperCase() || 'U'

  const menuItem = 'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-glass-hover hover:text-text-primary transition-colors'

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-3 border-b border-glass bg-navy/85 px-4 backdrop-blur-md sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Brand mark on mobile (rail is desktop-only) */}
      <img src={vousFinLogo} alt="VousFin" className="h-6 w-6 object-contain lg:hidden" />

      <div className="flex flex-1 items-center justify-between gap-x-4 lg:gap-x-6">
        <h1 className="font-display text-lg font-semibold text-text-primary tracking-tight">{title}</h1>

        <div className="flex items-center gap-x-3 lg:gap-x-4">
          {/* Bell → recent activity / audit trail ("what changed") */}
          <Link
            to="/activity"
            className="-m-2 p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-glass-hover transition-colors"
            aria-label="View recent activity"
          >
            <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
          </Link>

          {/* Separator */}
          <div className="hidden lg:block lg:h-5 lg:w-px lg:bg-glass" aria-hidden="true" />

          {/* Profile menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Account menu"
              className="flex items-center gap-x-2 rounded-md p-1 text-sm font-medium text-text-primary hover:bg-glass-hover transition-colors"
            >
              <span className="h-7 w-7 rounded-full bg-accent-soft border border-glass-2 flex items-center justify-center text-accent text-xs font-semibold">
                {initial}
              </span>
              <span className="hidden lg:block text-[13px] text-text-secondary">{user?.fullName || 'User'}</span>
              <ChevronDown className={cn('hidden lg:block h-3.5 w-3.5 text-text-muted transition-transform', menuOpen && 'rotate-180')} />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-xl border border-glass bg-charcoal p-1.5 shadow-elevated z-50"
              >
                <div className="px-3 py-2 border-b border-glass mb-1">
                  <p className="text-sm font-semibold text-text-primary truncate">{user?.fullName || 'User'}</p>
                  {user?.email && <p className="text-xs text-text-muted truncate">{user.email}</p>}
                </div>
                <Link to="/settings/appearance" role="menuitem" onClick={() => setMenuOpen(false)} className={menuItem}>
                  <Palette className="h-4 w-4 text-text-muted" /> Appearance
                </Link>
                <Link to="/settings/security" role="menuitem" onClick={() => setMenuOpen(false)} className={menuItem}>
                  <ShieldCheck className="h-4 w-4 text-text-muted" /> Security
                </Link>
                <button role="menuitem" onClick={() => { setFeedbackOpen(true); setMenuOpen(false) }} className={menuItem}>
                  <MessageSquare className="h-4 w-4 text-text-muted" /> Send feedback
                </button>
                <div className="my-1 h-px bg-glass" />
                <button
                  role="menuitem"
                  onClick={() => { setMenuOpen(false); logout(); navigate('/login') }}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-negative/90 hover:bg-negative-muted hover:text-negative transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
