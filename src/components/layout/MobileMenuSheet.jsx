import { useNavigate, useLocation, Link } from 'react-router-dom'
import { LogOut, Shield, MessageSquare } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { useFeedbackStore } from '@/stores/useFeedbackStore'
import { RAIL_ITEMS, activeSectionKey } from './nav.config'
import { cn } from '@/utils/cn'

/*
 * MobileMenuSheet — the "Menu" tab's bottom sheet.
 *
 * Replaces the old drawer: every section hub (Home + 6) is a tappable tile,
 * plus Log out. This is how all sections stay reachable from the bottom bar.
 */
export default function MobileMenuSheet({ open, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const setFeedbackOpen = useFeedbackStore((s) => s.setIsOpen)
  const activeKey = activeSectionKey(location.pathname)

  if (!open) return null

  const go = (href) => { onClose(); navigate(href) }

  return createPortal(
    <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="absolute inset-0 bg-navy/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border border-b-0 border-glass bg-charcoal p-4 pb-6 shadow-2xl animate-slide-up-sheet">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-glass-panel" />

        <div className="grid grid-cols-3 gap-2.5">
          {RAIL_ITEMS.map((item) => {
            const active = activeKey === item.key
            return (
              <button
                key={item.key}
                onClick={() => go(item.href)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all active:scale-95',
                  active ? 'border-glass-2 bg-glass-panel' : 'border-glass hover:bg-glass-hover',
                )}
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `rgb(${item.accent} / 0.14)`, boxShadow: `inset 0 0 0 1px rgb(${item.accent} / 0.28)` }}
                >
                  <item.icon className="h-[19px] w-[19px]" style={{ color: `rgb(${item.accent})` }} />
                </span>
                <span className={cn('text-[12px] font-medium text-center leading-tight', active ? 'text-text-primary' : 'text-text-secondary')}>
                  {item.name}
                </span>
              </button>
            )
          })}
        </div>

        {user?.role === 'admin' && (
          <Link
            to="/admin"
            onClick={onClose}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl border border-accent/20 bg-accent/8 py-3 text-[13px] font-semibold text-accent transition-colors hover:bg-accent/15 active:scale-[0.99]"
          >
            <Shield className="h-4 w-4" />
            Admin Panel
          </Link>
        )}
        {/* User menu items */}
        <div className="mt-2.5 space-y-2">
          <button
            onClick={() => {
              setFeedbackOpen(true);
              onClose();
            }}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl border border-accent/20 bg-accent/8 py-3 text-[13px] font-semibold text-accent transition-colors hover:bg-accent/15 active:scale-[0.99]"
          >
            <MessageSquare className="h-4 w-4" />
            Send feedback
          </button>
          <Link
            to="/support"
            onClick={onClose}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl border border-accent/20 bg-accent/8 py-3 text-[13px] font-semibold text-accent transition-colors hover:bg-accent/15 active:scale-[0.99]"
          >
            <MessageSquare className="h-4 w-4" />
            Support
          </Link>
        </div>
        <button
          onClick={() => { onClose(); logout() }}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl border border-negative/20 bg-negative/8 py-3 text-[13px] font-semibold text-negative transition-colors hover:bg-negative/15 active:scale-[0.99]"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </div>,
    document.body,
  )
}
