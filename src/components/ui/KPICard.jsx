import { TrendingDown, TrendingUp } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import Card from './Card'

export default function KPICard({ title, value, format = 'currency', trend, loading, currency, icon: Icon }) {
  if (loading) {
    return (
      <Card>
        <div className="h-4 w-24 animate-pulse rounded bg-glass-panel" />
        <div className="mt-3 h-8 w-32 animate-pulse rounded bg-glass-panel" />
      </Card>
    )
  }

  const display =
    format === 'percent'
      ? formatPercent(value)
      : format === 'currency'
        ? formatCurrency(value, currency)
        : value

  return (
    <Card className="hover-scale">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-muted uppercase tracking-wider">{title}</p>
        {Icon && <Icon className="h-5 w-5 text-cyan opacity-50" />}
      </div>
      <p className="mt-2 text-2xl font-black tracking-tight text-text-primary">{display}</p>
      {trend !== undefined && trend !== 0 && (
        <p
          className={cn(
            'mt-2 flex items-center gap-1.5 text-xs font-medium tracking-wide',
            trend > 0 ? 'text-emerald-400' : 'text-red-400'
          )}
        >
          {trend > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {trend > 0 ? 'Positive' : 'Negative'} YTD
        </p>
      )}
    </Card>
  )
}
