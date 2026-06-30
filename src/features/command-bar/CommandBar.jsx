import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'
import { useModulesStore } from '@/stores/useModulesStore'
import { useCommandBar, getResults, getCatalogEntryById } from './useCommandBar'
import { shouldEscalate, mergeResults } from './escalation'
import { searchCatalogSemantic } from './catalogApi'
import { isHowToQuery } from './intent'
import { askHowTo } from './howToApi'

const GROUP_LABEL = { module: 'Modules', page: 'Pages', action: 'Actions', help: 'Help' }
const EMPTY = [] // stable empty-results reference (avoids needless re-renders)

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
  const [activeForQuery, setActiveForQuery] = useState(query)
  const [howto, setHowto] = useState({ loading: false, data: null })

  // Key off a STABLE string of the disabled modules, not the array identity —
  // some stores hand back a fresh array each render, which would otherwise make
  // every memo/effect below re-run on every render (an escalation loop).
  const disabledKey = (disabled || []).join(',')
  const disabledList = useMemo(() => (disabledKey ? disabledKey.split(',') : []), [disabledKey])
  const localResults = useMemo(() => getResults(query, disabledList, 8), [query, disabledList])
  // Semantic hits are tagged with the query they belong to; a stale result from a
  // previous keystroke is simply ignored at render, so the effect never has to
  // synchronously reset state (which would trigger cascading re-renders).
  const [semantic, setSemantic] = useState({ forQuery: '', entries: [] })
  const semanticEntries = useMemo(
    () => (semantic.forQuery === query ? semantic.entries : EMPTY),
    [semantic, query]
  )
  const results = useMemo(() => mergeResults(localResults, semanticEntries, 8), [localResults, semanticEntries])

  // Reset the highlighted row (and any open AI answer) when the query changes —
  // done during render (React's "adjust state when a value changes" pattern).
  if (query !== activeForQuery) {
    setActiveForQuery(query)
    setActive(0)
    if (howto.data || howto.loading) setHowto({ loading: false, data: null })
  }

  // Tier 3 — offer an AI answer when the query reads like a "how do I…" question.
  const hasAskAi = isHowToQuery(query) && !howto.data && !howto.loading
  const minActive = hasAskAi ? -1 : 0 // -1 = the "Ask AI" row above the results

  // Tier 2 — when the instant local matcher is weak/empty or the query reads
  // like a natural-language question, consult the semantic backend (debounced)
  // and merge its hits below the local ones. Resolve ids → local entries so the
  // rendering (icons, breadcrumb) stays uniform.
  const localCount = localResults.length
  useEffect(() => {
    if (!shouldEscalate(query, localResults)) return undefined // stale semantic ignored at render
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const hits = await searchCatalogSemantic(query, { disabledModules: disabledList, limit: 8 })
        if (cancelled) return
        const entries = hits.map((h) => getCatalogEntryById(h.id) || { ...h, icon: undefined })
        setSemantic({ forQuery: query, entries })
      } catch {
        if (!cancelled) setSemantic({ forQuery: query, entries: [] })
      }
    }, 250)
    return () => { cancelled = true; clearTimeout(timer) }
    // localResults recomputes only when query/disabledList change; localCount is
    // the only property shouldEscalate reads, keeping the deps value-stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, disabledKey, localCount])

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

  const triggerAskAi = async () => {
    setHowto({ loading: true, data: null })
    try {
      const data = await askHowTo(query)
      setHowto({ loading: false, data })
    } catch {
      setHowto({ loading: false, data: { grounded: false, answer: 'Sorry, I could not load an answer. Please try again.', href: null, sources: [] } })
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      if (howto.data || howto.loading) setHowto({ loading: false, data: null }) // back to results first
      else closeBar()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); setActive((i) => Math.max(i - 1, minActive))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (active === -1 && hasAskAi) triggerAskAi()
      else go(results[active])
    }
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
          {howto.loading ? 'Getting an answer…'
            : howto.data ? 'Answer ready'
            : query ? `${results.length} result${results.length === 1 ? '' : 's'}` : ''}
        </div>

        {/* Tier 3 — AI answer panel (replaces the result list while open) */}
        {(howto.loading || howto.data) ? (
          <div className="border-t border-glass px-4 py-4 text-sm">
            {howto.loading ? (
              <p className="flex items-center gap-2 text-text-muted">
                <Sparkles className="h-4 w-4 animate-pulse text-cyan" aria-hidden="true" /> Getting an answer…
              </p>
            ) : (
              <div className="space-y-3">
                <p className="whitespace-pre-wrap text-text-primary">{howto.data.answer}</p>
                {howto.data.href && (
                  <button
                    type="button"
                    onMouseDown={(ev) => { ev.preventDefault(); closeBar(); navigate(howto.data.href) }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-glass bg-glass px-3 py-1.5 text-sm text-text-primary hover:bg-glass-hover"
                  >
                    Go to page <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
                <p className="text-[11px] text-text-muted">Press Esc to go back to results.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {hasAskAi && (
              <button
                type="button"
                role="option" aria-selected={active === -1}
                onMouseEnter={() => setActive(-1)}
                onMouseDown={(ev) => { ev.preventDefault(); triggerAskAi() }}
                className={`flex w-full items-center gap-3 border-t border-glass px-4 py-2.5 text-left ${active === -1 ? 'bg-glass' : ''}`}
              >
                <Sparkles className="h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                <span className="flex-1 truncate text-text-primary">Ask AI: “{query}”</span>
                <span className="rounded bg-glass px-1.5 py-0.5 text-[10px] uppercase text-text-muted">Answer</span>
              </button>
            )}
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
            {query && results.length === 0 && !hasAskAi && (
              <div className="border-t border-glass px-4 py-6 text-center text-sm text-text-muted">
                No matches for “{query}”.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
