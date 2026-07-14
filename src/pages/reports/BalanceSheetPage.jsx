import { useState } from 'react'
import { CheckCircle, XCircle, ChevronDown, ChevronRight, Scale } from 'lucide-react'
import { useBalanceSheet } from '@/hooks/useReports'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { formatCurrency } from '@/utils/formatters'
import ExportButton from '@/components/ui/ExportButton'
import Input from '@/components/ui/Input'
import SkeletonLoader from '@/components/ui/SkeletonLoader'

import { usePeriodStore } from '@/stores/usePeriodStore'

export default function BalanceSheetPage() {
  const asOfDate = usePeriodStore((s) => s.range.endDate)      // global period end
  const setAsOfDate = (d) => usePeriodStore.getState().setRange((p) => ({ ...p, endDate: d }))
  const { data, isLoading } = useBalanceSheet({ endDate: asOfDate })
  const currency = useBusinessStore(s => s.currency)

  const totalAssets    = data?.totalAssets    || 0
  const totalLiabEquity = (data?.totalLiabilities || 0) + (data?.totalEquity || 0)
  const isBalanced     = !isLoading && !!data && Math.abs(totalAssets - totalLiabEquity) < 0.01

  // Build structured export — section headers always appear; zero-balance
  // individual accounts are suppressed so the CSV is clean and readable.
  const exportData = []
  if (data) {
    const push    = (label, amt) => exportData.push({ Category: label, Amount: amt ?? 0 })
    const nonZero = (accts) => (accts || []).filter(a => (a.balance || 0) !== 0)

    const pushSection = (sectionLabel, section) => {
      const groups = section?.groups || []
      if (groups.length > 0) {
        groups.forEach(g => {
          const visible = nonZero(g.accounts)
          push(g.label.toUpperCase(), '')       // subtype header always appears
          visible.forEach(a => push(`  ${a.accountName}`, a.balance))
          push(`  Subtotal — ${g.label}`, g.total)
        })
      } else {
        nonZero(section?.accounts).forEach(a => push(a.accountName, a.balance))
      }
      push(`Total ${sectionLabel}`, section?.total || 0)
    }

    pushSection('Assets',      data.assets)
    pushSection('Liabilities', data.liabilities)
    pushSection('Equity',      data.equity)
    push('Total Liabilities & Equity', totalLiabEquity)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-black text-text-primary tracking-tight">
            <Scale className="h-6 w-6 text-accent" />
            Balance Sheet
          </h1>
          <p className="text-text-secondary mt-1 text-sm">Financial position — Assets, Liabilities, Equity</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-text-muted text-sm">As of</span>
          <Input type="date" value={asOfDate} onChange={e => setAsOfDate(e.target.value)} containerClassName="w-36" />
          <ExportButton data={exportData} filename={`balance-sheet-${asOfDate}.csv`}
            headers={[{ key: 'Category', label: 'Category' }, { key: 'Amount', label: 'Amount' }]} />
        </div>
      </div>

      {/* Equation badge */}
      {!isLoading && data && (
        <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${
          isBalanced ? 'bg-positive/10 border-positive/30 text-positive' : 'bg-negative/10 border-negative/30 text-negative'
        }`}>
          {isBalanced ? <CheckCircle className="h-5 w-5 flex-shrink-0" /> : <XCircle className="h-5 w-5 flex-shrink-0" />}
          <div>
            <p className="font-bold text-sm">
              {isBalanced ? 'Accounting Equation Satisfied' : 'Accounting Equation Imbalance Detected'}
            </p>
            <p className="text-xs opacity-80">
              Assets ({formatCurrency(totalAssets, currency)}) = Liabilities + Equity ({formatCurrency(totalLiabEquity, currency)})
              {!isBalanced && ` — Difference: ${formatCurrency(Math.abs(totalAssets - totalLiabEquity), currency)}`}
            </p>
          </div>
        </div>
      )}

      {/* KPI strip — hidden on mobile (duplicates the section totals below). */}
      {!isLoading && data && (
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Total Assets',      val: data.totalAssets },
            { label: 'Total Liabilities', val: data.totalLiabilities },
            { label: 'Total Equity',      val: data.totalEquity },
          ].map(({ label, val }) => (
            <div key={label} className="premium-card px-4 py-3">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">{label}</p>
              <p className="text-lg font-black text-text-primary mt-1 tabular-nums">{formatCurrency(val, currency)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Two-column layout */}
      <div className="premium-card p-3 sm:p-8">
        {isLoading ? (
          <SkeletonLoader count={12} />
        ) : !data ? (
          <p className="text-center py-10 text-text-muted">No data for this date.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
            {/* Assets */}
            <div className="space-y-3.5 sm:space-y-6">
              <div className="text-center border-b border-glass pb-2.5 sm:pb-4">
                <h2 className="text-base sm:text-lg font-bold text-text-primary">Assets</h2>
              </div>
              <BSSection section={data.assets} currency={currency} />
              <TotalRow label="Total Assets" value={data.totalAssets} currency={currency} />
            </div>

            {/* Liabilities & Equity */}
            <div className="space-y-3.5 sm:space-y-6">
              <div className="text-center border-b border-glass pb-2.5 sm:pb-4">
                <h2 className="text-base sm:text-lg font-bold text-text-primary">Liabilities &amp; Equity</h2>
              </div>
              <BSSection section={data.liabilities} currency={currency} title="Liabilities" />

              {/* Equity — now includes the derived "Current Year Earnings" line so
                  the section foots to totalEquity and the equation balances. */}
              <BSSection section={data.equity} currency={currency} title="Equity" />

              <div className={`flex items-center justify-between gap-3 py-2.5 px-3.5 sm:py-4 sm:px-5 rounded-xl border sm:border-2 ${
                isBalanced ? 'border-accent/40 bg-accent/5' : 'border-negative/40 bg-negative/5'
              }`}>
                <span className="min-w-0 truncate text-sm sm:text-lg font-black text-text-primary">Total Liabilities &amp; Equity</span>
                <span className={`whitespace-nowrap text-sm sm:text-lg font-black tabular-nums ${isBalanced ? 'text-text-primary' : 'text-negative'}`}>
                  {formatCurrency(totalLiabEquity, currency)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function BSSection({ section, currency, title }) {
  if (!section) return null
  const groups   = section.groups
  const accounts = section.accounts || []
  const total    = section.total ?? accounts.reduce((s, a) => s + (a.balance || 0), 0)

  return (
    <div className="space-y-2 sm:space-y-3">
      {title && (
        <h3 className="text-label sm:text-xs font-bold text-text-muted uppercase tracking-wider px-1">{title}</h3>
      )}
      {groups && groups.length > 0
        ? groups.map(g => <SubtypeGroup key={g.label} group={g} currency={currency} />)
        : accounts.map((acc, i) => (
          <div key={acc.accountId || i} className="flex items-center justify-between gap-3 py-1 px-1 sm:py-1.5 sm:px-4">
            <span className="min-w-0 truncate text-small sm:text-sm text-text-primary">{acc.accountName}</span>
            <span className="whitespace-nowrap text-small sm:text-sm font-medium text-text-primary tabular-nums">{formatCurrency(acc.balance, currency)}</span>
          </div>
        ))
      }
      <div className="flex items-center justify-between gap-3 py-1.5 px-1 sm:py-2 sm:px-4 border-t border-glass">
        <span className="min-w-0 truncate text-small sm:text-sm font-semibold text-text-secondary">Total {title || ''}</span>
        <span className="whitespace-nowrap text-small sm:text-sm font-bold text-text-primary tabular-nums">{formatCurrency(total, currency)}</span>
      </div>
    </div>
  )
}

function SubtypeGroup({ group, currency }) {
  const [open, setOpen] = useState(true)
  // Only show accounts with a non-zero balance; the group header + total always appear.
  const visibleAccounts = (group.accounts || []).filter(a => (a.balance || 0) !== 0)
  return (
    <div className="border border-glass rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 sm:px-4 bg-glass hover:bg-glass-hover transition-colors"
      >
        <span className="min-w-0 truncate text-label sm:text-xs font-bold text-text-secondary uppercase tracking-wider">{group.label}</span>
        <div className="flex flex-shrink-0 items-center gap-2">
          <span className="whitespace-nowrap text-small sm:text-sm font-bold text-text-primary tabular-nums">{formatCurrency(group.total, currency)}</span>
          {open ? <ChevronDown className="h-4 w-4 text-text-muted" /> : <ChevronRight className="h-4 w-4 text-text-muted" />}
        </div>
      </button>
      {open && visibleAccounts.length > 0 && (
        <div className="divide-y divide-glass">
          {visibleAccounts.map((acc, i) => (
            <div key={acc.accountId || i} className="flex items-center justify-between gap-3 py-1.5 px-3 sm:px-6 hover:bg-glass-hover transition-colors">
              <span className="min-w-0 truncate text-small sm:text-sm text-text-primary">{acc.accountName}</span>
              <span className="whitespace-nowrap text-small sm:text-sm font-medium text-text-primary tabular-nums">{formatCurrency(acc.balance, currency)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TotalRow({ label, value, currency }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 px-3.5 sm:py-3 sm:px-5 rounded-xl bg-accent/5 border sm:border-2 border-accent/40">
      <span className="min-w-0 truncate text-sm sm:text-lg font-black text-text-primary">{label}</span>
      <span className="whitespace-nowrap text-sm sm:text-lg font-black text-text-primary tabular-nums">{formatCurrency(value, currency)}</span>
    </div>
  )
}
