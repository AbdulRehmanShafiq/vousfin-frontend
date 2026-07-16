/**
 * Dashboard — Phase 5.6 Step 3 (mobile-first)
 *
 * Mobile improvements:
 *  - Sticky quick actions bar (below header)
 *  - Collapsible sections (chevron toggle on every section)
 *  - Swipeable analytics cards (scroll-snap carousel on < md)
 *  - Mobile transaction bottom drawer
 *  - Touch-friendly spacing throughout
 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import dashboardService from '@/services/dashboard.service'
import {
  LayoutDashboard, Plus, Clock,
  TrendingUp, TrendingDown,
  ArrowDownRight, ArrowUpRight,
  FileText, CreditCard, Bell,
  ExternalLink, ChevronDown,
} from 'lucide-react'

import { useBusinessStore } from '@/stores/useBusinessStore'
import { useAuthStore }     from '@/stores/useAuthStore'
import { useUIStore }       from '@/stores/useUIStore'
import { useIsMobile }      from '@/hooks/useIsMobile'
import MobileHome from './MobileHome'
import PageHeader from '@/components/ui/PageHeader'
import { useTransactions }  from '@/hooks/useTransactions'
import { useDashboardAll }  from '@/hooks/useReports'
import { formatCompactCurrency, formatDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'

import CommandCenterWidget     from '@/components/dashboard/CommandCenterWidget'
import MoneyInOutCard          from '@/components/dashboard/MoneyInOutCard'
import SmartKPIStrip           from '@/components/dashboard/SmartKPIStrip'
import NeedsAttentionFeed      from '@/components/dashboard/NeedsAttentionFeed'
import BusinessHealthWidget    from '@/components/dashboard/BusinessHealthWidget'
import BusinessOutlookWidget   from '@/components/dashboard/BusinessOutlookWidget'
import ForecastWidget          from '@/components/dashboard/ForecastWidget'
import RevenueExpensesChart    from '@/components/dashboard/RevenueExpensesChart'
import CashFlowTrendChart      from '@/components/dashboard/CashFlowTrendChart'
import TaxPositionWidget       from '@/components/dashboard/TaxPositionWidget'
import SkeletonLoader          from '@/components/ui/SkeletonLoader'
import { isInflow as isInflowType } from '@/utils/transactionFlow'
import Explain from '@/design-system/workflow/Explain'
import { usePermissions } from '@/hooks/usePermissions'

/* ── helpers ──────────────────────────────────────────────────────── */
const isInflow = tx => isInflowType(tx.transactionType)

/* Thin alias → the single shared compact money formatter (utils/formatters). */
const fmtAmt = formatCompactCurrency

/* ── Collapsible Section divider ──────────────────────────────────── */
function Section({ label, to, children, collapsible = false, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-small font-bold uppercase tracking-widest text-text-muted">{label}</span>
        <div className="flex-1 h-px bg-glass" />
        {to && (
          <Link to={to} className="flex items-center gap-1 text-small text-accent hover:underline font-medium shrink-0">
            View all <ExternalLink className="h-3 w-3" />
          </Link>
        )}
        {collapsible && (
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="flex-shrink-0 p-1 rounded-md hover:bg-glass-hover transition-colors"
            aria-label={open ? 'Collapse section' : 'Expand section'}
          >
            <ChevronDown className={cn(
              'h-3.5 w-3.5 text-text-muted transition-transform duration-200',
              !open && '-rotate-90',
            )} />
          </button>
        )}
      </div>
      {(!collapsible || open) && (
        <div className="animate-collapse-down">
          {children}
        </div>
      )}
    </section>
  )
}

/* ── Transaction row ─────────────────────────────────────────────── */
function TxRow({ tx, currency }) {
  const inflow   = isInflow(tx)
  const isUnpaid = tx.paymentStatus === 'unpaid' || tx.paymentStatus === 'partial'

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-glass-hover transition-colors">
      <div className={cn(
        'p-2 rounded-lg flex-shrink-0',
        inflow ? 'bg-positive-muted text-positive' : 'bg-negative-muted text-negative',
      )}>
        {inflow ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate leading-tight">
          {tx.description}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-small text-text-muted">{formatDate(tx.transactionDate, 'MMM d')}</span>
          {tx.transactionType && (
            <span className="text-xs px-1.5 py-0.5 rounded-md bg-glass-panel text-text-muted capitalize">
              {tx.transactionType}
            </span>
          )}
          {isUnpaid && (
            <span className="text-xs px-1.5 py-0.5 rounded-md bg-highlight/15 text-highlight font-medium capitalize">
              {tx.paymentStatus}
            </span>
          )}
        </div>
      </div>

      <p className={cn(
        'num text-sm font-semibold flex-shrink-0',
        inflow ? 'text-positive' : 'text-text-primary',
      )}>
        {inflow ? '+' : '−'}{fmtAmt(tx.amount, currency)}
      </p>
    </div>
  )
}

/* ── Quick Actions — horizontal toolbar pills ────────────────────── */
/* Rendered right below the header greeting; uses explicit Tailwind    */
/* colour classes (CSS-var opacity modifiers break Tailwind JIT).      */
/* One smart row of real task shortcuts — no nav duplicates (those live in the
   rail / bottom bar). The first opens the universal Create modal. */
const ACTION_DEFS = [
  {
    label: 'Record something',
    Icon: Plus,
    action: 'modal',
    iconClass:    'bg-accent/15 text-accent',
    wrapperHover: 'hover:bg-accent/10 hover:border-accent/40',
    labelHover:   'group-hover:text-accent',
  },
  {
    label: 'Send an invoice',
    to: '/sales/invoices/new',
    Icon: FileText,
    iconClass:    'bg-accent/15 text-accent',
    wrapperHover: 'hover:bg-accent/10 hover:border-accent/40',
    labelHover:   'group-hover:text-accent',
  },
  {
    label: 'See who owes me',
    to: '/sales/receivables',
    Icon: Bell,
    iconClass:    'bg-highlight/15 text-highlight',
    wrapperHover: 'hover:bg-highlight/10 hover:border-highlight/40',
    labelHover:   'group-hover:text-highlight',
  },
  {
    label: 'See what I owe',
    to: '/purchases/payables',
    Icon: CreditCard,
    iconClass:    'bg-highlight/15 text-highlight',
    wrapperHover: 'hover:bg-highlight/10 hover:border-highlight/40',
    labelHover:   'group-hover:text-highlight',
  },
]

/* ── Module Shortcuts — the user's most-used modules, learned over time ── */
function ModuleShortcuts() {
  const { data: shortcuts = [] } = useQuery({
    queryKey: ['module-shortcuts'],
    queryFn: () => dashboardService.getModuleShortcuts().then((r) => r.data.data),
    staleTime: 60_000,
  })
  if (!shortcuts.length) return null
  return (
    <div className="mb-6">
      <p className="text-label font-bold uppercase tracking-widest text-text-muted mb-2">Jump back in</p>
      <div className="flex items-center gap-2 flex-wrap">
        {shortcuts.map((s) => (
          <Link key={s.moduleKey} to={s.path}
            className="group flex items-center gap-2 px-3.5 py-2 rounded-xl border border-glass hover:border-accent/35 hover:bg-glass-hover transition-all duration-150 active:scale-95">
            <span className="text-sm font-semibold text-text-primary">{s.label}</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-text-muted group-hover:text-accent transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}

function QuickActionsBar({ onNewTransaction }) {
  const pillBase = cn(
    'group flex items-center gap-2 px-4 py-2 rounded-xl border border-glass',
    'transition-all duration-150 active:scale-95 cursor-pointer',
  )

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {ACTION_DEFS.map(({ label, to, Icon, action, iconClass, wrapperHover, labelHover }) => {
        const content = (
          <>
            <div className={cn('p-1.5 rounded-lg transition-transform duration-150 group-hover:scale-110 flex-shrink-0', iconClass)}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <span className={cn('text-xs font-semibold text-text-secondary transition-colors whitespace-nowrap', labelHover)}>
              {label}
            </span>
          </>
        )

        if (action === 'modal') {
          return (
            <button key={label} type="button" onClick={onNewTransaction}
              className={cn(pillBase, wrapperHover)}>
              {content}
            </button>
          )
        }
        return (
          <Link key={label} to={to} className={cn(pillBase, wrapperHover)}>
            {content}
          </Link>
        )
      })}
    </div>
  )
}

/* ── Financial Snapshot (AR / AP unified) ────────────────────────── */
function FinancialSnapshot({ ar, ap, currency, loading }) {
  const total = ar + ap
  const arPct = total > 0 ? (ar / total) * 100 : 50

  return (
    <div className="premium-card p-5">
      <h3 className="text-small font-bold uppercase tracking-widest text-text-muted">
        Who owes what
      </h3>
      <p className="text-small text-text-muted mb-4 mt-0.5">Money owed to you, and money you owe</p>

      {loading ? (
        <div className="space-y-3">
          <div className="h-14 animate-pulse rounded-xl bg-glass-panel" />
          <div className="h-14 animate-pulse rounded-xl bg-glass-panel" />
        </div>
      ) : (
        <>
          {/* Receivable — money customers owe you */}
          <Link to="/sales/receivables" className="flex items-center justify-between mb-3 p-3 rounded-xl bg-accent/[0.06] border border-accent/15 hover:border-accent/35 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-accent/15">
                <ArrowDownRight className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-xs font-semibold text-accent uppercase tracking-wider">Money owed to you</p>
                <p className="num text-base font-semibold text-text-primary leading-tight">{fmtAmt(Math.abs(ar), currency)}</p>
                <p className="text-xs text-text-muted mt-0.5">Customers still owe you this <span className="opacity-60">· Accounts Receivable</span></p>
              </div>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-text-muted flex-shrink-0" />
          </Link>

          {/* Payable — money you owe vendors */}
          <Link to="/purchases/payables" className="flex items-center justify-between mb-4 p-3 rounded-xl bg-highlight/[0.06] border border-highlight/15 hover:border-highlight/35 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-highlight/15">
                <ArrowUpRight className="h-4 w-4 text-highlight" />
              </div>
              <div>
                <p className="text-xs font-semibold text-highlight uppercase tracking-wider">Money you owe</p>
                <p className="num text-base font-semibold text-text-primary leading-tight">{fmtAmt(Math.abs(ap), currency)}</p>
                <p className="text-xs text-text-muted mt-0.5">You still owe vendors this <span className="opacity-60">· Accounts Payable</span></p>
              </div>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-text-muted flex-shrink-0" />
          </Link>

          {/* Net exposure bar */}
          {total > 0 && (
            <div>
              <div className="flex justify-between text-xs text-text-muted mb-1.5">
                <span>Owed to you {arPct.toFixed(0)}%</span>
                <span>{(100 - arPct).toFixed(0)}% you owe</span>
              </div>
              <div className="h-1.5 rounded-full bg-glass-panel overflow-hidden flex">
                <div className="bg-accent rounded-l-full transition-all duration-700" style={{ width: `${arPct}%` }} />
                <div className="bg-highlight rounded-r-full flex-1" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ── Cash Hero — the one number that answers "am I OK?" ───────────── */
function CashHero({ cash, currency, loading }) {
  const positive = cash >= 0
  return (
    <div className="premium-card gold-hairline relative overflow-hidden p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-label font-bold uppercase tracking-widest text-text-muted inline-flex items-center gap-0.5">
            Cash on hand
            <Explain
              title="Cash on hand"
              rows={[{ label: 'Cash + bank balances', value: fmtAmt(cash, currency) }]}
              note="The current balance of every cash and bank account in your books, from the ledger."
              to="/accounts"
              toLabel="See the accounts"
            />
          </p>
          {loading ? (
            <div className="mt-2 h-10 w-48 animate-pulse rounded-lg bg-glass-panel" />
          ) : (
            <p className="num mt-1 font-display text-display font-semibold tracking-tight text-text-primary leading-none">
              {fmtAmt(cash, currency)}
            </p>
          )}
          <p className="mt-2 text-sm text-text-secondary">Money available across your accounts right now</p>
        </div>
        {!loading && (
          <span className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold',
            positive ? 'bg-positive-muted text-positive' : 'bg-negative-muted text-negative',
          )}>
            <span className={cn('h-1.5 w-1.5 rounded-full', positive ? 'bg-positive' : 'bg-negative')} />
            {positive ? 'Healthy balance' : 'Low balance'}
          </span>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { t }                        = useTranslation()
  const { user }                     = useAuthStore()
  const { currency, activeBusiness } = useBusinessStore()
  const openTxModal                  = useUIStore((s) => s.openTxModal)
  const isMobile                     = useIsMobile()

  const dateRange = useMemo(() => ({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate:   new Date().toISOString().split('T')[0],
  }), [])

  const { data: dashData, isLoading: loadDash } = useDashboardAll(dateRange)
  const { data: txData,   isLoading: loadTx   } = useTransactions({ limit: 6 })
  // Role-aware Today (Ledger §10.1): owners see the money answer first;
  // accountants/staff see their work queue first.
  const { roles, loaded: rolesLoaded } = usePermissions()
  const workFirst = rolesLoaded && roles.length > 0 && !roles.includes('owner')

  const recentTxs = Array.isArray(txData?.docs)         ? txData.docs
    : Array.isArray(txData?.transactions)               ? txData.transactions
    : Array.isArray(txData)                             ? txData
    : []

  const kpis              = dashData?.kpis            || {}
  const revenueVsExpenses = dashData?.revenueVsExpenses ?? []
  const cashFlowTrend     = dashData?.cashFlowTrend     ?? []

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = (user?.fullName || user?.name || 'there').split(' ')[0]

  // Mobile-First Redesign, pass 1 — a purpose-built phone screen, not the
  // desktop grid collapsed. All hooks above still ran (rules-of-hooks safe);
  // this is a plain conditional return.
  if (isMobile) return <MobileHome />

  return (
    <div className="animate-fade-in pb-10">

      {/* ── 1. HEADER ───────────────────────────────────────────── */}
      <PageHeader
        title={<>{greeting}, <span className="text-gradient">{firstName}</span></>}
        subtitle={
          <span className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-text-primary">
              {activeBusiness?.businessName || 'Your Business'}
            </span>
            <span className="text-text-muted">·</span>
            <span className="flex items-center gap-1.5 text-text-muted">
              <Clock className="h-3 w-3" />
              YTD {new Date().getFullYear()}
            </span>
          </span>
        }
      />

      {/* ── QUICK ACTIONS — fixed position in page, no sticky drift ── */}
      <div className="mb-6">
        <QuickActionsBar onNewTransaction={openTxModal} />
      </div>

      {/* ── YOUR SHORTCUTS — most-used modules, learned from how you work ── */}
      <ModuleShortcuts />

      <div className="space-y-7">

        {/* ── 1+2. THE ANSWER + THE WORK — order depends on who you are.
            Owner: "am I OK?" first. Accountant/staff: the queue first. ── */}
        {workFirst ? (
          <>
            <Section label={t('dashboard.needsAttention', 'What needs you')}>
              <div className="space-y-4">
                <CommandCenterWidget />
                <NeedsAttentionFeed />
              </div>
            </Section>
            <CashHero cash={kpis.cashBalance ?? 0} currency={currency} loading={loadDash} />
          </>
        ) : (
          <>
            <CashHero cash={kpis.cashBalance ?? 0} currency={currency} loading={loadDash} />
            <Section label={t('dashboard.needsAttention', 'What needs you')}>
              <div className="space-y-4">
                <CommandCenterWidget />
                <NeedsAttentionFeed />
              </div>
            </Section>
          </>
        )}

        {/* ── 3. THIS MONTH — plain money in / out / left ──────────── */}
        <Section label={t('dashboard.thisMonth', 'This month')}>
          <MoneyInOutCard
            income={kpis.revenue ?? 0}
            expenses={kpis.expenses ?? 0}
            net={kpis.netProfit}
            currency={currency}
            loading={loadDash}
          />
        </Section>

        {/* ── 4. MORE DETAIL — everything else, calm & collapsed ───── */}
        {/* One tap opens the full picture: your numbers, how the business is
            doing, charts, and what's coming. Nothing is removed — just tucked
            away so the essentials lead the page. */}
        <Section label={t('dashboard.moreDetail', 'More detail')} collapsible defaultOpen={false}>
          <div className="space-y-7">

            {/* Your numbers */}
            <Section label={t('dashboard.keyMetrics', 'Your numbers')}>
              <SmartKPIStrip
                kpis={kpis}
                revenueVsExpenses={revenueVsExpenses}
                loading={loadDash}
                currency={currency}
              />
            </Section>

            {/* How your business is doing */}
            <Section label={t('dashboard.businessIntelligence', 'How your business is doing')}>
              <div className="space-y-4">
                <TaxPositionWidget />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <BusinessHealthWidget kpis={kpis} loading={loadDash} />
                  <BusinessOutlookWidget horizon={6} />
                </div>
              </div>
            </Section>

            {/* Charts. This component returns <MobileHome /> below the `lg`
                breakpoint, so everything here is desktop by definition — there
                was a `md:hidden` swipe carousel of these same two charts that
                could never render at any width, and it is gone. Phones get the
                Home sparkline instead. */}
            <Section label={t('dashboard.businessAnalytics', 'Charts')}>
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-3">
                  <RevenueExpensesChart data={revenueVsExpenses} loading={loadDash} currency={currency} />
                </div>
                <div className="col-span-2">
                  <CashFlowTrendChart   data={cashFlowTrend}     loading={loadDash} currency={currency} />
                </div>
              </div>
            </Section>

            {/* What's coming — who owes / you owe + forecast */}
            <Section label={t('dashboard.forecastingCash', "What's coming")}>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <FinancialSnapshot
                    ar={kpis.accountsReceivable ?? 0}
                    ap={kpis.accountsPayable    ?? 0}
                    currency={currency}
                    loading={loadDash}
                  />
                </div>
                <div className="lg:col-span-3">
                  <ForecastWidget />
                </div>
              </div>
            </Section>

          </div>
        </Section>

        {/* ── 6. RECENT ACTIVITY ──────────────────────────────────── */}
        <Section label={t('dashboard.recentActivity', 'Recent Activity')} to="/transactions">
          <div className="grid grid-cols-1 gap-4 items-start">

            {/* Transactions card — full width now that snapshot moved up */}
            <div className="premium-card overflow-hidden">
              <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-glass">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Recent Transactions</h3>
                  <p className="text-small text-text-muted mt-0.5">Last entries</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link to="/transactions"
                    className="flex items-center gap-1 text-small text-accent hover:underline font-medium">
                    View all <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              <div className="p-3">
                {loadTx ? (
                  <SkeletonLoader count={3} />
                ) : recentTxs.length === 0 ? (
                  <div className="py-8 text-center">
                    <LayoutDashboard className="h-7 w-7 text-text-muted mx-auto mb-2.5 opacity-40" />
                    <p className="text-sm text-text-muted mb-2">No transactions yet</p>
                    <button
                      onClick={openTxModal}
                      className="inline-flex items-center gap-1.5 text-sm text-accent font-semibold hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Record your first transaction
                    </button>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {recentTxs.slice(0, 6).map(tx => (
                      <TxRow key={tx._id} tx={tx} currency={currency} />
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </Section>

      </div>{/* end space-y-7 */}

      {/* The mobile transaction bottom drawer that used to live here is gone:
          it was `lg:hidden`, and this component returns <MobileHome /> below
          `lg`, so it could only ever have appeared in the 768–1023 band where
          the desktop page rendered under the mobile bar. That band is fixed;
          phones get MobileTransactions. */}
    </div>
  )
}
