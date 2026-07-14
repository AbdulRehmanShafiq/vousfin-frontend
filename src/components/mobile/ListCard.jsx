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

      {/* <div> not <p>: slots accept arbitrary nodes (SmartTable passes cell
          renders here), and block elements inside <p> are invalid HTML. */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-text-primary leading-tight">{title}</div>
        {subtitle && <div className="mt-0.5 truncate text-small text-text-muted leading-tight">{subtitle}</div>}
      </div>

      {(trailing || trailingSub) && (
        <div className="flex-shrink-0 text-right">
          {trailing && <div className="text-sm font-semibold text-text-primary leading-tight">{trailing}</div>}
          {trailingSub && <div className="mt-0.5 text-xs text-text-muted leading-tight">{trailingSub}</div>}
        </div>
      )}
    </Tag>
  )
}
