import { useState } from 'react'
import ForecastChart from '@/components/ai/ForecastChart'
import Select from '@/components/common/Select'
import Button from '@/components/common/Button'
import { useAIStore } from '@/stores/useAIStore'
import { showError } from '@/components/common/Toast'
import { getErrorMessage } from '@/utils/errorHandler'
import { downloadBlob } from '@/utils/exportHelpers'

export default function ForecastPage() {
  const { forecast, loading, fetchForecast } = useAIStore()
  const [metric, setMetric] = useState('revenue')
  const [horizon, setHorizon] = useState(3)

  const run = () => fetchForecast(metric, horizon).catch((e) => showError(getErrorMessage(e)))

  const exportCsv = (data) => {
    const csv = ['period,value,type', ...(data || []).map((r) => `${r.period},${r.value},${r.type}`)].join('\n')
    downloadBlob(new Blob([csv], { type: 'text/csv' }), `forecast-${metric}.csv`)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Financial Forecast</h1>
      <div className="flex flex-wrap gap-4 rounded-xl border bg-white p-4">
        <Select label="Metric" value={metric} onChange={setMetric} options={[{ value: 'revenue', label: 'Revenue' }, { value: 'expenses', label: 'Expenses' }, { value: 'netCashFlow', label: 'Net Cash Flow' }]} />
        <Select label="Horizon (months)" value={horizon} onChange={(v) => setHorizon(Number(v))} options={[1, 3, 6].map((n) => ({ value: n, label: `${n} months` }))} />
        <div className="flex items-end"><Button onClick={run} loading={loading}>Generate forecast</Button></div>
      </div>
      <ForecastChart data={forecast} loading={loading} onExport={exportCsv} />
    </div>
  )
}
