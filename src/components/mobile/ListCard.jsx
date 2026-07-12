import { cn } from '@/utils/cn'

/**
 * ListCard — a tappable row-as-card for mobile lists. Replaces desktop
 * table rows: ≥56px tall, full-width tap target, one clear hierarchy
 * (leading icon → title/subtitle → trailing value).
 */
export default function ListCard({ leading, title, subtitle, trailing, trailingSub, onClick, className }) {
  const interactive = !!onClick
  const Tag = interactive ? 'button' : 'div'

  return (
    <Tag
      type={interactive ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex w-full min-h-[56px] items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
        interactive && 'active:scale-[0.98] hover:bg-glass-hover',
        className,
      )}
    >
      {leading && <div className="flex-shrink-0">{leading}</div>}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary leading-tight">{title}</p>
        {subtitle && <p className="mt-0.5 truncate text-[12.5px] text-text-muted leading-tight">{subtitle}</p>}
      </div>

      {(trailing || trailingSub) && (
        <div className="flex-shrink-0 text-right">
          {trailing && <p className="text-sm font-semibold text-text-primary leading-tight">{trailing}</p>}
          {trailingSub && <p className="mt-0.5 text-[12px] text-text-muted leading-tight">{trailingSub}</p>}
        </div>
      )}
    </Tag>
  )
}
