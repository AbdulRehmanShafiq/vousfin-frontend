import { PieChart } from 'lucide-react'
import { useCashFlow } from '@/hooks/useReports'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { formatCurrency } from '@/utils/formatters'
import ExportButton from '@/components/ui/ExportButton'
import Input from '@/components/ui/Input'
import SkeletonLoader from '@/components/ui/SkeletonLoader'

import { usePeriodStore } from '@/stores/usePeriodStore'

export default function CashFlowPage() {
  const dateRange = usePeriodStore((s) => s.range)      // global report period
  const setDateRange = usePeriodStore((s) => s.setRange)

  const { data, isLoading } = useCashFlow(dateRange)
  const currency = useBusinessStore((s) => s.currency)

  // Format data for export
  const exportData = []
  if (data) {
    const getItems = (sec) => Array.isArray(sec?.items) ? sec.items : Array.isArray(sec) ? sec : []
    const getTotal = (sec) => typeof sec?.total === 'number' ? sec.total : getItems(sec).reduce((sum, item) => sum + (item.amount || 0), 0)

    const processSection = (section, type) => {
      if (!section) return
      const items = getItems(section)
      items.forEach(item => {
        exportData.push({ Type: type, Description: item.description, Amount: item.amount })
      })
      exportData.push({ Type: `Total ${type}`, Description: '', Amount: getTotal(section) })
    }
    processSection(data.operating, 'Operating Activities')
    processSection(data.investing, 'Investing Activities')
    processSection(data.financing, 'Financing Activities')
    exportData.push({ Type: 'Net Cash Flow', Description: '', Amount: data.netCashFlow })
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-black text-text-primary tracking-tight">
            <PieChart className="h-6 w-6 text-accent" />
            Cash Flow Statement
          </h1>
          <p className="text-text-secondary mt-1 text-sm">Operating, investing and financing activities</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={e => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              containerClassName="min-w-0 flex-1 sm:flex-none sm:w-36"
            />
            <span className="text-text-muted text-xs">to</span>
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={e => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              containerClassName="min-w-0 flex-1 sm:flex-none sm:w-36"
            />
          </div>
          <ExportButton
            data={exportData} 
            filename={`cash-flow-${dateRange.endDate}.csv`}
            headers={[
              { key: 'Type', label: 'Activity' },
              { key: 'Description', label: 'Description' },
              { key: 'Amount', label: 'Amount' }
            ]}
          />
        </div>
      </div>

      <div className="premium-card p-3 sm:p-10">
        {isLoading ? (
          <SkeletonLoader count={8} />
        ) : !data ? (
          <div className="text-center py-10 text-text-muted">No data available for this period.</div>
        ) : (
          <div className="space-y-4 sm:space-y-8">
            <div className="text-center border-b border-glass pb-3 sm:pb-6">
              <h2 className="text-base sm:text-xl font-bold text-text-primary">Statement of Cash Flows</h2>
              <p className="text-text-secondary text-xs sm:text-sm">For the period {dateRange.startDate} to {dateRange.endDate}</p>
            </div>

            <ReportSection title="Operating Activities" section={data.operating} currency={currency} />
            <ReportSection title="Investing Activities" section={data.investing} currency={currency} />
            <ReportSection title="Financing Activities" section={data.financing} currency={currency} />

            <div className="flex items-center justify-between gap-3 py-2.5 px-3.5 sm:py-4 sm:px-4 border-t-2 border-accent bg-accent/5 rounded-lg">
              <span className="min-w-0 truncate text-sm sm:text-lg font-black text-text-primary">Net Increase (Decrease) in Cash</span>
              <span className={`whitespace-nowrap text-sm sm:text-lg font-black tabular-nums ${data.netCashFlow >= 0 ? 'text-positive' : 'text-negative'}`}>
                {formatCurrency(data.netCashFlow, currency)}
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
  const getItems = (sec) => Array.isArray(sec?.items) ? sec.items : Array.isArray(sec) ? sec : []
  const getTotal = (sec) => typeof sec?.total === 'number' ? sec.total : getItems(sec).reduce((sum, item) => sum + (item.amount || 0), 0)

  const items = getItems(section)
  const total = getTotal(section)

  return (
    <div className="space-y-1.5 sm:space-y-2">
      <h3 className="font-bold text-text-muted uppercase tracking-wider text-label sm:text-xs px-1 sm:px-4">{title}</h3>
      <div>
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 py-1 px-1 sm:py-2 sm:px-4">
            <span className="min-w-0 truncate text-small sm:text-base text-text-primary">{item.description}</span>
            <span className="whitespace-nowrap text-small sm:text-base text-text-primary font-medium tabular-nums">{formatCurrency(item.amount, currency)}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 py-1.5 px-1 sm:py-2 sm:px-4 border-t border-glass mt-1 sm:mt-2">
        <span className="min-w-0 truncate text-small sm:text-base font-medium text-text-secondary">Net Cash from {title}</span>
        <span className="whitespace-nowrap text-small sm:text-base font-bold text-text-primary tabular-nums">{formatCurrency(total, currency)}</span>
      </div>
    </div>
  )
}
