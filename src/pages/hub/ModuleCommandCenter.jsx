import { useMemo } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Plus } from 'lucide-react'
import { moduleByKey, activeModuleKey, navKey } from '@/components/layout/nav.config'
import { useDashboardAll } from '@/hooks/useReports'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { useUIStore } from '@/stores/useUIStore'
import approvalService from '@/services/approval.service'
import { formatCompactCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'

/*
 * ModuleCommandCenter — the landing "dashboard" for each module.
 *
 * Driven entirely by nav.config: a hero (icon + name + plain subtitle +
 * accounting tag) → quick actions → live stat cards (cheap, from caches the
 * dashboard/rail already populate) → a "Go to" grid of the module's sub-items.
 * Replaces the old SectionHubPage. The module is derived from the URL.
 */

/* Per-module quick actions. `modal` opens the universal Create modal. */
const ACTIONS = {
  sales: [
    { label: 'New Invoice', to: '/sales/invoices/new', icon: Plus },
    { label: 'Chase Payment', to: '/sales/receivables' },
    { label: 'Add Customer', to: '/customers' },
  ],
  purchases: [
    { label: 'New Bill', to: '/purchases/bills/new', icon: Plus },
    { label: 'New Purchase Order', to: '/procurement/purchase-orders/new' },
    { label: 'Pay a Bill', to: '/purchases/payables' },
  ],
  banking: [
    { label: 'Reconcile', to: '/reconciliation/bank' },
    { label: 'Review Queue', to: '/ai/review-queue' },
    { label: 'Record Transaction', action: 'modal', icon: Plus },
  ],
  accounting: [
    { label: 'New Entry', action: 'modal', icon: Plus },
    { label: 'Approvals', to: '/approvals' },
    { label: 'Chart of Accounts', to: '/accounts' },
  ],
  reports: [
    { label: 'Open P&L', to: '/financial-reports/income-statement' },
    { label: 'Build a Report', to: '/financial-reports/builder' },
  ],
  payroll: [
    { label: 'Run Payroll', to: '/payroll/run', icon: Plus },
    { label: 'Employees', to: '/payroll/employees' },
  ],
  planning: [
    { label: 'Forecast', to: '/ai-analyst/forecast' },
    { label: 'Edit Budget', to: '/budgets/editor' },
    { label: 'Ask AI', to: '/ai/assistant' },
  ],
  compliance: [
    { label: 'Tax Autopilot', to: '/tax' },
    { label: 'Calendar', to: '/compliance/calendar' },
  ],
  settings: [
    { label: 'Business Profile', to: '/business/settings' },
    { label: 'Invite Team', to: '/settings/team' },
  ],
}

function QuickActions({ moduleKey, onModal }) {
  const actions = ACTIONS[moduleKey] || []
  if (!actions.length) return null
  return (
    <div className="mb-7 flex flex-wrap items-center gap-2">
      {actions.map((a) => {
        const Icon = a.icon
        const content = (
          <>
            {Icon && <Icon className="h-3.5 w-3.5" />}
            <span>{a.label}</span>
          </>
        )
        const base = 'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all active:scale-95'
        if (a.action === 'modal') {
          return (
            <button key={a.label} type="button" onClick={onModal}
              className={cn(base, 'border-transparent btn-gradient')}>
              {content}
            </button>
          )
        }
        return (
          <Link key={a.label} to={a.to}
            className={cn(base, 'border-glass text-text-secondary hover:border-glass-2 hover:bg-glass-hover hover:text-text-primary')}>
            {content}
          </Link>
        )
      })}
    </div>
  )
}

function StatCard({ value, label, tint }) {
  return (
    <div className="premium-card p-4">
      <p className="num text-xl font-semibold" style={{ color: tint || 'var(--text)' }}>{value}</p>
      <p className="mt-0.5 text-xs text-text-muted">{label}</p>
    </div>
  )
}

function ModuleCard({ item, accent, index }) {
  const { t } = useTranslation()
  return (
    <Link
      to={item.href}
      style={{ animationDelay: `${index * 45}ms` }}
      className="group relative flex flex-col rounded-2xl border border-glass bg-navy-2 p-5 overflow-hidden transition-all duration-200 animate-fade-in hover:-translate-y-0.5"
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgb(${accent} / 0.53), transparent)` }} />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(420px 160px at 50% -40%, rgb(${accent} / 0.08), transparent 70%)` }} />
      <div className="relative flex items-start justify-between mb-3.5">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
          style={{ background: `rgb(${accent} / 0.10)`, boxShadow: `inset 0 0 0 1px rgb(${accent} / 0.20)` }}>
          <item.icon className="h-[21px] w-[21px]" style={{ color: `rgb(${accent})` }} />
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-glass text-text-muted transition-all duration-200 group-hover:border-glass-2 group-hover:text-text-primary group-hover:translate-x-0.5">
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
      <h3 className="relative text-md font-semibold text-text-primary leading-tight">{t(`nav.item.${navKey(item.href)}`, item.name)}</h3>
      {item.desc && <p className="relative mt-1 text-xs leading-snug text-text-muted">{item.desc}</p>}
    </Link>
  )
}

export default function ModuleCommandCenter() {
  const { t } = useTranslation()
  const location = useLocation()
  const currency = useBusinessStore((s) => s.currency)
  const openTxModal = useUIStore((s) => s.openTxModal)

  const moduleKey = activeModuleKey(location.pathname)
  const module = moduleByKey(moduleKey)

  const needsFinance = !!module?.items.some((i) => i.statKey === 'receivable' || i.statKey === 'payable')
  const needsApprovals = !!module?.items.some((i) => i.statKey === 'approvals')

  const dateRange = useMemo(() => ({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  }), [])

  const { data: dashData } = useDashboardAll(dateRange, { enabled: needsFinance })
  const { data: approvalsPending = 0 } = useQuery({
    queryKey: ['approvals-count'],
    queryFn: () => approvalService.count().then((r) => r.data.data?.pending ?? 0),
    staleTime: 30_000, retry: false, enabled: needsApprovals,
  })

  if (!module || module.key === 'home') return <Navigate to="/dashboard" replace />

  const accent = module.accent
  const accentColor = `rgb(${accent})`
  const kpis = dashData?.kpis || {}

  const stats = module.items
    .filter((i) => i.statKey)
    .map((i) => {
      switch (i.statKey) {
        case 'receivable': return { key: i.href, value: formatCompactCurrency(kpis.accountsReceivable ?? 0, currency), label: 'Receivable — owed to you', tint: accentColor }
        case 'payable': return { key: i.href, value: formatCompactCurrency(kpis.accountsPayable ?? 0, currency), label: 'Payable — you owe', tint: accentColor }
        case 'approvals': return { key: i.href, value: String(approvalsPending), label: approvalsPending > 0 ? 'awaiting sign-off' : 'all clear', tint: approvalsPending > 0 ? 'rgb(var(--c-status-warning))' : undefined }
        default: return null
      }
    })
    .filter(Boolean)

  // Primary items first, then the rest
  const ordered = [...module.items].sort((a, b) => (b.primary ? 1 : 0) - (a.primary ? 1 : 0))

  return (
    <div className="animate-fade-in pb-10">
      {/* Hero */}
      <div className="mb-6 max-w-2xl">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="h-px w-7" style={{ background: `rgb(${accent} / 0.60)` }} aria-hidden="true" />
          <span className="text-label font-semibold uppercase tracking-[0.18em]" style={{ color: accentColor }}>
            {module.tag || module.subtitle}
          </span>
        </div>
        <div className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: `rgb(${accent} / 0.10)`, boxShadow: `inset 0 0 0 1px rgb(${accent} / 0.20)` }}>
            <module.icon className="h-6 w-6" style={{ color: accentColor }} />
          </span>
          <h1 className="font-display text-display font-semibold tracking-tight text-text-primary leading-none">
            {t(`nav.item.${navKey(module.href)}`, module.name)}
          </h1>
        </div>
        <p className="mt-4 text-md leading-relaxed text-text-secondary">{module.subtitle}</p>
      </div>

      {/* Quick actions */}
      <QuickActions moduleKey={module.key} onModal={openTxModal} />

      {/* Stat cards */}
      {stats.length > 0 && (
        <div className="mb-7 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s) => <StatCard key={s.key} value={s.value} label={s.label} tint={s.tint} />)}
        </div>
      )}

      {/* Go to — sub-module grid */}
      <h2 className="mb-3 text-label font-bold uppercase tracking-widest text-text-muted">Go to</h2>
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
        {ordered.map((item, i) => (
          <ModuleCard key={item.href} item={item} accent={accent} index={i} />
        ))}
      </div>
    </div>
  )
}
