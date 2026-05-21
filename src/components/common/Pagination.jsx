import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import Button from './Button'

export default function Pagination({
  page = 1,
  totalPages = 1,
  total = 0,
  limit = 25,
  onPageChange,
  onLimitChange,
  rowsPerPageOptions = [10, 25, 50, 100],
}) {
  const pages = []
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-4 sm:flex-row">
      <p className="text-sm text-slate-600">
        Showing page {page} of {totalPages} ({total} total)
      </p>
      <div className="flex items-center gap-2">
        {onLimitChange && (
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          >
            {rowsPerPageOptions.map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        )}
        <Button variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)} icon={ChevronLeft}>
          Prev
        </Button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              'h-9 min-w-[36px] rounded-lg px-2 text-sm font-medium',
              p === page ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {p}
          </button>
        ))}
        <Button
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          icon={ChevronRight}
          iconPosition="right"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
