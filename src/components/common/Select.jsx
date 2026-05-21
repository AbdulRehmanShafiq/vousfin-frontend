import { useState, useRef, useMemo } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import Spinner from './Spinner'

export default function Select({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  searchable = false,
  loading = false,
  error,
  className,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)
  useOnClickOutside(ref, () => setOpen(false))

  const filtered = useMemo(() => {
    if (!searchable || !query) return options
    return options.filter((o) =>
      String(o.label || o.name || o).toLowerCase().includes(query.toLowerCase())
    )
  }, [options, query, searchable])

  const selected = options.find((o) => (o.value ?? o._id ?? o.id) === value)

  return (
    <div className={cn('relative w-full', className)} ref={ref}>
      {label && <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2.5 text-left text-sm',
          error ? 'border-red-500' : 'border-slate-300'
        )}
      >
        <span className={selected ? 'text-slate-900' : 'text-slate-400'}>
          {selected ? selected.label || selected.name : placeholder}
        </span>
        {loading ? <Spinner size="sm" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {searchable && (
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                className="flex-1 text-sm outline-none"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button type="button" onClick={() => setQuery('')}>
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-slate-500">No options found</p>
          ) : (
            filtered.map((opt) => {
              const optVal = opt.value ?? opt._id ?? opt.id
              return (
                <button
                  key={optVal}
                  type="button"
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm hover:bg-brand-50',
                    value === optVal && 'bg-brand-50 font-medium text-brand-700'
                  )}
                  onClick={() => {
                    onChange(optVal)
                    setOpen(false)
                    setQuery('')
                  }}
                >
                  {opt.label || opt.name}
                </button>
              )
            })
          )}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
