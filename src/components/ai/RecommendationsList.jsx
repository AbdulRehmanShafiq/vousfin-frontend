import { AlertCircle, TrendingUp } from 'lucide-react'
import { cn } from '@/utils/cn'

const priorityStyles = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-blue-100 text-blue-800',
}

export default function RecommendationsList({ items = [], loading }) {
  if (loading) return <div className="h-48 animate-pulse rounded-xl bg-slate-100" />

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-600" />
              <h4 className="font-medium text-slate-900">{item.title}</h4>
            </div>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', priorityStyles[item.priority] || priorityStyles.medium)}>
              {item.priority || 'medium'}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">{item.insight || item.description}</p>
          {item.action && <p className="mt-2 flex items-center gap-1 text-xs text-brand-600"><AlertCircle className="h-3 w-3" />{item.action}</p>}
          {item.relatedReport && <a href={item.relatedReport} className="mt-2 inline-block text-xs text-brand-600 hover:underline">View related report</a>}
        </div>
      ))}
    </div>
  )
}
