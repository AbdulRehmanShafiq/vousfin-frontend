import { cn } from '@/utils/cn'

// Width variation so skeletons look like real content (not all same-width bars)
const WIDTHS = ['w-full', 'w-5/6', 'w-4/5', 'w-3/4', 'w-2/3', 'w-full', 'w-5/6', 'w-4/5']

export default function SkeletonLoader({ className, count = 1, type = 'line' }) {
  if (type === 'card') {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)} aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-xl border border-glass bg-glass-panel p-5 space-y-3">
            <div className="h-3 w-24 animate-pulse rounded bg-glass" />
            <div className="h-8 w-32 animate-pulse rounded bg-glass" />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'table') {
    return (
      <div className={cn('space-y-0', className)} aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-glass">
            <div className="h-4 w-24 animate-pulse rounded bg-glass-panel flex-shrink-0" />
            <div className="h-4 flex-1 animate-pulse rounded bg-glass-panel" />
            <div className="h-4 w-20 animate-pulse rounded bg-glass-panel flex-shrink-0" />
            <div className="h-4 w-16 animate-pulse rounded bg-glass-panel flex-shrink-0" />
          </div>
        ))}
      </div>
    )
  }

  // Default: stacked line skeletons (for report pages)
  return (
    <div className={cn('space-y-3', className)} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 animate-pulse rounded bg-glass-panel',
            WIDTHS[i % WIDTHS.length]
          )}
        />
      ))}
    </div>
  )
}
