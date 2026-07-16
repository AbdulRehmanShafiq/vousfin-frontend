import { useRef, useState } from 'react'
import { Bell, LogOut, Palette, ShieldCheck, MessageSquare, ChevronDown, Search, Plus, ClipboardCheck, BrainCircuit, ShieldAlert, Activity } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useCommandBar } from '@/features/command-bar/useCommandBar'
import { useAuthStore } from '@/stores/useAuthStore'
import { useFeedbackStore } from '@/stores/useFeedbackStore'
import { useUIStore } from '@/stores/useUIStore'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import approvalService from '@/services/approval.service'
import { cn } from '@/utils/cn'
import vousFinLogo from '@/assets/vousfin-logo.png'
import { pageTitleFor } from './nav.config'

export default function Header() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const setFeedbackOpen = useFeedbackStore((s) => s.setIsOpen)
  const openCommandBar = useCommandBar((s) => s.openBar)
  const openTxModal = useUIStore((s) => s.openTxModal)
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const menuRef = useRef(null)
  const notifRef = useRef(null)
  useOnClickOutside(menuRef, () => setMenuOpen(false))
  useOnClickOutside(notifRef, () => setNotifOpen(false))

  // Same query key the rail uses — one shared poller, zero extra requests.
  const { data: approvalsPending = 0 } = useQuery({
    queryKey: ['approvals-count'],
    queryFn: () => approvalService.count().then((r) => r.data.data?.pending ?? 0),
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: false,
  })

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
          {/* Global create — the QBO-style omnipresent "+ New" (also key: c) */}
          <button
            type="button"
            onClick={openTxModal}
            aria-keyshortcuts="c"
            aria-label="Record something new"
            className="hidden lg:inline-flex items-center gap-1.5 rounded-lg btn-gradient px-3 py-1.5 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New
          </button>

          {/* Search + AI assistant → the one unified command bar (also Cmd/Ctrl+K or "/") */}
          <button
            type="button"
            onClick={openCommandBar}
            aria-keyshortcuts="Control+K"
            aria-label="Search or ask the AI assistant"
            className="inline-flex items-center gap-2 rounded-lg border border-glass bg-glass px-2.5 py-1.5 text-sm text-text-muted hover:text-text-primary hover:bg-glass-hover transition-colors"
          >
            <Search className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="hidden sm:inline">Search or ask AI</span>
            <kbd className="hidden rounded bg-navy px-1.5 text-label leading-5 lg:inline">⌘K</kbd>
          </button>

          {/* Notifications — what needs you, with deep links (Ledger shell v2) */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={notifOpen}
              aria-label={approvalsPending > 0 ? `Notifications — ${approvalsPending} approvals waiting` : 'Notifications'}
              className="relative -m-2 p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-glass-hover transition-colors"
            >
              <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
              {approvalsPending > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-highlight text-label font-bold text-ink-on-accent flex items-center justify-center">
                  {approvalsPending > 99 ? '99+' : approvalsPending}
                </span>
              )}
            </button>
            {notifOpen && (
              <div role="menu" className="absolute right-0 top-[calc(100%+8px)] w-72 rounded-overlay border border-glass bg-charcoal p-1.5 shadow-elevated z-50">
                <p className="px-3 py-2 text-label uppercase tracking-wider text-text-muted border-b border-glass mb-1">What needs you</p>
                {[
                  { to: '/approvals', icon: ClipboardCheck, label: 'Approvals waiting', badge: approvalsPending },
                  { to: '/ai/review-queue', icon: BrainCircuit, label: 'AI entries to confirm' },
                  { to: '/reconciliation/exceptions', icon: ShieldAlert, label: 'Reconciliation exceptions' },
                  { to: '/activity', icon: Activity, label: 'Recent activity' },
                ].map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    role="menuitem"
                    onClick={() => setNotifOpen(false)}
                    className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-glass-hover hover:text-text-primary transition-colors"
                  >
                    <n.icon className="h-4 w-4 text-text-muted" aria-hidden="true" />
                    <span className="flex-1">{n.label}</span>
                    {n.badge > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-highlight text-label font-bold text-ink-on-accent flex items-center justify-center">
                        {n.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

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
              <span className="hidden lg:block text-small text-text-secondary">{user?.fullName || 'User'}</span>
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
