import { useState } from 'react'
import { CheckCircle, XCircle, LayoutDashboard } from 'lucide-react'
import { useBalanceSheet } from '@/hooks/useReports'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { formatCurrency } from '@/utils/formatters'
import ExportButton from '@/components/ui/ExportButton'
import Input from '@/components/ui/Input'
import SkeletonLoader from '@/components/ui/SkeletonLoader'

export default function BalanceSheetPage() {
  const [dateRange, setDateRange] = useState({
    endDate: new Date().toISOString().split('T')[0]
  })

  const { data, isLoading } = useBalanceSheet(dateRange)
  const currency = useBusinessStore((s) => s.currency)

  // Format data for export
  const exportData = []
  if (data) {
    const getAccounts = (sec) => Array.isArray(sec?.accounts) ? sec.accounts : Array.isArray(sec) ? sec : []
    const getTotal = (sec) => typeof sec?.total === 'number' ? sec.total : getAccounts(sec).reduce((sum, acc) => sum + (acc.balance || 0), 0)

    const processSection = (section, type) => {
      if (!section) return
      const accounts = getAccounts(section)
      accounts.forEach(acc => {
        exportData.push({ Type: type, Account: acc.accountName, Amount: acc.balance })
      })
      exportData.push({ Type: `Total ${type}`, Account: '', Amount: getTotal(section) })
    }
    processSection(data.assets, 'Assets')
    processSection(data.liabilities, 'Liabilities')
    processSection(data.equity, 'Equity')
    exportData.push({ Type: 'Total Liabilities & Equity', Account: '', Amount: (data.liabilities?.total || 0) + (data.equity?.total || 0) })
  }

  // Accounting equation validation: Assets = Liabilities + Equity
  const totalAssets = data?.assets?.total || 0
  const totalLiabEquity = (data?.liabilities?.total || 0) + (data?.equity?.total || 0)
  const isBalanced = !isLoading && !!data && Math.abs(totalAssets - totalLiabEquity) < 0.01

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-text-primary tracking-tight">
            <LayoutDashboard className="h-6 w-6 text-cyan" />
            Balance Sheet
          </h1>
          <p className="text-text-secondary mt-1">Snapshot of your financial position.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-text-muted text-sm">As of</span>
          <Input
            type="date"
            value={dateRange.endDate}
            onChange={e => setDateRange({ endDate: e.target.value })}
            className="w-36"
          />
          <ExportButton
            data={exportData}
            filename={`balance-sheet-${dateRange.endDate}.csv`}
            headers={[
              { key: 'Type', label: 'Category' },
              { key: 'Account', label: 'Account Name' },
              { key: 'Amount', label: 'Amount' }
            ]}
          />
        </div>
      </div>

      {/* Accounting Equation Validation */}
      {!isLoading && data && (
        <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${
          isBalanced
            ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400'
            : 'bg-red-400/10 border-red-400/30 text-red-400'
        }`}>
          {isBalanced
            ? <CheckCircle className="h-5 w-5 flex-shrink-0" />
            : <XCircle className="h-5 w-5 flex-shrink-0" />
          }
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

      <div className="premium-card p-6 sm:p-10">
        {isLoading ? (
          <SkeletonLoader count={8} />
        ) : !data ? (
          <div className="text-center py-10 text-text-muted">No data available for this date.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Left Column: Assets */}
            <div className="space-y-8">
              <div className="text-center border-b border-glass pb-4">
                <h2 className="text-xl font-bold text-text-primary">Assets</h2>
              </div>
              <ReportSection title="Current & Non-Current Assets" section={data.assets} currency={currency} />
              <div className="flex justify-between items-center py-4 border-t-2 border-cyan bg-cyan/5 px-4 rounded-lg">
                <span className="text-lg font-black text-text-primary">Total Assets</span>
                <span className="text-lg font-black text-text-primary">{formatCurrency(totalAssets, currency)}</span>
              </div>
            </div>

            {/* Right Column: Liabilities & Equity */}
            <div className="space-y-8">
              <div className="text-center border-b border-glass pb-4">
                <h2 className="text-xl font-bold text-text-primary">Liabilities &amp; Equity</h2>
              </div>

              <ReportSection title="Liabilities" section={data.liabilities} currency={currency} />
              <ReportSection title="Equity" section={data.equity} currency={currency} />

              <div className={`flex justify-between items-center py-4 border-t-2 px-4 rounded-lg ${
                isBalanced ? 'border-cyan bg-cyan/5' : 'border-red-400 bg-red-400/5'
              }`}>
                <span className="text-lg font-black text-text-primary">Total Liabilities &amp; Equity</span>
                <span className={`text-lg font-black ${isBalanced ? 'text-text-primary' : 'text-red-400'}`}>
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

function ReportSection({ title, section, currency }) {
  if (!section) return null
  const getAccounts = (sec) => Array.isArray(sec?.accounts) ? sec.accounts : Array.isArray(sec) ? sec : []
  const getTotal = (sec) => typeof sec?.total === 'number' ? sec.total : getAccounts(sec).reduce((sum, acc) => sum + (acc.balance || 0), 0)
  
  const accounts = getAccounts(section)
  const total = getTotal(section)

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-text-secondary uppercase tracking-wider text-xs px-4">{title}</h3>
      <div className="space-y-1">
        {accounts.map((acc, idx) => (
          <div key={acc.accountId || idx} className="flex justify-between items-center py-2 px-4 hover:bg-glass-hover rounded-lg transition-colors">
            <span className="text-text-primary">{acc.accountName}</span>
            <span className="text-text-primary font-medium">{formatCurrency(acc.balance, currency)}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center py-2 px-4 border-t border-glass mt-2">
        <span className="font-medium text-text-secondary">Total</span>
        <span className="font-bold text-text-primary">{formatCurrency(total, currency)}</span>
      </div>
    </div>
  )
}
