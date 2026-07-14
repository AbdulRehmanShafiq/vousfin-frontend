import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, PanelLeftClose, PanelLeftOpen, LayoutGrid } from 'lucide-react'
import { cn } from '@/utils/cn'
import vousFinLogo from '@/assets/vousfin-logo.png'
import { useAuthStore } from '@/stores/useAuthStore'
import { useModulesStore } from '@/stores/useModulesStore'
import approvalService from '@/services/approval.service'
import { MODULES, moduleByKey, activeModuleKey, isItemActive, navKey } from './nav.config'

/*
 * RailPanel — the Hybrid "Rail + Contextual Panel" desktop navigation.
 *
 *   [64px icon rail]  → every enabled module, 1 click to anywhere
 *   [216px panel]     → the active module's sub-items + Overview (command center)
 *
 * The panel collapses to rail-only for dense report work (remembered per user).
 * Desktop only (>= lg); mobile uses MobileNav.
 */

const PANEL_LS = 'vf-panel-collapsed'

function RailIcon({ module, active, badge }) {
  const { t } = useTranslation()
  const accent = module.accent
  const label = t(`nav.item.${navKey(module.href)}`, module.name)
  return (
    <NavLink
      to={module.href}
      className="group relative flex h-11 w-11 items-center justify-center rounded-xl transition-premium"
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      {/* Active accent bar — a quiet section-tinted hairline (Calm: no glow) */}
      <span
        className="absolute left-[-9px] top-1/2 -translate-y-1/2 w-[2px] rounded-full transition-all duration-300"
        style={{ height: active ? 18 : 0, background: `rgb(${accent})` }}
      />
      <span
        className="relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-200 group-hover:bg-glass-hover"
        style={active ? { background: `rgb(${accent} / 0.10)` } : undefined}
      >
        <module.icon
          className={cn('h-[19px] w-[19px] transition-colors duration-200', !active && 'text-text-muted group-hover:text-text-secondary')}
          style={active ? { color: `rgb(${accent})` } : undefined}
        />
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-highlight text-label font-bold text-ink-on-accent flex items-center justify-center">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>
      {/* Floating tooltip */}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-[52px] z-50 whitespace-nowrap rounded-lg border border-glass-2 bg-charcoal/95 px-2.5 py-1 text-xs font-medium text-text-primary opacity-0 -translate-x-1 shadow-elevated backdrop-blur-md transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0"
      >
        {label}
      </span>
    </NavLink>
  )
}

export default function RailPanel() {
  const { t } = useTranslation()
  const location = useLocation()
  const logout = useAuthStore((s) => s.logout)
  // Subscribe to the `disabled` array (not the isEnabled fn) so the rail
  // re-renders the moment a module is toggled on/off.
  const disabledModules = useModulesStore((s) => s.disabled)
  const isEnabled = (key) => !disabledModules.includes(key)
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(PANEL_LS) === '1' } catch { return false }
  })

  const activeKey = activeModuleKey(location.pathname)
  const activeModule = moduleByKey(activeKey)

  const { data: approvalsPending = 0 } = useQuery({
    queryKey: ['approvals-count'],
    queryFn: () => approvalService.count().then((r) => r.data.data?.pending ?? 0),
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: false,
  })
  const badgeFor = (key) => (key === 'accounting' ? approvalsPending : 0)

  const visible = MODULES.filter((m) => m.alwaysOn || m.pinBottom || isEnabled(m.key))
  const top = visible.filter((m) => !m.pinBottom)
  const bottom = visible.filter((m) => m.pinBottom)

  // The panel shows only when the active module has sub-items and isn't collapsed.
  const showPanel = !collapsed && !!activeModule && activeModule.items.length > 0

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c
      try { localStorage.setItem(PANEL_LS, next ? '1' : '0') } catch { /* ignore */ }
      return next
    })
  }

  const panelItem = (item) => {
    const active = isItemActive(item, location.pathname)
    const badge = item.badgeKey === 'approvals' ? approvalsPending : 0
    return (
      <NavLink
        key={item.href}
        to={item.href}
        className={cn(
          'group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-premium',
          active ? 'bg-accent-soft text-text-primary' : 'text-text-secondary hover:bg-glass-hover hover:text-text-primary',
        )}
      >
        <span
          className={cn('absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full transition-all',
            active ? 'bg-accent shadow-[0_0_10px_rgb(var(--c-accent)/0.9)]' : 'bg-transparent')}
        />
        <item.icon className={cn('h-[16px] w-[16px] flex-shrink-0', active ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary')} />
        <span className="flex-1 truncate">{t(`nav.item.${navKey(item.href)}`, item.name)}</span>
        {badge > 0 && (
          <span className="ml-auto min-w-[18px] h-[18px] px-1.5 rounded-full bg-highlight text-label font-bold text-ink-on-accent flex items-center justify-center">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </NavLink>
    )
  }

  return (
    <div className="hidden lg:flex h-full shrink-0">
      {/* ── 64px icon rail ── */}
      <aside className="flex w-16 flex-col items-center border-r border-glass bg-charcoal py-4 px-2.5 overflow-y-auto scrollbar-none">
        <NavLink to="/dashboard" className="mb-4 flex items-center justify-center" aria-label="VousFin home">
          <img src={vousFinLogo} alt="VousFin" className="h-7 w-7 object-contain drop-shadow-[0_0_8px_rgb(var(--c-accent)/0.35)]" />
        </NavLink>

        <nav className="flex flex-col items-center gap-1.5">
          {top.map((m) => (
            <RailIcon key={m.key} module={m} active={activeKey === m.key} badge={badgeFor(m.key)} />
          ))}
        </nav>

        <div className="mt-auto flex flex-col items-center gap-1.5 pt-2">
          <span className="h-px w-7 bg-glass my-1" aria-hidden="true" />
          {bottom.map((m) => (
            <RailIcon key={m.key} module={m} active={activeKey === m.key} badge={0} />
          ))}
          <button
            onClick={logout}
            aria-label={t('action.logout', 'Log out')}
            className="group relative flex h-11 w-11 items-center justify-center rounded-xl text-text-muted transition-premium hover:text-negative"
          >
            <LogOut className="h-[18px] w-[18px]" />
            <span role="tooltip" className="pointer-events-none absolute left-[52px] z-50 whitespace-nowrap rounded-lg border border-glass-2 bg-charcoal/95 px-2.5 py-1 text-xs font-medium text-text-primary opacity-0 -translate-x-1 shadow-elevated backdrop-blur-md transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0">
              {t('action.logout', 'Log out')}
            </span>
          </button>
        </div>
      </aside>

      {/* ── Contextual panel ── */}
      <AnimatePresence initial={false} mode="wait">
        {showPanel && (
          <motion.aside
            key={activeKey}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 216, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
            className="flex flex-col border-r border-glass bg-charcoal overflow-hidden"
          >
            <div className="flex h-full w-[216px] flex-col">
              {/* Panel header */}
              <div className="flex items-center justify-between gap-2 px-3 pt-4 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `rgb(${activeModule.accent} / 0.12)`, boxShadow: `inset 0 0 0 1px rgb(${activeModule.accent} / 0.30)` }}
                  >
                    <activeModule.icon className="h-4 w-4" style={{ color: `rgb(${activeModule.accent})` }} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary leading-tight">
                      {t(`nav.item.${navKey(activeModule.href)}`, activeModule.name)}
                    </p>
                    {activeModule.subtitle && (
                      <p className="truncate text-label text-text-muted leading-tight">{activeModule.subtitle}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={toggleCollapsed}
                  aria-label="Collapse panel"
                  className="shrink-0 p-1 rounded-md text-text-muted hover:bg-glass-hover hover:text-text-primary transition-colors"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </div>

              {/* Overview (command center) link */}
              <div className="px-2">
                <NavLink
                  to={activeModule.href}
                  end
                  className={({ isActive }) => cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-premium',
                    isActive ? 'bg-accent-soft text-text-primary' : 'text-text-secondary hover:bg-glass-hover hover:text-text-primary',
                  )}
                >
                  <LayoutGrid className="h-[16px] w-[16px] text-text-muted" />
                  <span>Overview</span>
                </NavLink>
              </div>

              <span className="mx-3 my-2 h-px bg-glass" aria-hidden="true" />

              {/* Sub-items */}
              <motion.nav
                className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-4 space-y-0.5"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.025 } } }}
              >
                {activeModule.items.map((item) => (
                  <motion.div key={item.href} variants={{ hidden: { opacity: 0, x: -6 }, show: { opacity: 1, x: 0 } }}>
                    {panelItem(item)}
                  </motion.div>
                ))}
              </motion.nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Re-open tab when collapsed (and the module has items) */}
      {collapsed && activeModule && activeModule.items.length > 0 && (
        <button
          onClick={toggleCollapsed}
          aria-label="Expand panel"
          className="flex w-6 items-center justify-center border-r border-glass bg-charcoal text-text-muted hover:text-text-primary hover:bg-glass-hover transition-colors"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
