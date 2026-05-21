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
    <div className="premium-card p-6">
      <h3 className="text-base font-bold text-text-primary mb-6">Revenue vs Expenses</h3>
      {data.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-text-muted text-sm">
          No transaction data for this period.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={288}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatCurrency(v, currency).replace(/\.\d+/, '')}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
              width={72}
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
