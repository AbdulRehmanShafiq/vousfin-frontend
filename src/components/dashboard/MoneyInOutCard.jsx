/**
 * MoneyInOutCard — the plain-English "this month" summary for the dashboard.
 *
 * Three lines a non-accountant reads at a glance: money coming in, money going
 * out, and what's left. No jargon, no charts — the detail lives in Reports.
 */
import { Link } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight, Wallet, ExternalLink } from 'lucide-react'
import { formatCompactCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import Explain from '@/design-system/workflow/Explain'

export default function MoneyInOutCard({ income = 0, expenses = 0, net, currency, loading = false }) {
  const left = net != null ? net : income - expenses
  const negative = left < 0

  if (loading) {
    return (
      <div className="premium-card p-5" data-testid="money-inout-skeleton">
        <div className="h-4 w-28 rounded bg-glass-panel animate-pulse" />
        <div className="mt-4 space-y-3">
          <div className="h-12 rounded-xl bg-glass-panel animate-pulse" />
          <div className="h-12 rounded-xl bg-glass-panel animate-pulse" />
          <div className="h-12 rounded-xl bg-glass-panel animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="premium-card p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-[12.5px] font-bold uppercase tracking-widest text-text-muted">This month</h3>
          <p className="text-[12.5px] text-text-muted mt-0.5">Money coming in, going out, and what's left</p>
        </div>
        <Link to="/financial-reports/income-statement"
          className="flex items-center gap-1 text-[12.5px] text-cyan hover:underline font-medium shrink-0">
          See detail <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Money coming in */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-positive/[0.06] border border-positive/15 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-positive/15"><ArrowDownRight className="h-4 w-4 text-positive" /></div>
          <span className="text-sm font-medium text-text-secondary">Money coming in</span>
        </div>
        <span className="num text-base font-semibold text-positive">{formatCompactCurrency(income, currency)}</span>
      </div>

      {/* Money going out */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-amber/[0.06] border border-amber/15 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber/15"><ArrowUpRight className="h-4 w-4 text-amber" /></div>
          <span className="text-sm font-medium text-text-secondary">Money going out</span>
        </div>
        <span className="num text-base font-semibold text-text-primary">{formatCompactCurrency(expenses, currency)}</span>
      </div>

      {/* What's left */}
      <div className={cn(
        'flex items-center justify-between p-3 rounded-xl border',
        negative ? 'bg-negative/[0.06] border-negative/20' : 'bg-cyan/[0.06] border-cyan/20',
      )}>
        <div className="flex items-center gap-2.5">
          <div className={cn('p-1.5 rounded-lg', negative ? 'bg-negative/15' : 'bg-cyan/15')}>
            <Wallet className={cn('h-4 w-4', negative ? 'text-negative' : 'text-cyan')} />
          </div>
          <span className="text-sm font-semibold text-text-primary inline-flex items-center gap-0.5">
            {negative ? "What you're short" : "What's left"}
            <Explain
              title="What's left"
              rows={[
                { label: 'Money coming in', value: formatCompactCurrency(income, currency) },
                { label: '− money going out', value: formatCompactCurrency(expenses, currency) },
                { label: '= left', value: formatCompactCurrency(left, currency) },
              ]}
              note="Your income minus your expenses for this period, from the same ledger the reports read."
              to="/financial-reports/income-statement"
              toLabel="See the full statement"
            />
          </span>
        </div>
        <span
          data-testid="money-left"
          data-negative={negative ? 'true' : 'false'}
          className={cn('num text-base font-bold', negative ? 'text-negative' : 'text-text-primary')}
        >
          {formatCompactCurrency(Math.abs(left), currency)}
        </span>
      </div>
    </div>
  )
}
