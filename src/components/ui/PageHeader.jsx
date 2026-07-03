import { cn } from '@/utils/cn'

/*
 * PageHeader — the Calm page lead: one large plain title, an optional one-line
 * subtitle, and at most one primary action on the right. No boxes, just type +
 * air. Use at the top of every page for a consistent, quiet entry point.
 */
export default function PageHeader({ title, subtitle, action, className }) {
  return (
    <div className={cn('mb-6 flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  )
}
