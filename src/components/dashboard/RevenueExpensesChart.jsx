import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { formatCurrency } from '@/utils/formatters'
import SkeletonLoader from '@/components/ui/SkeletonLoader'

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-glass bg-charcoal/95 backdrop-blur-sm p-3 shadow-elevated text-xs">
      <p className="font-bold text-text-primary mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.fill }} />
          <span className="text-text-secondary capitalize">{entry.name}:</span>
          <span className="font-bold text-text-primary">{formatCurrency(entry.value, currency)}</span>
        </div>
      ))}
    </div>
  )
}

export default function RevenueExpensesChart({ data = [], loading, currency }) {
  if (loading) return <SkeletonLoader type="card" count={1} className="h-80" />

  return (
    <div className="premium-card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Revenue vs Expenses</h3>
          <p className="text-[11px] text-text-muted mt-0.5">Monthly comparison · YTD</p>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-text-muted text-sm border border-dashed border-glass rounded-xl">
          No transaction data for this period.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={256}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => {
                const abs = Math.abs(v)
                if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
                if (abs >= 1_000)     return `${(v / 1_000).toFixed(0)}K`
                return String(Math.round(v))
              }}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Legend
              formatter={(value) => <span className="text-xs text-text-secondary capitalize">{value}</span>}
            />
            <Bar dataKey="revenue" name="Revenue" fill="#06B6D4" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="expenses" name="Expenses" fill="#F97316" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
