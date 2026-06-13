import { Bell } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useLocation } from 'react-router-dom'
import vousFinLogo from '@/assets/vousfin-logo.png'
import { pageTitleFor } from './nav.config'

export default function Header() {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  // Title derives from the same nav model the rail renders — no drift.
  const title = pageTitleFor(location.pathname)

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-3 border-b border-glass bg-navy/85 px-4 backdrop-blur-md sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Brand mark on mobile (rail is desktop-only) */}
      <img src={vousFinLogo} alt="VousFin" className="h-6 w-6 object-contain lg:hidden" />

      <div className="flex flex-1 items-center justify-between gap-x-4 lg:gap-x-6">
        <h1 className="font-display text-lg font-semibold text-text-primary tracking-tight">{title}</h1>

        <div className="flex items-center gap-x-3 lg:gap-x-4">
          <button type="button" className="-m-2 p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-glass-hover transition-colors">
            <span className="sr-only">View notifications</span>
            <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-5 lg:w-px lg:bg-glass" aria-hidden="true" />

          {/* Profile */}
          <div className="flex items-center gap-x-2.5 text-sm font-medium text-text-primary">
            <div className="h-7 w-7 rounded-full bg-accent-soft border border-glass-2 flex items-center justify-center text-accent text-xs font-semibold">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="hidden lg:block text-[13px] text-text-secondary">{user?.fullName || 'User'}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
