import { useState } from 'react'
import { FileDown, FileSpreadsheet, Download } from 'lucide-react'
import { startOfYear, endOfYear, format } from 'date-fns'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import reportService from '@/services/report.service'
import { getErrorMessage } from '@/utils/errorHandler'

const REPORT_TYPES = [
  { value: 'incomeStatement', label: 'Income Statement', needsRange: true },
  { value: 'balanceSheet', label: 'Balance Sheet', needsRange: false },
  { value: 'cashFlow', label: 'Cash Flow Statement', needsRange: true },
]

export default function ExportPage() {
  const [reportType, setReportType] = useState('incomeStatement')
  const [startDate, setStartDate] = useState(format(startOfYear(new Date()), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [asOfDate, setAsOfDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(null) // 'pdf' | 'xlsx' | null

  const selectedReport = REPORT_TYPES.find(r => r.value === reportType)

  const doExport = async (fileFormat) => {
    setLoading(fileFormat)
    try {
      const params = { type: reportType, format: fileFormat }
      if (selectedReport.needsRange) {
        params.startDate = startDate
        params.endDate = endDate
      } else {
        params.asOfDate = asOfDate
      }

      const response = await reportService.exportReport(params)

      // Create download link
      const blob = new Blob([response.data], {
        type: fileFormat === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportType}-${selectedReport.needsRange ? startDate : asOfDate}.${fileFormat}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success(`${selectedReport.label} exported as ${fileFormat.toUpperCase()}`)
    } catch (err) {
      toast.error(getErrorMessage(err) || `Failed to export ${fileFormat.toUpperCase()}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black text-text-primary tracking-tight">
          <Download className="h-6 w-6 text-cyan" />
          Export Reports
        </h1>
        <p className="text-text-secondary mt-1">Download financial reports as PDF or Excel.</p>
      </div>

      <div className="max-w-xl">
        <div className="premium-card p-6 space-y-6">
          {/* Report Type */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
              Report Type
            </label>
            <div className="space-y-2">
              {REPORT_TYPES.map(rt => (
                <label key={rt.value} className="flex items-center gap-3 p-3 rounded-xl border border-glass hover:border-cyan/30 hover:bg-glass-hover cursor-pointer transition-colors">
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    reportType === rt.value ? 'border-cyan' : 'border-glass'
                  }`}>
                    {reportType === rt.value && <div className="h-2 w-2 rounded-full bg-cyan" />}
                  </div>
                  <input
                    type="radio"
                    name="reportType"
                    value={rt.value}
                    checked={reportType === rt.value}
                    onChange={e => setReportType(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-text-primary">{rt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range / As Of Date */}
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
              {selectedReport?.needsRange ? 'Date Range' : 'As Of Date'}
            </label>
            {selectedReport?.needsRange ? (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="From"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
                <Input
                  label="To"
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            ) : (
              <Input
                label="As of Date"
                type="date"
                value={asOfDate}
                onChange={e => setAsOfDate(e.target.value)}
              />
            )}
          </div>

          {/* Export Buttons */}
          <div className="pt-2 border-t border-glass">
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
              Download Format
            </label>
            <div className="flex gap-3">
              <Button
                icon={FileDown}
                loading={loading === 'pdf'}
                disabled={!!loading}
                onClick={() => doExport('pdf')}
                className="flex-1"
              >
                Export PDF
              </Button>
              <Button
                variant="ghost"
                icon={FileSpreadsheet}
                loading={loading === 'xlsx'}
                disabled={!!loading}
                onClick={() => doExport('xlsx')}
                className="flex-1"
              >
                Export Excel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
