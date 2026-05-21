import { cn } from '@/utils/cn'

export default function DataTable({
  columns,
  data,
  isLoading,
  emptyMessage = 'No data available',
  onRowClick,
  className
}) {
  return (
    // Outer wrapper: enforces horizontal scroll on mobile, never breaks page layout
    <div className={cn("w-full overflow-x-auto scrollbar-thin", className)}>
      <table className="min-w-full text-left text-sm text-text-secondary">
        <thead className="bg-glass-panel text-xs uppercase text-text-muted">
          <tr>
            {columns.map((col, i) => (
              <th
                key={col.key || i}
                className={cn(
                  "whitespace-nowrap px-6 py-4 font-bold tracking-wider border-b border-glass",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-glass">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center">
                <div className="flex justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-text-muted border-t-cyan" />
                </div>
              </td>
            </tr>
          ) : !data || data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row._id || row.id || rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                  "transition-colors hover:bg-glass-hover",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={cn("px-6 py-4", col.cellClassName)}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
