import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useModulesStore } from '@/stores/useModulesStore'
import { useCommandBar, getResults } from './useCommandBar'

const GROUP_LABEL = { module: 'Modules', page: 'Pages', action: 'Actions', help: 'Help' }

/**
 * Accessible command bar (WAI-ARIA combobox + listbox). Tier 1 of the
 * intelligent-search design: instant, offline, keyboard-first navigation.
 */
export function CommandBar() {
  const open = useCommandBar((s) => s.open)
  const query = useCommandBar((s) => s.query)
  const setQuery = useCommandBar((s) => s.setQuery)
  const closeBar = useCommandBar((s) => s.closeBar)
  const disabled = useModulesStore((s) => s.disabled)
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const restoreRef = useRef(null)
  const [active, setActive] = useState(0)

  const results = useMemo(() => getResults(query, disabled, 8), [query, disabled])

  useEffect(() => { setActive(0) }, [query])
  useEffect(() => {
    if (open) {
      restoreRef.current = document.activeElement
      inputRef.current?.focus()
    } else if (restoreRef.current?.focus) {
      restoreRef.current.focus()
    }
  }, [open])

  if (!open) return null

  const go = (entry) => { if (!entry) return; closeBar(); navigate(entry.href) }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); closeBar() }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); go(results[active]) }
  }

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Search VousFin"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[12vh] motion-reduce:transition-none"
      onMouseDown={(e) => { if (e.target === e.currentTarget) closeBar() }}
    >
      <div className="w-full max-w-xl rounded-xl border border-glass bg-surface shadow-2xl">
        <input
          ref={inputRef}
          role="combobox" aria-expanded={results.length > 0} aria-controls="cmdbar-listbox"
          aria-activedescendant={results[active] ? `cmd-opt-${results[active].id}` : undefined}
          aria-autocomplete="list" aria-label="Search modules, pages and actions"
          className="w-full bg-transparent px-4 py-3 text-base outline-none"
          placeholder="Search VousFin…  (try “who owes me”)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
        />
        <div role="status" aria-live="polite" className="sr-only">
          {query ? `${results.length} result${results.length === 1 ? '' : 's'}` : ''}
        </div>
        {results.length > 0 && (
          <ul role="listbox" id="cmdbar-listbox" className="max-h-[50vh] overflow-y-auto border-t border-glass py-1">
            {results.map((e, i) => {
              const Icon = e.icon
              return (
                <li
                  key={e.id} id={`cmd-opt-${e.id}`} role="option" aria-selected={i === active}
                  className={`flex cursor-pointer items-center gap-3 px-4 py-2 ${i === active ? 'bg-glass' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(ev) => { ev.preventDefault(); go(e) }}
                >
                  {Icon ? <Icon className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" /> : null}
                  <span className="flex-1 truncate">{e.title}</span>
                  <span className="truncate text-xs text-text-muted">{e.path.join(' › ')}</span>
                  <span className="rounded bg-glass px-1.5 py-0.5 text-[10px] uppercase text-text-muted">{GROUP_LABEL[e.type]}</span>
                </li>
              )
            })}
          </ul>
        )}
        {query && results.length === 0 && (
          <div className="border-t border-glass px-4 py-6 text-center text-sm text-text-muted">
            No matches for “{query}”.
          </div>
        )}
      </div>
    </div>
  )
}
