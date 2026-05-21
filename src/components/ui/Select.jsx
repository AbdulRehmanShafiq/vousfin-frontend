import { forwardRef, useState, useRef, useMemo } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'

export const Select = forwardRef(({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  searchable = false,
  loading = false,
  error,
  className,
  name,
}, ref) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef(null)
  useOnClickOutside(containerRef, () => setOpen(false))

  const filtered = useMemo(() => {
    if (!searchable || !query) return options
    return options.filter((o) =>
      String(o.label || o.name || o).toLowerCase().includes(query.toLowerCase())
    )
  }, [options, query, searchable])

  const selected = options.find((o) => (o.value ?? o._id ?? o.id) === value)

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {/* Hidden input to hold the actual value for react-hook-form compat if needed */}
      <input type="hidden" name={name} value={value || ''} ref={ref} />
      
      {label && <label className="mb-1.5 block text-sm font-medium text-text-secondary">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex w-full items-center justify-between rounded-lg border bg-glass-panel px-4 py-3 text-left text-sm transition-premium focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20 focus:bg-glass-hover',
          error ? 'border-red-500/50' : 'border-glass'
        )}
      >
        <span className={selected ? 'text-text-primary' : 'text-text-muted'}>
          {selected ? selected.label || selected.name : placeholder}
        </span>
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-text-muted border-t-cyan"></div>
        ) : (
          <ChevronDown className="h-4 w-4 text-text-muted" />
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto scrollbar-thin rounded-lg border border-glass bg-charcoal shadow-elevated">
          {searchable && (
            <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-glass bg-charcoal px-3 py-2">
              <Search className="h-4 w-4 text-text-muted" />
              <input
                className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button type="button" onClick={() => setQuery('')}>
                  <X className="h-4 w-4 text-text-muted hover:text-cyan" />
                </button>
              )}
            </div>
          )}
          <div className="py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-center text-sm text-text-muted">No options found</p>
            ) : (
              filtered.map((opt) => {
                const optVal = opt.value ?? opt._id ?? opt.id
                return (
                  <button
                    key={optVal}
                    type="button"
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm transition-colors hover:bg-glass-hover text-text-secondary hover:text-cyan',
                      value === optVal && 'bg-glass-panel font-medium text-cyan'
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
        </div>
      )}
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  )
})
Select.displayName = 'Select'
export default Select
