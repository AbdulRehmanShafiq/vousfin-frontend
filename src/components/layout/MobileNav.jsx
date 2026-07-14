/**
 * MobileNav — the single mobile navigation surface (no sidebar/drawer).
 *
 * Five slots: Home · Reports · ⊕ Create (raised) · AI · Menu.
 *   - Home / Reports : direct destinations
 *   - Create         : universal New Transaction (global modal via useUIStore)
 *   - AI             : opens the assistant chat (useAIStore)
 *   - Menu           : bottom sheet with every section hub + log out
 * Visible only < lg (desktop uses the rail).
 */
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BarChart3, Plus, Sparkles, Menu } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useUIStore } from '@/stores/useUIStore'
import { useCommandBar } from '@/features/command-bar/useCommandBar'
import { usePermissions } from '@/hooks/usePermissions'
import MobileMenuSheet from './MobileMenuSheet'

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
  const [menuOpen, setMenuOpen] = useState(false)
  const openTxModal = useUIStore((s) => s.openTxModal)
  const openAssistant = useCommandBar((s) => s.openAssistant)
  const { can } = usePermissions()
  const canCreate = can('transaction:create')

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-glass bg-charcoal/96 backdrop-blur-md lg:hidden">
        <Tab icon={LayoutDashboard} label="Home" to="/dashboard" />
        <Tab icon={BarChart3} label="Reports" to="/financial-reports/income-statement" />

        {/* Center raised Create — the universal primary action (hidden for read-only members) */}
        {canCreate ? (
          <div className="relative flex flex-1 flex-col items-center justify-end pb-1.5">
            <button
              type="button"
              onClick={openTxModal}
              aria-label="Record a transaction"
              className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full btn-gradient border-[3px] border-charcoal active:scale-95 transition-transform"
            >
              <Plus className="h-6 w-6" />
            </button>
            <span className="text-label font-semibold text-text-muted">Create</span>
          </div>
        ) : (
          <div className="flex-1" aria-hidden="true" />
        )}

        <Tab icon={Sparkles} label="AI" onClick={openAssistant} />
        <Tab icon={Menu} label="Menu" onClick={() => setMenuOpen(true)} active={menuOpen} />
      </nav>

      <MobileMenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
