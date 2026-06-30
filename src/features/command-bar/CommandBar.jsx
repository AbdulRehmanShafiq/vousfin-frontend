import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Send, Trash2, ArrowLeft, Bot, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useModulesStore } from '@/stores/useModulesStore'
import AssistantMessageMeta from '@/components/ai/AssistantMessageMeta'
import { useAIStore } from '@/stores/useAIStore'
import { useCommandBar, getResults, getCatalogEntryById } from './useCommandBar'
import { shouldEscalate, mergeResults } from './escalation'
import { searchCatalogSemantic } from './catalogApi'
import { isHowToQuery } from './intent'
import { logSearchEvent } from './logApi'

const GROUP_LABEL = { module: 'Modules', page: 'Pages', action: 'Actions', help: 'Help' }
const EMPTY = [] // stable empty-results reference (avoids needless re-renders)

/* ── Chat message bubble (assistant answers render markdown + sources) ── */
function ChatBubble({ m }) {
  const isUser = m.role === 'user'
  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan/30 bg-cyan/20">
          <Bot className="h-3.5 w-3.5 text-cyan" aria-hidden="true" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${isUser ? 'rounded-tr-sm bg-cyan text-ink-on-accent font-medium' : 'rounded-tl-sm border border-glass bg-glass-panel text-text-primary'}`}>
        {isUser ? m.content : (
          <>
            {m.content
              ? <ReactMarkdown components={{ p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p> }}>{m.content}</ReactMarkdown>
              : <span className="text-text-muted">Thinking…</span>}
            <AssistantMessageMeta meta={m.meta} compact />
          </>
        )}
      </div>
      {isUser && (
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-glass bg-glass-panel">
          <User className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
        </div>
      )}
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-2 py-1">
      {['-0.3s', '-0.15s', '0s'].map((d) => (
        <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan/60" style={{ animationDelay: d }} />
      ))}
    </div>
  )
}

/**
 * Unified command bar (WAI-ARIA combobox) + inline AI assistant chat. One panel,
 * opened with ⌘/Ctrl+K or the header button: search/navigate, or switch to the
 * assistant and chat about your finances inline (the old floating widget is
 * merged in here, so there is a single AI entry point).
 */
export function CommandBar() {
  const open = useCommandBar((s) => s.open)
  const view = useCommandBar((s) => s.view)
  const setView = useCommandBar((s) => s.setView)
  const query = useCommandBar((s) => s.query)
  const setQuery = useCommandBar((s) => s.setQuery)
  const closeBar = useCommandBar((s) => s.closeBar)
  const disabled = useModulesStore((s) => s.disabled)

  const messages = useAIStore((s) => s.messages)
  const aiLoading = useAIStore((s) => s.loading)
  const sendMessage = useAIStore((s) => s.sendMessage)
  const clearChat = useAIStore((s) => s.clearChat)

  const navigate = useNavigate()
  const inputRef = useRef(null)
  const restoreRef = useRef(null)
  const chatEndRef = useRef(null)
  const [active, setActive] = useState(0)
  const [activeForQuery, setActiveForQuery] = useState(query)
  const [chatDraft, setChatDraft] = useState('')

  // Key off a STABLE string of the disabled modules, not the array identity.
  const disabledKey = (disabled || []).join(',')
  const disabledList = useMemo(() => (disabledKey ? disabledKey.split(',') : []), [disabledKey])
  const localResults = useMemo(() => getResults(query, disabledList, 8), [query, disabledList])
  const [semantic, setSemantic] = useState({ forQuery: '', entries: [] })
  const semanticEntries = useMemo(() => (semantic.forQuery === query ? semantic.entries : EMPTY), [semantic, query])
  const results = useMemo(() => mergeResults(localResults, semanticEntries, 8), [localResults, semanticEntries])

  if (query !== activeForQuery) {
    setActiveForQuery(query)
    setActive(0)
  }

  // "Ask the AI assistant" affordance — available for any non-trivial query.
  const hasAskAi = view === 'search' && query.trim().length >= 2
  const minActive = hasAskAi ? -1 : 0

  // Tier 2 — debounced semantic escalation when the local matcher is weak.
  const localCount = localResults.length
  useEffect(() => {
    if (view !== 'search' || !shouldEscalate(query, localResults)) return undefined
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const hits = await searchCatalogSemantic(query, { disabledModules: disabledList, limit: 8 })
        if (cancelled) return
        setSemantic({ forQuery: query, entries: hits.map((h) => getCatalogEntryById(h.id) || { ...h, icon: undefined }) })
      } catch {
        if (!cancelled) setSemantic({ forQuery: query, entries: [] })
      }
    }, 250)
    return () => { cancelled = true; clearTimeout(timer) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, disabledKey, localCount, view])

  useEffect(() => {
    if (open) {
      restoreRef.current = document.activeElement
      inputRef.current?.focus()
    } else if (restoreRef.current?.focus) {
      restoreRef.current.focus()
    }
  }, [open, view])

  // Auto-scroll the chat to the newest message.
  useEffect(() => {
    if (view === 'chat') chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, view, aiLoading])

  // No-result analytics (search view only).
  const resultCount = results.length
  useEffect(() => {
    if (!open || view !== 'search') return undefined
    const q = query.trim()
    if (q.length < 3 || resultCount > 0 || isHowToQuery(q)) return undefined
    const timer = setTimeout(() => logSearchEvent({ kind: 'catalog', query: q, noResult: true }), 700)
    return () => clearTimeout(timer)
  }, [open, query, resultCount, view])

  if (!open) return null

  const go = (entry) => {
    if (!entry) return
    logSearchEvent({ kind: 'catalog', query, resultClickedId: entry.id })
    closeBar()
    navigate(entry.href)
  }

  // Switch to the assistant and ask the current query.
  const enterChat = (text) => {
    const q = String(text ?? '').trim()
    setView('chat')
    if (q) {
      logSearchEvent({ kind: 'howto', query: q })
      sendMessage(q).catch(() => {})
    }
    setQuery('')
  }

  const sendChat = () => {
    const q = chatDraft.trim()
    if (!q || aiLoading) return
    setChatDraft('')
    sendMessage(q).catch(() => {})
  }

  const onSearchKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); closeBar() }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, minActive)) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      if (active === -1 && hasAskAi) enterChat(query)
      else go(results[active])
    }
  }

  const onChatKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); setView('search') }
    else if (e.key === 'Enter') { e.preventDefault(); sendChat() }
  }

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Search or ask the AI assistant"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[12vh] motion-reduce:transition-none"
      onMouseDown={(e) => { if (e.target === e.currentTarget) closeBar() }}
    >
      <div className="w-full max-w-xl rounded-xl border border-glass bg-surface shadow-2xl">
        {view === 'chat' ? (
          /* ── AI assistant chat ─────────────────────────────────────────── */
          <>
            <div className="flex items-center gap-2 border-b border-glass px-3 py-2">
              <button type="button" onClick={() => setView('search')} aria-label="Back to search"
                className="rounded-md p-1 text-text-muted hover:bg-glass hover:text-text-primary">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <Sparkles className="h-4 w-4 text-cyan" aria-hidden="true" />
              <span className="flex-1 text-sm font-medium text-text-primary">AI Assistant</span>
              {messages.length > 0 && (
                <button type="button" onClick={clearChat} aria-label="Clear conversation"
                  className="rounded-md p-1 text-text-muted hover:bg-glass hover:text-text-primary">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="max-h-[50vh] min-h-[140px] space-y-3 overflow-y-auto px-4 py-3">
              {messages.length === 0 ? (
                <p className="text-sm text-text-muted">
                  Ask anything about your finances — e.g. “what’s my net profit this month?”, “who owes me the most?”
                </p>
              ) : messages.map((m) => <ChatBubble key={m.id} m={m} />)}
              {aiLoading && <TypingDots />}
              <div ref={chatEndRef} />
            </div>

            <div className="flex items-center gap-2 border-t border-glass px-3 py-2">
              <input
                ref={inputRef}
                value={chatDraft}
                onChange={(e) => setChatDraft(e.target.value)}
                onKeyDown={onChatKeyDown}
                aria-label="Message the AI assistant"
                placeholder="Ask the assistant…"
                className="flex-1 bg-transparent px-1 py-1.5 text-sm outline-none"
                autoFocus
              />
              <button type="button" onClick={sendChat} disabled={!chatDraft.trim() || aiLoading} aria-label="Send message"
                className="rounded-md p-1.5 text-cyan hover:bg-glass disabled:opacity-40">
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </>
        ) : (
          /* ── Search / navigate ─────────────────────────────────────────── */
          <>
            <input
              ref={inputRef}
              role="combobox" aria-expanded={results.length > 0} aria-controls="cmdbar-listbox"
              aria-activedescendant={results[active] ? `cmd-opt-${results[active].id}` : undefined}
              aria-autocomplete="list" aria-label="Search modules, pages and actions"
              className="w-full bg-transparent px-4 py-3 text-base outline-none"
              placeholder="Search VousFin, or ask the AI…  (try “who owes me”)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onSearchKeyDown}
              autoFocus
            />
            <div role="status" aria-live="polite" className="sr-only">
              {query ? `${results.length} result${results.length === 1 ? '' : 's'}` : ''}
            </div>

            {hasAskAi && (
              <button
                type="button"
                role="option" aria-selected={active === -1}
                onMouseEnter={() => setActive(-1)}
                onMouseDown={(ev) => { ev.preventDefault(); enterChat(query) }}
                className={`flex w-full items-center gap-3 border-t border-glass px-4 py-2.5 text-left ${active === -1 ? 'bg-glass' : ''}`}
              >
                <Sparkles className="h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
                <span className="flex-1 truncate text-text-primary">Ask AI: “{query}”</span>
                <span className="rounded bg-glass px-1.5 py-0.5 text-[10px] uppercase text-text-muted">Chat</span>
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
