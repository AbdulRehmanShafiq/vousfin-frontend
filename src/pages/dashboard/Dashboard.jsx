/**
 * Dashboard — Phase 5.6 refined layout
 *
 * Visual hierarchy (top → bottom):
 *   1. Header       — greeting + business + New Transaction CTA
 *   2. KPI Strip    — 4 primary cards + 4 secondary chips
 *   3. Analytics    — Revenue vs Expenses | Cash Flow Trend
 *   4. AI Insights  — anomaly / risk analysis panel (full-width)
 *   5. Forecasting  — embedded LSTM engine
 *   6. Workspace    — recent transactions (left) + financial snapshot (right)
 */
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, Plus, Clock,
  TrendingUp, TrendingDown,
  ArrowDownRight, ArrowUpRight,
  BarChart2, CalendarDays, BookOpen,
  Cpu, ExternalLink,
} from 'lucide-react'

import { useBusinessStore } from '@/stores/useBusinessStore'
import { useAuthStore }     from '@/stores/useAuthStore'
import { useTransactions }  from '@/hooks/useTransactions'
import { useDashboardAll }  from '@/hooks/useReports'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'

import SmartKPIStrip        from '@/components/dashboard/SmartKPIStrip'
import AIInsightsPanel      from '@/components/dashboard/AIInsightsPanel'
import ForecastWidget       from '@/components/dashboard/ForecastWidget'
import RevenueExpensesChart from '@/components/dashboard/RevenueExpensesChart'
import CashFlowTrendChart   from '@/components/dashboard/CashFlowTrendChart'
import SkeletonLoader       from '@/components/ui/SkeletonLoader'
import Button               from '@/components/ui/Button'

/* ── constants ────────────────────────────────────────────────────── */
const INFLOW_TYPES = new Set([
  'income', 'cash sale', 'credit sale', 'payment received',
  'revenue', 'sales', 'sale',
])
const isInflow = tx => INFLOW_TYPES.has((tx.transactionType || '').toLowerCase())

/* ── compact amount formatter (K / M) ────────────────────────────── */
function fmtAmt(val, currency = 'PKR') {
  const sym = currency === 'PKR' ? 'Rs' : currency === 'USD' ? '$' : currency
  const abs = Math.abs(val)
  const sign = val < 0 ? '−' : ''
  if (abs >= 1_000_000) return `${sign}${sym} ${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000)     return `${sign}${sym} ${(abs / 1_000).toFixed(0)}K`
  return formatCurrency(val, currency)
}

/* ── Section divider label ────────────────────────────────────────── */
function Section({ label, to, children }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted">{label}</span>
        <div className="flex-1 h-px bg-glass" />
        {to && (
          <Link to={to} className="flex items-center gap-1 text-[11px] text-cyan hover:underline font-medium shrink-0">
            View all <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

/* ── Transaction row ─────────────────────────────────────────────── */
function TxRow({ tx, currency }) {
  const inflow  = isInflow(tx)
  const type    = tx.transactionType || 'Transaction'
  const isUnpaid = tx.paymentStatus === 'unpaid' || tx.paymentStatus === 'partial'

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-glass-hover transition-colors group">
      {/* colour-coded icon */}
      <div className={cn(
        'p-2 rounded-lg flex-shrink-0',
        inflow ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400',
      )}>
        {inflow
          ? <TrendingUp   className="h-3.5 w-3.5" />
          : <TrendingDown className="h-3.5 w-3.5" />}
      </div>

      {/* description + date */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate leading-tight">
          {tx.description}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-text-muted">{formatDate(tx.transactionDate, 'MMM d')}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-glass-panel text-text-muted capitalize truncate max-w-[120px]">
            {type}
          </span>
          {isUnpaid && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-400/15 text-amber-300 font-medium capitalize">
              {tx.paymentStatus}
            </span>
          )}
        </div>
      </div>

      {/* amount */}
      <p className={cn(
        'text-sm font-bold flex-shrink-0 tabular-nums',
        inflow ? 'text-emerald-400' : 'text-text-primary',
      )}>
        {inflow ? '+' : '−'}{fmtAmt(tx.amount, currency)}
      </p>
    </div>
  )
}

/* ── Financial Snapshot (AR/AP unified) ──────────────────────────── */
function FinancialSnapshot({ ar, ap, currency, loading }) {
  const total    = ar + ap
  const arPct    = total > 0 ? (ar / total) * 100 : 50

  return (
    <div className="premium-card p-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">
        Financial Position
      </h3>

      {loading ? (
        <div className="space-y-3">
          <div className="h-14 animate-pulse rounded-xl bg-glass-panel" />
          <div className="h-14 animate-pulse rounded-xl bg-glass-panel" />
        </div>
      ) : (
        <>
          {/* AR */}
          <div className="flex items-center justify-between mb-3 p-3 rounded-xl bg-violet-500/8 border border-violet-500/15">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-violet-500/20">
                <ArrowDownRight className="h-4 w-4 text-violet-400" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">Receivable</p>
                <p className="text-base font-black text-text-primary leading-tight">{fmtAmt(ar, currency)}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-violet-300 bg-violet-400/15 px-2 py-0.5 rounded-full">
              Due
            </span>
          </div>

          {/* AP */}
          <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-orange-500/8 border border-orange-500/15">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-orange-500/20">
                <ArrowUpRight className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider">Payable</p>
                <p className="text-base font-black text-text-primary leading-tight">{fmtAmt(ap, currency)}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-orange-300 bg-orange-400/15 px-2 py-0.5 rounded-full">
              Owed
            </span>
          </div>

          {/* Net exposure bar */}
          {total > 0 && (
            <div>
              <div className="flex justify-between text-[10px] text-text-muted mb-1.5">
                <span>AR {arPct.toFixed(0)}%</span>
                <span>AP {(100 - arPct).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-glass-panel overflow-hidden flex">
                <div className="bg-violet-400 rounded-l-full transition-all duration-700" style={{ width: `${arPct}%` }} />
                <div className="bg-orange-400 rounded-r-full flex-1" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ── Quick Actions ───────────────────────────────────────────────── */
function QuickActions() {
  const ACTIONS = [
    { label: 'New Transaction', to: '/transactions', Icon: Plus,          color: '#06b6d4' },
    { label: 'Reports',         to: '/reports',      Icon: BarChart2,     color: '#a78bfa' },
    { label: 'AI Forecast',     to: '/ai/forecast',  Icon: Cpu,           color: '#34d399' },
    { label: 'Journal',         to: '/journal',      Icon: BookOpen,      color: '#fb923c' },
  ]
  return (
    <div className="premium-card p-4">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map(({ label, to, Icon, color }) => (
          <Link key={label} to={to}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-glass
                       hover:border-[var(--ac)]/40 hover:bg-[var(--ac)]/6 transition-all text-center group"
            style={{ '--ac': color }}
          >
            <div className="p-2 rounded-lg transition-all" style={{ background: color + '18' }}>
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <span className="text-[11px] font-semibold text-text-secondary group-hover:text-text-primary transition-colors leading-tight">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════ */
/*  Dashboard                                                        */
/* ══════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { user }                     = useAuthStore()
  const { currency, activeBusiness } = useBusinessStore()

  const dateRange = useMemo(() => ({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate:   new Date().toISOString().split('T')[0],
  }), [])

  const { data: dashData, isLoading: loadDash } = useDashboardAll(dateRange)
  const { data: txData,   isLoading: loadTx   } = useTransactions({ limit: 6 })

  const recentTxs = Array.isArray(txData?.docs)          ? txData.docs
    : Array.isArray(txData?.transactions)                 ? txData.transactions
    : Array.isArray(txData)                               ? txData
    : []

  const kpis              = dashData?.kpis            || {}
  const revenueVsExpenses = dashData?.revenueVsExpenses ?? []
  const cashFlowTrend     = dashData?.cashFlowTrend     ?? []

  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = (user?.fullName || user?.name || 'there').split(' ')[0]

  return (
    <div className="space-y-7 animate-fade-in pb-10">

      {/* ── 1. HEADER ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">
            {greeting}, <span className="text-cyan">{firstName}</span> 👋
          </h1>
          <p className="text-sm text-text-secondary mt-1 flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-text-primary">
              {activeBusiness?.businessName || 'Your Business'}
            </span>
            <span className="text-text-muted">·</span>
            <span className="flex items-center gap-1.5 text-text-muted">
              <Clock className="h-3.5 w-3.5" />
              YTD {new Date().getFullYear()} snapshot
            </span>
          </p>
        </div>
        <Link to="/transactions">
          <Button size="sm" className="flex items-center gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            New Transaction
          </Button>
        </Link>
      </div>

      {/* ── 2. KPI STRIP ────────────────────────────────────────── */}
      <Section label="Key Metrics">
        <SmartKPIStrip
          kpis={kpis}
          revenueVsExpenses={revenueVsExpenses}
          loading={loadDash}
          currency={currency}
        />
      </Section>

      {/* ── 3. ANALYTICS ────────────────────────────────────────── */}
      <Section label="Business Analytics">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {/* Revenue vs Expenses gets more width */}
          <div className="xl:col-span-3">
            <RevenueExpensesChart
              data={revenueVsExpenses}
              loading={loadDash}
              currency={currency}
            />
          </div>
          {/* Cash Flow on the right */}
          <div className="xl:col-span-2">
            <CashFlowTrendChart
              data={cashFlowTrend}
              loading={loadDash}
              currency={currency}
            />
          </div>
        </div>
      </Section>

      {/* ── 4. AI INSIGHTS ──────────────────────────────────────── */}
      <Section label="AI Financial Intelligence">
        <AIInsightsPanel />
      </Section>

      {/* ── 5. FORECASTING ──────────────────────────────────────── */}
      <Section label="AI Forecasting Engine">
        <ForecastWidget />
      </Section>

      {/* ── 6. WORKSPACE ────────────────────────────────────────── */}
      <Section label="Recent Activity" to="/transactions">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left: Recent Transactions */}
          <div className="lg:col-span-2 premium-card overflow-hidden">
            {/* card header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-glass">
              <div>
                <h3 className="text-sm font-bold text-text-primary">Recent Transactions</h3>
                <p className="text-[11px] text-text-muted mt-0.5">Last 6 entries</p>
              </div>
              <Link to="/transactions"
                className="flex items-center gap-1 text-[11px] text-cyan hover:underline font-medium">
                View all <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            {/* rows */}
            <div className="p-3">
              {loadTx ? (
                <SkeletonLoader count={4} />
              ) : recentTxs.length === 0 ? (
                <div className="py-10 text-center">
                  <LayoutDashboard className="h-8 w-8 text-text-muted mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-text-muted mb-2">No transactions yet</p>
                  <Link to="/transactions"
                    className="inline-flex items-center gap-1.5 text-sm text-cyan font-semibold hover:underline">
                    <Plus className="h-3.5 w-3.5" />
                    Record your first transaction
                  </Link>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {recentTxs.map(tx => (
                    <TxRow key={tx._id} tx={tx} currency={currency} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Financial Snapshot + Quick Actions */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <FinancialSnapshot
              ar={kpis.accountsReceivable ?? 0}
              ap={kpis.accountsPayable    ?? 0}
              currency={currency}
              loading={loadDash}
            />
            <QuickActions />
          </div>

        </div>
      </Section>

    </div>
  )
}
