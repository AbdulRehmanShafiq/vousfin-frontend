import { useState } from 'react'
import { useIncomeStatement } from '@/hooks/useReports'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { formatCurrency } from '@/utils/formatters'
import ExportButton from '@/components/ui/ExportButton'
import Input from '@/components/ui/Input'
import SkeletonLoader from '@/components/ui/SkeletonLoader'

export default function IncomeStatementPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Jan 1st this year
    endDate: new Date().toISOString().split('T')[0]
  })

  const { data, isLoading } = useIncomeStatement(dateRange)
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
    processSection(data.revenue, 'Revenue')
    processSection(data.cogs, 'Cost of Goods Sold')
    exportData.push({ Type: 'Gross Profit', Account: '', Amount: data.grossProfit })
    processSection(data.operatingExpenses, 'Operating Expenses')
    exportData.push({ Type: 'Net Income', Account: '', Amount: data.netIncome })
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Income Statement</h1>
          <p className="text-text-secondary mt-1">Review your revenue, expenses, and profitability.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Input 
            type="date" 
            value={dateRange.startDate} 
            onChange={e => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-36"
          />
          <span className="text-text-muted">to</span>
          <Input 
            type="date" 
            value={dateRange.endDate} 
            onChange={e => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="w-36"
          />
          <ExportButton 
            data={exportData} 
            filename={`income-statement-${dateRange.endDate}.csv`}
            headers={[
              { key: 'Type', label: 'Category' },
              { key: 'Account', label: 'Account Name' },
              { key: 'Amount', label: 'Amount' }
            ]}
          />
        </div>
      </div>

      <div className="premium-card p-6 sm:p-10">
        {isLoading ? (
          <SkeletonLoader count={8} />
        ) : !data ? (
          <div className="text-center py-10 text-text-muted">No data available for this period.</div>
        ) : (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center border-b border-glass pb-6">
              <h2 className="text-xl font-bold text-text-primary">Income Statement</h2>
              <p className="text-text-secondary">For the period {dateRange.startDate} to {dateRange.endDate}</p>
            </div>

            {/* Revenue */}
            <ReportSection title="Revenue" section={data.revenue} currency={currency} />
            
            {/* COGS (if any) */}
            {data.cogs?.total > 0 && (
              <ReportSection title="Cost of Goods Sold" section={data.cogs} currency={currency} />
            )}

            {/* Gross Profit */}
            <div className="flex justify-between items-center py-3 border-t border-b border-glass bg-glass-hover px-4 rounded-lg">
              <span className="font-bold text-text-primary">Gross Profit</span>
              <span className="font-bold text-text-primary">{formatCurrency(data.grossProfit, currency)}</span>
            </div>

            {/* Operating Expenses */}
            <ReportSection title="Operating Expenses" section={data.operatingExpenses} currency={currency} />

            {/* Net Income */}
            <div className="flex justify-between items-center py-4 border-t-2 border-cyan bg-cyan/5 px-4 rounded-lg shadow-glow-cyan/10">
              <span className="text-lg font-black text-text-primary">Net Income</span>
              <span className={`text-lg font-black ${data.netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(data.netIncome, currency)}
              </span>
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
        <span className="font-medium text-text-secondary">Total {title}</span>
        <span className="font-bold text-text-primary">{formatCurrency(total, currency)}</span>
      </div>
    </div>
  )
}
