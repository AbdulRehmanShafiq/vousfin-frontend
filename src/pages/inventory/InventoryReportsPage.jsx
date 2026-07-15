/**
 * InventoryReportsPage — the six stock reports (inventory engine phase 10).
 *
 * Every number here is derived from the stock ledger, so these pages can never
 * disagree with the books. Each report answers one question an owner actually
 * asks, and says it in their words.
 */
import { useState } from 'react'
import {
  Boxes, TrendingUp, Clock, Percent, Snail, CalendarClock,
} from 'lucide-react'
import { useInventoryReport } from '@/hooks/useInventory'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { usePeriodStore, PERIOD_PRESETS } from '@/stores/usePeriodStore'
import { formatCurrency, formatDate } from '@/utils/formatters'
import SmartTable from '@/design-system/data/SmartTable'
import SkeletonLoader from '@/components/ui/SkeletonLoader'
import { cn } from '@/utils/cn'

const TABS = [
  { key: 'valuation',  label: 'What it’s worth',  icon: Boxes,         needsPeriod: false },
  { key: 'turnover',   label: 'How fast it sells', icon: TrendingUp,   needsPeriod: true },
  { key: 'aging',      label: 'How long it sits',  icon: Clock,        needsPeriod: false },
  { key: 'margin',     label: 'What it earns',     icon: Percent,      needsPeriod: true },
  { key: 'slowMovers', label: 'Not selling',       icon: Snail,        needsPeriod: false },
  { key: 'expiring',   label: 'Expiring soon',     icon: CalendarClock, needsPeriod: false },
]

/* One headline number, said plainly. */
function Stat({ label, value, tone = 'default', hint }) {
  return (
    <div className="premium-card p-4">
      <p className="text-xs uppercase tracking-wider text-text-muted">{label}</p>
      <p className={cn('num mt-1 text-xl font-black',
        tone === 'positive' ? 'text-positive' : tone === 'warn' ? 'text-highlight' : 'text-text-primary')}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-text-muted">{hint}</p>}
    </div>
  )
}

export default function InventoryReportsPage() {
  const currency = useBusinessStore((s) => s.currency)
  const { preset, range, setPreset } = usePeriodStore()
  const [tab, setTab] = useState('valuation')

  const active = TABS.find((t) => t.key === tab)
  const params = active?.needsPeriod ? { startDate: range.startDate, endDate: range.endDate } : {}
  const { data, isLoading, isError } = useInventoryReport(tab, params)

  const money = (v) => formatCurrency(v || 0, currency)

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight text-text-primary">
          <Boxes className="h-6 w-6 text-accent" />
          Stock reports
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          What your stock is worth, how fast it sells, and where your money is stuck.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-glass bg-glass-panel p-1 scrollbar-none">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
            className={cn(
              'flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-small font-semibold transition-colors',
              tab === t.key ? 'bg-accent text-ink-on-accent' : 'text-text-secondary hover:bg-glass-hover hover:text-text-primary',
            )}
          >
            <t.icon className="h-4 w-4" aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Period — only for the reports that cover a stretch of time */}
      {active?.needsPeriod && (
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Report period">
          <span className="mr-1 text-label uppercase tracking-wider text-text-muted">Period</span>
          {PERIOD_PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPreset(p.key)}
              aria-pressed={preset === p.key}
              className={cn('rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                preset === p.key ? 'border-accent/40 bg-accent-soft text-accent'
                  : 'border-glass text-text-secondary hover:bg-glass-hover hover:text-text-primary')}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {isLoading && <SkeletonLoader count={5} />}
      {isError && !isLoading && (
        <p className="rounded-card border border-negative/25 bg-negative/5 p-4 text-sm text-negative">
          Could not load this report. Try again in a moment.
        </p>
      )}

      {!isLoading && !isError && data && (
        <>
          {tab === 'valuation' && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Stat label="Total stock value" value={money(data.totalValue)} hint={`as at ${formatDate(data.asOf)}`} />
                <Stat label="Items in stock" value={data.itemCount} />
              </div>
              <div className="premium-card overflow-x-auto">
                <SmartTable
                  data={data.lines}
                  getRowKey={(r) => r.itemId}
                  emptyMessage="Nothing in stock yet."
                  columns={[
                    { key: 'name', header: 'Item', mobile: 'title' },
                    { key: 'sku', header: 'Code', render: (r) => r.sku || '—', mobile: 'hide' },
                    { key: 'qty', header: 'On hand', align: 'right', render: (r) => `${r.qty} ${r.unit}`, mobile: 'subtitle' },
                    { key: 'unitCost', header: 'Each', type: 'money', render: (r) => money(r.unitCost), mobile: 'hide' },
                    { key: 'value', header: 'Worth', type: 'money', render: (r) => money(r.value), mobile: 'trailing' },
                  ]}
                />
              </div>
            </>
          )}

          {tab === 'turnover' && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Stat label="Cost of what sold" value={money(data.totalCogs)} />
                <Stat label="Average stock held" value={money(data.averageStockValue)} />
                <Stat label="Sold through" value={`${data.turns}×`}
                  hint={data.daysOnHand ? `about ${data.daysOnHand} days on the shelf` : 'nothing sold in this period'} />
              </div>
              <div className="premium-card overflow-x-auto">
                <SmartTable
                  data={data.lines}
                  getRowKey={(r) => r.itemId}
                  emptyMessage="Nothing sold in this period."
                  columns={[
                    { key: 'name', header: 'Item', mobile: 'title' },
                    { key: 'qtySold', header: 'Sold', align: 'right', mobile: 'subtitle' },
                    { key: 'cogs', header: 'Cost of sales', type: 'money', render: (r) => money(r.cogs) },
                    { key: 'averageValue', header: 'Avg held', type: 'money', render: (r) => money(r.averageValue), mobile: 'hide' },
                    { key: 'turns', header: 'Times sold', align: 'right', render: (r) => `${r.turns}×`, mobile: 'trailing' },
                    { key: 'daysOnHand', header: 'Days on shelf', align: 'right', render: (r) => r.daysOnHand ?? '—', mobile: 'hide' },
                  ]}
                />
              </div>
            </>
          )}

          {tab === 'aging' && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {data.labels.map((l, i) => (
                  <Stat key={l} label={l} value={money(data.totals[i])}
                    tone={i >= data.labels.length - 2 ? 'warn' : 'default'} />
                ))}
              </div>
              <div className="premium-card overflow-x-auto">
                <SmartTable
                  data={data.lines}
                  getRowKey={(r) => r.itemId}
                  emptyMessage="Nothing in stock yet."
                  columns={[
                    { key: 'name', header: 'Item', mobile: 'title' },
                    { key: 'qty', header: 'On hand', align: 'right', mobile: 'subtitle' },
                    ...data.labels.map((l, i) => ({
                      key: `b${i}`, header: l, align: 'right',
                      render: (r) => money(r.buckets[i]), mobile: 'hide',
                    })),
                    { key: 'value', header: 'Worth', type: 'money', render: (r) => money(r.value), mobile: 'trailing' },
                  ]}
                />
              </div>
            </>
          )}

          {tab === 'margin' && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <Stat label="Sales" value={money(data.revenue)} />
                <Stat label="Cost of those sales" value={money(data.cogs)} />
                <Stat label="Profit" value={money(data.profit)} tone={data.profit >= 0 ? 'positive' : 'warn'} />
                <Stat label="Margin" value={`${data.marginPct}%`} tone={data.marginPct >= 0 ? 'positive' : 'warn'} />
              </div>
              <div className="premium-card overflow-x-auto">
                <SmartTable
                  data={data.lines}
                  getRowKey={(r) => r.itemId}
                  emptyMessage="No stock sold on an invoice in this period."
                  columns={[
                    { key: 'name', header: 'Item', mobile: 'title' },
                    { key: 'qtySold', header: 'Sold', align: 'right', mobile: 'subtitle' },
                    { key: 'revenue', header: 'Sales', type: 'money', render: (r) => money(r.revenue) },
                    { key: 'cogs', header: 'Cost', type: 'money', render: (r) => money(r.cogs), mobile: 'hide' },
                    { key: 'profit', header: 'Profit', type: 'money', mobile: 'trailing',
                      render: (r) => <span className={r.profit >= 0 ? 'text-positive' : 'text-negative'}>{money(r.profit)}</span> },
                    { key: 'marginPct', header: 'Margin', align: 'right', render: (r) => `${r.marginPct}%`, mobile: 'hide' },
                  ]}
                />
              </div>
            </>
          )}

          {tab === 'slowMovers' && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Stat label="Money stuck in stock" value={money(data.tiedUpValue)} tone="warn"
                  hint={`nothing sold in ${data.days} days`} />
                <Stat label="Items not moving" value={data.itemCount} />
              </div>
              <div className="premium-card overflow-x-auto">
                <SmartTable
                  data={data.lines}
                  getRowKey={(r) => r.itemId}
                  emptyMessage="Everything has sold recently — nothing sitting still."
                  columns={[
                    { key: 'name', header: 'Item', mobile: 'title' },
                    { key: 'sku', header: 'Code', render: (r) => r.sku || '—', mobile: 'hide' },
                    { key: 'qty', header: 'On hand', align: 'right', render: (r) => `${r.qty} ${r.unit || ''}`, mobile: 'subtitle' },
                    { key: 'value', header: 'Money stuck', type: 'money', render: (r) => money(r.value), mobile: 'trailing' },
                  ]}
                />
              </div>
            </>
          )}

          {tab === 'expiring' && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Stat label="Value at risk" value={money(data.atRiskValue)} tone="warn"
                  hint={`expiring within ${data.horizonDays} days`} />
                <Stat label="Already expired" value={data.expiredCount} tone={data.expiredCount > 0 ? 'warn' : 'default'} />
              </div>
              <div className="premium-card overflow-x-auto">
                <SmartTable
                  data={data.lots}
                  getRowKey={(r) => `${r.itemId}-${r.lot}`}
                  emptyMessage="Nothing expiring soon. (Only items you track by batch appear here.)"
                  columns={[
                    { key: 'name', header: 'Item', mobile: 'title' },
                    { key: 'lot', header: 'Batch', render: (r) => <span className="font-mono text-xs">{r.lot}</span>, mobile: 'subtitle' },
                    { key: 'qty', header: 'Qty', align: 'right', render: (r) => `${r.qty} ${r.unit || ''}`, mobile: 'hide' },
                    { key: 'expiryDate', header: 'Expires', render: (r) => formatDate(r.expiryDate), mobile: 'hide' },
                    { key: 'daysLeft', header: 'Days left', align: 'right', mobile: 'trailingSub',
                      render: (r) => r.expired
                        ? <span className="font-semibold text-negative">Expired</span>
                        : <span className={r.daysLeft <= 14 ? 'text-highlight' : 'text-text-secondary'}>{r.daysLeft}</span> },
                    { key: 'value', header: 'Worth', type: 'money', render: (r) => money(r.value), mobile: 'trailing' },
                  ]}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
