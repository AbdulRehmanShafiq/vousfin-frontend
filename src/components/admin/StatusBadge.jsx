import { cn } from '@/utils/cn'

const styles = {
  active: 'bg-emerald-100 text-emerald-800',
  suspended: 'bg-red-100 text-red-800',
  pending: 'bg-amber-100 text-amber-800',
  admin: 'bg-purple-100 text-purple-800',
  customer: 'bg-blue-100 text-blue-800',
}

export default function StatusBadge({ status, className }) {
  const key = String(status || '').toLowerCase()
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', styles[key] || 'bg-slate-100 text-slate-700', className)}>
      {status}
    </span>
  )
}
