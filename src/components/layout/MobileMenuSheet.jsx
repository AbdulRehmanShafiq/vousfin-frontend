import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Shield, MessageSquare, LifeBuoy, Inbox, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/useAuthStore'
import { useFeedbackStore } from '@/stores/useFeedbackStore'
import { useModulesStore } from '@/stores/useModulesStore'
import approvalService from '@/services/approval.service'
import Sheet from '@/components/mobile/Sheet'
import { MODULES, activeModuleKey } from './nav.config'
import { cn } from '@/utils/cn'

/* Pinned Inbox row — badge from the same shared approvals poller. */
function InboxRow({ onGo }) {
  const { data: pending = 0 } = useQuery({
    queryKey: ['approvals-count'],
    queryFn: () => approvalService.count().then((r) => r.data.data?.pending ?? 0),
    staleTime: 30_000,
    retry: false,
  })
  return (
    <button
      type="button"
      onClick={() => onGo('/inbox')}
      className="tap-target mb-2.5 flex w-full items-center gap-2.5 rounded-2xl border border-glass bg-glass-panel px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-glass-hover active:scale-[0.99]"
    >
      <Inbox className="h-4 w-4 text-accent" aria-hidden="true" />
      <span className="flex-1 text-left">Inbox — what needs you</span>
      {pending > 0 && (
        <span className="min-w-[20px] rounded-full bg-highlight/15 px-1.5 py-0.5 text-center text-xs font-bold text-highlight-2">{pending}</span>
      )}
      <ChevronRight className="h-4 w-4 text-text-muted" aria-hidden="true" />
    </button>
  )
}

/* A secondary destination: quiet row, not a button competing with the tiles. */
function UtilityRow({ icon: Icon, label, onClick, tone = 'default' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'tap-target flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
        tone === 'danger'
          ? 'text-negative/90 hover:bg-negative-muted hover:text-negative'
          : 'text-text-secondary hover:bg-glass-hover hover:text-text-primary',
      )}
    >
      <Icon className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
      <span className="flex-1 text-left">{label}</span>
    </button>
  )
}

/*
 * MobileMenuSheet — the "Menu" tab's bottom sheet.
 *
 * Every section hub (Home + 6) is a tappable tile, plus the utility rows.
 * This is how all sections stay reachable from the bottom bar.
 *
 * Built on the shared `Sheet` (2026-07-16). It used to hand-roll its own
 * portal + backdrop, and so quietly missed everything Sheet already solves:
 * body scroll lock, a max height with an overflow-scrolling body (an admin's
 * tiles + Admin + Feedback + Support + Log out could run past the viewport
 * with no way to reach them), a safe-area bottom inset (Log out sat under the
 * iPhone home indicator), and a close button. One sheet implementation.
 *
 * Admin / Feedback / Support were three identically-styled accent buttons, two
 * sharing an icon — three shouts where the module tiles are the actual point.
 * They are now quiet utility rows, and Support has its own icon.
 */
export default function MobileMenuSheet({ open, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const setFeedbackOpen = useFeedbackStore((s) => s.setIsOpen)
  const disabledModules = useModulesStore((s) => s.disabled)
  const activeKey = activeModuleKey(location.pathname)
  const items = MODULES.filter((m) => m.alwaysOn || m.pinBottom || !disabledModules.includes(m.key))

  const go = (href) => { onClose(); navigate(href) }

  return (
    <Sheet isOpen={open} onClose={onClose} title="Menu">
      <InboxRow onGo={go} />

      <div className="grid grid-cols-3 gap-2.5">
        {items.map((item) => {
          const active = activeKey === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => go(item.href)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all active:scale-95',
                active ? 'border-glass-2 bg-glass-panel' : 'border-glass hover:bg-glass-hover',
              )}
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `rgb(${item.accent} / 0.14)`, boxShadow: `inset 0 0 0 1px rgb(${item.accent} / 0.28)` }}
                aria-hidden="true"
              >
                <item.icon className="h-[19px] w-[19px]" style={{ color: `rgb(${item.accent})` }} />
              </span>
              <span className={cn('text-xs font-medium text-center leading-tight', active ? 'text-text-primary' : 'text-text-secondary')}>
                {item.name}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-3 space-y-0.5 border-t border-glass pt-2">
        {user?.role === 'admin' && (
          <UtilityRow icon={Shield} label="Admin panel" onClick={() => go('/admin')} />
        )}
        <UtilityRow icon={MessageSquare} label="Send feedback" onClick={() => { setFeedbackOpen(true); onClose() }} />
        <UtilityRow icon={LifeBuoy} label="Support" onClick={() => go('/support')} />
        <UtilityRow icon={LogOut} label="Log out" tone="danger" onClick={() => { onClose(); logout() }} />
      </div>
    </Sheet>
  )
}
