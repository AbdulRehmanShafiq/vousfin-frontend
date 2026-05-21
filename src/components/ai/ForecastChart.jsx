import { useMemo } from 'react'
import { ResponsiveContainer, Line, XAxis, YAxis, Tooltip, Area, ComposedChart } from 'recharts'
import Button from '@/components/common/Button'
import { formatCurrency } from '@/utils/formatters'
import { Download } from 'lucide-react'

export default function ForecastChart({ data, loading, onExport }) {
  const chartData = useMemo(() => {
    if (!data) return []
    const historical = data.historical || []
    const forecast = data.forecast || []
    return [...historical.map((d) => ({ ...d, type: 'actual' })), ...forecast.map((d) => ({ ...d, type: 'forecast' }))]
  }, [data])

  if (loading) return <div className="h-96 animate-pulse rounded-xl bg-slate-100" />

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">LSTM Forecast ? {data?.metric}</h3>
        <Button variant="outline" icon={Download} onClick={() => onExport?.(chartData)}>Export CSV</Button>
      </div>
      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart data={chartData}>
          <XAxis dataKey="period" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => formatCurrency(v).replace(/\.\d+/, '')} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => formatCurrency(v)} />
          <Area dataKey="lower" fill="#dbeafe" stroke="none" opacity={0.3} />
          <Area dataKey="upper" fill="#dbeafe" stroke="none" opacity={0.3} />
          <Line type="monotone" dataKey="value" stroke="#1560c4" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
