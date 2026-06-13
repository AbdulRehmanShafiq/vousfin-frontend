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
        <p className="text-[12.5px] font-semibold text-text-muted uppercase tracking-[0.08em]">{title}</p>
        {Icon && <Icon className="h-4 w-4 text-text-muted" />}
      </div>
      <p className="num mt-2 text-2xl font-semibold tracking-tight text-text-primary">{display}</p>
      {trend !== undefined && trend !== 0 && (
        <p
          className={cn(
            'mt-2 flex items-center gap-1.5 text-xs font-medium',
            trend > 0 ? 'text-positive' : 'text-negative'
          )}
        >
          {trend > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {trend > 0 ? 'Positive' : 'Negative'} YTD
        </p>
      )}
    </Card>
  )
}
