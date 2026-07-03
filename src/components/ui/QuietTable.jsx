import { cn } from '@/utils/cn'
import EmptyState from './EmptyState'

/*
 * QuietTable — the Calm list pattern: no card wrapper, no zebra fills, just
 * hairline row separators and generous row height. Columns are configured with
 * { key, header, render, align, className }. Rows reveal a subtle hover tint;
 * pass onRowClick to make rows navigable.
 *
 * The single reusable list surface for transactions, invoices, bills, etc.
 */
export default function QuietTable({
  columns = [], rows = [], rowKey = (r, i) => r._id || r.id || i,
  onRowClick, loading = false, emptyTitle = 'Nothing here yet', emptyDescription, emptyIcon, className,
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-11 animate-pulse rounded-lg bg-glass-panel" />
        ))}
      </div>
    )
  }
  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} icon={emptyIcon} />
  }
  const alignClass = (a) => (a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left')
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-glass">
            {columns.map((c) => (
              <th key={c.key} className={cn('px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted', alignClass(c.align))}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={rowKey(row, i)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn('border-b border-glass/60 transition-colors', onRowClick && 'cursor-pointer hover:bg-glass-hover')}
            >
              {columns.map((c) => (
                <td key={c.key} className={cn('px-3 py-3 text-sm text-text-secondary', alignClass(c.align), c.className)}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
