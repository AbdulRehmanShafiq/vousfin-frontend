import { useState } from 'react'
import { TrendingUp, TrendingDown, LineChart, ChevronDown, ChevronRight } from 'lucide-react'
import { useIncomeStatement, useRevenueNotes } from '@/hooks/useReports'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { formatCurrency } from '@/utils/formatters'
import ExportButton from '@/components/ui/ExportButton'
import Input from '@/components/ui/Input'
import SkeletonLoader from '@/components/ui/SkeletonLoader'

export default function IncomeStatementPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate:   new Date().toISOString().split('T')[0],
  })

  const [revenueNotesOpen, setRevenueNotesOpen] = useState(false)
  const { data, isLoading } = useIncomeStatement(dateRange)
  const { data: revenueNotes, isLoading: notesLoading } = useRevenueNotes(dateRange)
  const currency = useBusinessStore(s => s.currency)

  // Build export — section totals and subtotals always appear; zero-balance
  // individual accounts are suppressed so the CSV only contains active lines.
  const exportData = []
  if (data) {
    const push    = (label, amt) => exportData.push({ Category: label, Amount: amt ?? 0 })
    const nonZero = (accts) => (accts || []).filter(a => (a.balance || 0) !== 0)

    nonZero(data.revenue?.accounts).forEach(a => push(a.accountName, a.balance))
    push('Total Revenue', data.totalRevenue)
    nonZero(data.cogs?.accounts).forEach(a => push(a.accountName, -a.balance))
    if (data.cogs?.total) push('Total COGS', -data.cogs.total)
    push('Gross Profit', data.grossProfit)
    nonZero(data.operatingExpenses?.accounts).forEach(a => push(a.accountName, -a.balance))
    push('Total Operating Expenses', -(data.operatingExpenses?.total || 0))
    nonZero(data.depreciationAmortization?.accounts).forEach(a => push(a.accountName, -a.balance))
    push('Operating Profit (EBIT)', data.operatingProfit)
    push('EBITDA', data.ebitda)
    push('Interest Expense', -(data.interestExpense?.total || 0))
    push('Net Profit / (Loss)', data.netIncome ?? data.netProfit)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-black text-text-primary tracking-tight">
            <LineChart className="h-6 w-6 text-cyan" />
            Income Statement
          </h1>
          <p className="text-text-secondary mt-1 text-sm">Profit & Loss — Revenue, Gross Profit, EBITDA, Net Income</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input type="date" value={dateRange.startDate}
            onChange={e => setDateRange(p => ({ ...p, startDate: e.target.value }))} containerClassName="flex-1 sm:flex-none sm:w-36" />
          <span className="text-text-muted text-sm">to</span>
          <Input type="date" value={dateRange.endDate}
            onChange={e => setDateRange(p => ({ ...p, endDate: e.target.value }))} containerClassName="flex-1 sm:flex-none sm:w-36" />
          <ExportButton data={exportData} filename={`income-statement-${dateRange.endDate}.csv`}
            headers={[{ key: 'Category', label: 'Category' }, { key: 'Amount', label: 'Amount' }]} />
        </div>
      </div>

      {/* KPI strip */}
      {!isLoading && data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Revenue',        val: data.totalRevenue,    positive: true },
            { label: 'Gross Profit',   val: data.grossProfit,     positive: data.grossProfit >= 0 },
            { label: 'EBITDA',         val: data.ebitda,          positive: data.ebitda >= 0 },
            { label: 'Net Profit',     val: data.netIncome ?? data.netProfit, positive: (data.netIncome ?? data.netProfit) >= 0 },
          ].map(({ label, val, positive }) => (
            <div key={label} className="premium-card px-4 py-3 flex flex-col gap-1">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{label}</span>
              <div className="flex items-center gap-2 min-w-0">
                {positive ? <TrendingUp className="h-4 w-4 text-positive flex-shrink-0" /> : <TrendingDown className="h-4 w-4 text-negative flex-shrink-0" />}
                <span className={`font-black text-base sm:text-lg tabular-nums truncate ${positive ? 'text-positive' : 'text-negative'}`}>
                  {formatCurrency(val, currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revenue notes (IFRS 15) — collapsible panel */}
      <div className="premium-card overflow-hidden">
        <button
          onClick={() => setRevenueNotesOpen(o => !o)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-glass-hover transition-colors"
        >
          <span className="font-bold text-text-primary text-sm">Revenue notes (IFRS 15)</span>
          {revenueNotesOpen
            ? <ChevronDown  className="h-4 w-4 text-text-muted" />
            : <ChevronRight className="h-4 w-4 text-text-muted" />}
        </button>
        {revenueNotesOpen && (
          <div className="border-t border-glass px-6 py-5 space-y-4">
            {notesLoading ? (
              <SkeletonLoader count={4} />
            ) : !revenueNotes ? (
              <p className="text-sm text-text-muted">No revenue notes available for this period.</p>
            ) : (
              <>
                {revenueNotes.policyText && (
                  <p className="text-sm text-text-secondary leading-relaxed">{revenueNotes.policyText}</p>
                )}
                {revenueNotes.disaggregation && revenueNotes.disaggregation.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Revenue by Stream</h4>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-glass">
                          <th className="text-left py-1.5 font-semibold text-text-secondary">Stream</th>
                          <th className="text-right py-1.5 font-semibold text-text-secondary">Amount</th>
                          <th className="text-right py-1.5 font-semibold text-text-secondary">Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-glass">
                        {revenueNotes.disaggregation.map((row, i) => (
                          <tr key={row.stream || i} className="hover:bg-glass-hover transition-colors">
                            <td className="py-1.5 text-text-primary">{row.stream}</td>
                            <td className="py-1.5 text-right tabular-nums text-text-primary">
                              {formatCurrency(row.amount, currency)}
                            </td>
                            <td className="py-1.5 text-right tabular-nums text-text-secondary">
                              {typeof row.pct === 'number' ? `${row.pct.toFixed(1)}%` : row.pct}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t border-glass">
                          <td className="py-2 font-bold text-text-primary">Total Revenue</td>
                          <td className="py-2 text-right tabular-nums font-bold text-text-primary">
                            {formatCurrency(revenueNotes.totalRevenue, currency)}
                          </td>
                          <td className="py-2 text-right tabular-nums text-text-secondary">100%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Main report */}
      <div className="premium-card p-4 sm:p-8">
        {isLoading ? (
          <SkeletonLoader count={10} />
        ) : !data ? (
          <p className="text-center py-10 text-text-muted">No data for this period.</p>
        ) : (
          <div className="space-y-6">
            <div className="text-center border-b border-glass pb-5">
              <h2 className="text-lg sm:text-xl font-bold text-text-primary">Income Statement</h2>
              <p className="text-text-secondary text-sm">{dateRange.startDate} — {dateRange.endDate}</p>
            </div>

            <PLSection title="Revenue" section={data.revenue} currency={currency} />

            {(data.cogs?.total || 0) > 0 && (
              <PLSection title="Cost of Goods Sold" section={data.cogs} currency={currency} negate />
            )}

            <SubtotalRow label="Gross Profit" value={data.grossProfit} currency={currency} />

            <PLSection title="Operating Expenses" section={data.operatingExpenses} currency={currency} negate />

            {(data.depreciationAmortization?.total || 0) !== 0 && (
              <PLSection title="Depreciation & Amortization" section={data.depreciationAmortization} currency={currency} negate />
            )}

            <SubtotalRow label="Operating Profit (EBIT)" value={data.operatingProfit} currency={currency} />

            {/* EBITDA callout */}
            <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-glass border border-glass">
              <span className="text-sm text-text-secondary">EBITDA <span className="text-xs">(Operating Profit + D&A)</span></span>
              <span className={`font-bold text-sm ${data.ebitda >= 0 ? 'text-cyan' : 'text-negative'}`}>
                {formatCurrency(data.ebitda, currency)}
              </span>
            </div>

            {(data.interestExpense?.total || 0) !== 0 && (
              <PLSection title="Interest Expense" section={data.interestExpense} currency={currency} negate />
            )}

            {/* Net Profit */}
            <div className={`flex justify-between items-center py-4 px-5 rounded-xl border-2 ${
              (data.netIncome ?? data.netProfit) >= 0
                ? 'border-positive/40 bg-positive/5'
                : 'border-negative/40 bg-negative/5'
            }`}>
              <span className="text-lg font-black text-text-primary">Net Profit / (Loss)</span>
              <span className={`text-xl font-black ${(data.netIncome ?? data.netProfit) >= 0 ? 'text-positive' : 'text-negative'}`}>
                {formatCurrency(data.netIncome ?? data.netProfit, currency)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PLSection({ title, section, currency, negate = false }) {
  if (!section) return null
  const allAccounts = section?.accounts || (Array.isArray(section) ? section : [])
  const total       = section?.total ?? allAccounts.reduce((s, a) => s + (a.balance || 0), 0)
  if (total === 0 && allAccounts.length === 0) return null

  // Hide individual accounts that have zero balance; the section header + total
  // always appear so the reader sees the category even when all lines are zero.
  const visibleAccounts = allAccounts.filter(a => (a.balance || 0) !== 0)

  return (
    <div className="space-y-1">
      <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider px-1">{title}</h3>
      <div>
        {visibleAccounts.map((acc, i) => (
          <div key={acc.accountId || i} className="flex justify-between items-center py-1.5 px-4 hover:bg-glass-hover rounded-lg transition-colors">
            <span className="text-sm text-text-primary">{acc.accountName}</span>
            <span className="text-sm font-medium text-text-primary tabular-nums">
              {negate ? `(${formatCurrency(acc.balance, currency)})` : formatCurrency(acc.balance, currency)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center py-1.5 px-4 border-t border-glass mt-1">
        <span className="text-sm font-semibold text-text-secondary">Total {title}</span>
        <span className="text-sm font-bold text-text-primary tabular-nums">
          {negate ? `(${formatCurrency(total, currency)})` : formatCurrency(total, currency)}
        </span>
      </div>
    </div>
  )
}

function SubtotalRow({ label, value, currency }) {
  return (
    <div className={`flex justify-between items-center px-4 py-3 rounded-lg border ${
      value >= 0 ? 'border-cyan/20 bg-cyan/5' : 'border-negative/20 bg-negative/5'
    }`}>
      <span className="font-bold text-text-primary">{label}</span>
      <span className={`font-bold tabular-nums ${value >= 0 ? 'text-text-primary' : 'text-negative'}`}>
        {formatCurrency(value, currency)}
      </span>
    </div>
  )
}
