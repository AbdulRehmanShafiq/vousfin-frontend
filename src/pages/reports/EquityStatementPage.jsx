import { useState } from 'react'
import { CheckCircle, XCircle, Layers, FileDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { useEquityStatement } from '@/hooks/useReports'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { formatCurrency } from '@/utils/formatters'
import { getErrorMessage } from '@/utils/errorHandler'
import reportService from '@/services/report.service'
import ExportButton from '@/components/ui/ExportButton'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import SkeletonLoader from '@/components/ui/SkeletonLoader'

import { usePeriodStore } from '@/stores/usePeriodStore'

export default function EquityStatementPage() {
  const dateRange = usePeriodStore((s) => s.range)      // global report period
  const setDateRange = usePeriodStore((s) => s.setRange)
  const [pdfLoading, setPdfLoading] = useState(false)
  const { data, isLoading } = useEquityStatement(dateRange)
  const currency = useBusinessStore(s => s.currency)

  const components  = data?.components  || []
  const rows        = data?.rows        || []
  const recon       = data?.reconciliation
  const reconciles  = recon?.reconciles ?? false

  const handleDownloadPdf = async () => {
    setPdfLoading(true)
    try {
      const response = await reportService.exportReport({
        type: 'equity',
        format: 'pdf',
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url  = window.URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `equity-statement-${dateRange.endDate}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('Equity Statement downloaded as PDF')
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Failed to download PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  // Build flat CSV: one row per report-row, one column per component + Total
  const exportHeaders = [
    { key: 'Label', label: '' },
    ...components.map(c => ({ key: c.key, label: c.label })),
    { key: 'Total', label: 'Total' },
  ]
  const exportData = rows.map(row => {
    const obj = { Label: row.label, Total: row.total ?? 0 }
    components.forEach(c => { obj[c.key] = row.values?.[c.key] ?? 0 })
    return obj
  })
  if (recon) {
    exportData.push({
      Label: 'Balance Sheet Equity',
      Total: recon.balanceSheetEquity ?? 0,
    })
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-black text-text-primary tracking-tight">
            <Layers className="h-6 w-6 text-cyan" />
            Equity Statement
          </h1>
          <p className="text-text-secondary mt-1 text-sm">How owner equity changed during the period</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
            <Input type="date" value={dateRange.startDate}
              onChange={e => setDateRange(p => ({ ...p, startDate: e.target.value }))}
              containerClassName="min-w-0 flex-1 sm:flex-none sm:w-36" />
            <span className="text-text-muted text-xs">to</span>
            <Input type="date" value={dateRange.endDate}
              onChange={e => setDateRange(p => ({ ...p, endDate: e.target.value }))}
              containerClassName="min-w-0 flex-1 sm:flex-none sm:w-36" />
          </div>
          <ExportButton
            data={exportData}
            filename={`equity-statement-${dateRange.endDate}.csv`}
            headers={exportHeaders}
          />
          <Button
            variant="secondary"
            icon={FileDown}
            loading={pdfLoading}
            onClick={handleDownloadPdf}
          >
            PDF
          </Button>
        </div>
      </div>

      {/* Reconciliation badge */}
      {!isLoading && data && recon && (
        <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${
          reconciles
            ? 'bg-positive/10 border-positive/30 text-positive'
            : 'bg-negative/10 border-negative/30 text-negative'
        }`}>
          {reconciles
            ? <CheckCircle className="h-5 w-5 flex-shrink-0" />
            : <XCircle    className="h-5 w-5 flex-shrink-0" />}
          <div>
            <p className="font-bold text-sm">
              {reconciles
                ? 'Equity matches Balance Sheet'
                : 'Equity does not match Balance Sheet'}
            </p>
            <p className="text-xs opacity-80">
              Closing equity ({formatCurrency(recon.closingTotal, currency)}) vs
              Balance Sheet equity ({formatCurrency(recon.balanceSheetEquity, currency)})
              {!reconciles && ` — Difference: ${formatCurrency(Math.abs(recon.difference), currency)}`}
            </p>
          </div>
        </div>
      )}

      {/* Matrix table */}
      <div className="premium-card p-4 sm:p-8 overflow-x-auto">
        {isLoading ? (
          <SkeletonLoader count={8} />
        ) : !data || rows.length === 0 ? (
          <p className="text-center py-10 text-text-muted">No data for this period.</p>
        ) : (
          <div className="space-y-3.5 sm:space-y-6">
            <div className="text-center border-b border-glass pb-3 sm:pb-5">
              <h2 className="text-base sm:text-xl font-bold text-text-primary">Statement of Changes in Equity</h2>
              <p className="text-text-secondary text-xs sm:text-sm">{dateRange.startDate} — {dateRange.endDate}</p>
            </div>

            <table className="w-full min-w-[440px] text-[13px] sm:text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4 font-bold text-text-secondary uppercase text-xs tracking-wider w-48">
                  </th>
                  {components.map(c => (
                    <th
                      key={c.key}
                      className="text-right py-2 px-3 font-bold text-text-secondary uppercase text-xs tracking-wider"
                    >
                      {c.label}
                    </th>
                  ))}
                  <th className="text-right py-2 pl-3 font-bold text-text-secondary uppercase text-xs tracking-wider border-l border-glass">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass">
                {rows.map((row) => {
                  const isKeyRow = row.key === 'opening' || row.key === 'closing'
                  return (
                    <tr
                      key={row.key}
                      className={`transition-colors ${
                        isKeyRow
                          ? 'bg-cyan/5 font-black'
                          : 'hover:bg-glass-hover'
                      }`}
                    >
                      <td className={`py-2.5 pr-4 ${isKeyRow ? 'font-black text-text-primary' : 'text-text-primary'}`}>
                        {row.label}
                      </td>
                      {components.map(c => (
                        <td
                          key={c.key}
                          className={`py-2.5 px-3 text-right tabular-nums ${
                            isKeyRow ? 'font-black text-text-primary' : 'text-text-primary'
                          }`}
                        >
                          {formatCurrency(row.values?.[c.key] ?? 0, currency)}
                        </td>
                      ))}
                      <td className={`py-2.5 pl-3 text-right tabular-nums border-l border-glass ${
                        isKeyRow ? 'font-black text-text-primary' : 'font-semibold text-text-primary'
                      }`}>
                        {formatCurrency(row.total ?? 0, currency)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Reconciliation footer */}
            {recon && (
              <div className={`flex justify-between items-center px-4 py-3 rounded-lg border text-sm ${
                reconciles
                  ? 'border-positive/20 bg-positive/5'
                  : 'border-negative/20 bg-negative/5'
              }`}>
                <span className="font-semibold text-text-secondary">
                  Balance Sheet Equity (cross-check)
                </span>
                <span className="font-bold tabular-nums text-text-primary">
                  {formatCurrency(recon.balanceSheetEquity, currency)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
