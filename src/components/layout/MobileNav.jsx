/**
 * MobileNav — the single mobile navigation surface (no sidebar/drawer).
 *
 * Five slots: Home · Money · ⊕ Actions (raised) · AI · Menu.
 *   - Home / Money : direct destinations
 *   - Actions      : "what you can do here" — resolves per page (see below)
 *   - AI           : opens the assistant chat (useCommandBar)
 *   - Menu         : bottom sheet with every section hub + log out
 * Visible only < lg (desktop uses the rail).
 *
 * The ⊕ resolves its actions in precedence order:
 *   1. actions a page published via useRegisterFabActions (richest, page-owned)
 *   2. the static route map in nav.config (the "New …" create forms)
 *   3. the universal Capture sheet (so it is never dead)
 * One action → the ⊕ does it directly; several → it opens a Quick-actions
 * sheet. Every action is labelled, so there is no hidden create-vs-navigate
 * mode switch.
 */
import { useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Wallet, Plus, Sparkles, Menu } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useUIStore } from '@/stores/useUIStore'
import { useFabActions } from '@/stores/useFabActions'
import { useCommandBar } from '@/features/command-bar/useCommandBar'
import { usePermissions } from '@/hooks/usePermissions'
import { useIsMobile } from '@/hooks/useIsMobile'
import { vibrate } from '@/design-system/haptics'
import { staticFabActionsFor, CAPTURE_FAB_ACTION } from './nav.config'
import MobileMenuSheet from './MobileMenuSheet'
import QuickActionsSheet from '@/components/mobile/QuickActionsSheet'

function Tab({ icon: Icon, label, to, onClick, active }) {
  const inner = (isActive) => (
    <>
      <span
        className={cn(
          'absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-b-full transition-all duration-200',
          isActive ? 'w-8 bg-accent' : 'w-0 bg-transparent',
        )}
      />
      <span className={cn('p-1.5 rounded-lg transition-colors duration-150', isActive && 'bg-accent-soft')}>
        <Icon className="h-[22px] w-[22px]" />
      </span>
      {label}
    </>
  )
  const base =
    'relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-label font-semibold transition-colors min-h-[58px] justify-center'

  if (to) {
    return (
      <NavLink to={to} className={({ isActive }) => cn(base, isActive ? 'text-accent' : 'text-text-muted hover:text-text-secondary')}>
        {({ isActive }) => inner(isActive)}
      </NavLink>
    )
  }
  return (
    <button type="button" onClick={onClick} className={cn(base, active ? 'text-accent' : 'text-text-muted hover:text-text-secondary')}>
      {inner(active)}
    </button>
  )
}

export default function MobileNav() {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [actionsOpen, setActionsOpen] = useState(false)
  const openCapture = useUIStore((s) => s.openCapture)
  const openAssistant = useCommandBar((s) => s.openAssistant)
  const registered = useFabActions((s) => s.actions)
  const { can } = usePermissions()
  const canCreate = can('transaction:create')
  const { pathname } = useLocation()
  const navigate = useNavigate()
  // This <nav> is CSS-hidden at lg, but the sheets portal to <body> and so
  // would survive the bar that opened them — an iPad rotating portrait (768) to
  // landscape (1024) would strand one over the desktop UI. Same boundary, in JS.
  const isMobile = useIsMobile()

  // Resolve the ⊕'s actions: page-registered → static route map → Capture.
  const staticActions = useMemo(() => staticFabActionsFor(pathname), [pathname])
  const actions =
    (registered && registered.length) ? registered
      : staticActions.length ? staticActions
        : [CAPTURE_FAB_ACTION]

  const runAction = (a) => {
    vibrate()
    if (a.run) a.run()
    else if (a.kind === 'capture') openCapture()
    else if (a.kind === 'nav') navigate(a.to)
  }

  const single = actions.length === 1
  const fabLabel = single ? (actions[0].label || t(actions[0].labelKey)) : t('fab.actions')
  const onFab = () => (single ? runAction(actions[0]) : setActionsOpen(true))

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-glass bg-charcoal/96 backdrop-blur-md lg:hidden">
        <Tab icon={LayoutDashboard} label={t('mobile.tab.home')} to="/dashboard" />
        {/* Mobile Easy M2: the second phone job is money, not statements —
            Owed to me · I owe · Activity (Reports live inside Money + Menu). */}
        <Tab icon={Wallet} label={t('mobile.tab.money')} to="/money" />

        {/* Center raised ⊕ — "what you can do here": New invoice on Invoices,
            New item on Inventory, Export on a report… falling back to the
            universal Capture sheet where a page offers nothing of its own. */}
        {canCreate ? (
          <div className="relative flex flex-1 flex-col items-center justify-end pb-1.5">
            <button
              type="button"
              onClick={onFab}
              aria-label={fabLabel}
              aria-haspopup={single ? undefined : 'menu'}
              className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full btn-gradient border-[3px] border-charcoal active:scale-95 transition-transform"
            >
              <Plus className="h-6 w-6" />
            </button>
            <span className="max-w-full truncate px-0.5 text-label font-semibold text-text-muted">
              {fabLabel}
            </span>
          </div>
        ) : (
          <div className="flex-1" aria-hidden="true" />
        )}

        <Tab icon={Sparkles} label={t('mobile.tab.ai')} onClick={openAssistant} />
        <Tab icon={Menu} label={t('mobile.tab.menu')} onClick={() => setMenuOpen(true)} active={menuOpen} />
      </nav>

      <QuickActionsSheet
        open={actionsOpen && isMobile}
        onClose={() => setActionsOpen(false)}
        actions={actions}
        onPick={runAction}
      />

      <MobileMenuSheet open={menuOpen && isMobile} onClose={() => setMenuOpen(false)} />
    </>
  )
}
