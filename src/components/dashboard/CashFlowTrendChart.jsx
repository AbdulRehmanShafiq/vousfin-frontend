import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import { formatCurrency } from '@/utils/formatters'
import SkeletonLoader from '@/components/ui/SkeletonLoader'

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null
  const value = payload[0]?.value ?? 0
  return (
    <div className="rounded-xl border border-glass bg-charcoal/95 backdrop-blur-sm p-3 shadow-elevated text-xs">
      <p className="font-bold text-text-primary mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${value >= 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
        <span className="text-text-secondary">Net Cash:</span>
        <span className={`font-bold ${value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatCurrency(value, currency)}
        </span>
      </div>
    </div>
  )
}

export default function CashFlowTrendChart({ data = [], loading, currency }) {
  if (loading) return <SkeletonLoader type="card" count={1} className="h-80" />

  return (
    <div className="premium-card p-6">
      <h3 className="text-base font-bold text-text-primary mb-6">Cash Flow Trend</h3>
      {data.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-text-muted text-sm">
          No cash flow data for this period.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={288}>
          <LineChart data={data}>
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
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="netCashFlow"
              stroke="#06B6D4"
              strokeWidth={2.5}
              dot={{ fill: '#06B6D4', strokeWidth: 0, r: 4 }}
              activeDot={{ fill: '#fff', stroke: '#06B6D4', strokeWidth: 2, r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
