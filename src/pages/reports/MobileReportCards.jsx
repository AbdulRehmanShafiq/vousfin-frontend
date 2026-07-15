import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useIncomeStatement, useBalanceSheet, useCashFlow } from '@/hooks/useReports'
import { usePeriodStore, PERIOD_PRESETS } from '@/stores/usePeriodStore'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { formatCompactCurrency } from '@/utils/formatters'
import MobilePage from '@/components/mobile/MobilePage'
import BooksAssurance from '@/components/reports/BooksAssurance'
import { cn } from '@/utils/cn'

/**
 * MobileReportCards — statements that read like messages (Mobile Easy §4.6).
 *
 * Three answer cards over the SAME report hooks and the SAME global period
 * the desktop statements use — set the period once, every card follows.
 * Each card drills to the full statement (?full=1 renders the desktop hub).
 */

function Row({ label, value, currency, strong, rule }) {
  return (
    <p className={cn('flex items-baseline justify-between gap-3 py-1', rule && `${rule} pt-2`)}>
      <span className={cn('text-sm', strong ? 'font-bold text-text-primary' : 'text-text-secondary')}>{label}</span>
      <span className={cn('num whitespace-nowrap text-sm', strong ? 'font-bold text-text-primary' : 'text-text-primary')}>
        {formatCompactCurrency(value ?? 0, currency)}
      </span>
    </p>
  )
}

function AnswerCard({ title, loading, children, to, toLabel }) {
  return (
    <div className="rounded-card border border-glass bg-glass-panel p-4">
      <p className="text-label uppercase tracking-wider text-text-muted mb-2">{title}</p>
      {loading ? (
        <div className="space-y-2 py-1">
          <div className="h-4 w-3/4 animate-pulse rounded bg-glass-hover" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-glass-hover" />
        </div>
      ) : children}
      <Link to={to} className="tap-target mt-2 flex items-center gap-1 text-sm font-semibold text-accent">
        {toLabel} <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </div>
  )
}

export default function MobileReportCards() {
  const { preset, range, setPreset } = usePeriodStore()
  const currency = useBusinessStore((s) => s.currency)
  const { search } = useLocation()
  const full = (path) => `${path}?full=1${search.includes('full') ? '' : ''}`

  const { data: pl, isLoading: plLoading } = useIncomeStatement(range)
  const { data: bs, isLoading: bsLoading } = useBalanceSheet({ endDate: range.endDate })
  const { data: cf, isLoading: cfLoading } = useCashFlow(range)

  const net = pl?.netIncome ?? pl?.netProfit ?? 0
  const cashChange = cf?.netCashFlow ?? cf?.netChange ?? ((cf?.endingCash ?? 0) - (cf?.beginningCash ?? 0))

  return (
    <MobilePage title="Reports" subtitle="Plain answers first — full statements one tap deeper">
      <div className="space-y-4 pb-4 pt-1">
        {/* Global period — the SAME store every statement reads */}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Report period">
          {PERIOD_PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              aria-pressed={preset === p.key}
              onClick={() => setPreset(p.key)}
              className={cn(
                'tap-target rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                preset === p.key ? 'border-accent/40 bg-accent-soft text-accent' : 'border-glass text-text-secondary',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Whether the books add up belongs on the phone too — this is the
            surface an owner actually looks at, and it is the reason to trust
            every number below it. */}
        <BooksAssurance />

        <AnswerCard title="How you did" loading={plLoading} to={full('/financial-reports/income-statement')} toLabel="See the full statement">
          <Row label="Money made" value={pl?.totalRevenue} currency={currency} />
          <Row label="Money spent" value={(pl?.totalRevenue ?? 0) - net} currency={currency} />
          <Row label={net >= 0 ? "What's left" : "What you're short"} value={net} currency={currency} strong rule="rule-total" />
        </AnswerCard>

        <AnswerCard title="Where you stand" loading={bsLoading} to={full('/financial-reports/balance-sheet')} toLabel="See the balance sheet">
          <Row label="You own" value={bs?.totalAssets} currency={currency} />
          <Row label="You owe" value={bs?.totalLiabilities} currency={currency} />
          <Row label="Yours" value={bs?.totalEquity} currency={currency} strong rule="rule-total" />
        </AnswerCard>

        <AnswerCard title="Cash movement" loading={cfLoading} to={full('/financial-reports/cash-flow')} toLabel="See the cash flow">
          <Row label="Change in cash" value={cashChange} currency={currency} strong />
        </AnswerCard>

        <Link
          to={full('/financial-reports/trial-balance')}
          className="tap-target flex items-center gap-2.5 rounded-card border border-glass px-4 py-3 text-sm font-semibold text-text-secondary hover:bg-glass-hover"
        >
          <span className="flex-1">All statements & exports</span>
          <ChevronRight className="h-4 w-4 text-text-muted" aria-hidden="true" />
        </Link>
      </div>
    </MobilePage>
  )
}
