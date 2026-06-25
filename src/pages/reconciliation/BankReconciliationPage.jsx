/**
 * Bank Reconciliation — Phase 4 Overhaul
 *
 * Premium reconciliation dashboard with:
 *  - Framer Motion page & item transitions
 *  - Auto-match engine trigger (POST /auto-match)
 *  - Batch accept with checkbox multi-select (POST /accept-batch)
 *  - proposedMatches display with confidence tiers (High / Review)
 *  - Running balance visualizer in summary bar
 *  - Glassmorphic, dark-theme UI with micro-animations
 */
import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Upload, FileSpreadsheet, Loader2, Check, X, Plus, Trash2, ArrowLeft,
  CheckCircle2, AlertTriangle, Banknote, ArrowDownLeft, ArrowUpRight,
  Sparkles, ListChecks, Zap, ShieldCheck, TrendingUp, TrendingDown,
  ChevronDown, ChevronRight, SquareCheck, Square,
} from 'lucide-react'
import reconApi from '@/services/bankReconciliation.service'
import { useAccounts } from '@/hooks/useAccounts'
import { getErrorMessage } from '@/utils/errorHandler'

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const money = (n) => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—')

/* ── Animation variants ───────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}
const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
}
const cardVariant = {
  hidden: { opacity: 0, scale: 0.97, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.18 } },
}

/* ── Score badge ─────────────────────────────────────────────────────────── */
function ScoreBadge({ score }) {
  const isHigh = score >= 85
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full tracking-wide ${
      isHigh
        ? 'bg-[rgb(var(--c-positive)_/_0.15)] text-[rgb(var(--c-positive))]'
        : 'bg-[rgb(var(--c-highlight)_/_0.15)] text-[rgb(var(--c-highlight))]'
    }`}>
      {isHigh ? <Zap className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
      {score}%
    </span>
  )
}

/* ── Stat card ──────────────────────────────────────────────────────────── */
function Stat({ label, value, tone, icon: Icon }) {
  return (
    <motion.div
      variants={cardVariant}
      className="flex flex-col items-center justify-center px-4 py-3 rounded-xl bg-[var(--glass-panel)] border border-[var(--c-border)] gap-1"
    >
      {Icon && <Icon className={`w-4 h-4 mb-0.5 ${tone || 'text-[rgb(var(--c-text2))]'}`} />}
      <p className={`text-xl font-bold tabular-nums ${tone || 'text-[rgb(var(--c-text))]'}`}>{value}</p>
      <p className="text-[11px] text-[rgb(var(--c-text3))] tracking-wide uppercase">{label}</p>
    </motion.div>
  )
}

/* ── Summary bar ────────────────────────────────────────────────────────── */
function SummaryBar({ s }) {
  const pct = s.totalLines > 0 ? Math.round(((s.matched + s.cleared) / s.totalLines) * 100) : 0

  return (
    <motion.div
      initial="hidden" animate="visible" variants={stagger}
      className="bg-[var(--glass-panel)] border border-[var(--c-border)] rounded-2xl p-5 shadow-[var(--shadow-card)] space-y-4"
    >
      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium text-[rgb(var(--c-text2))]">Reconciliation progress</span>
          <span className="text-xs font-bold text-[rgb(var(--c-accent))]">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-[rgb(var(--c-border2)_/_0.3)] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, rgb(var(--c-accent)), rgb(var(--c-positive)))' }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Stat label="Matched" value={`${s.matched + s.cleared}/${s.totalLines}`} tone="text-[rgb(var(--c-accent))]" icon={ShieldCheck} />
        <Stat label="Needs Review" value={s.unmatched} tone={s.unmatched ? 'text-[rgb(var(--c-highlight))]' : 'text-[rgb(var(--c-positive))]'} icon={AlertTriangle} />
        <Stat label="Money In" value={money(s.inflow)} tone="text-[rgb(var(--c-positive))]" icon={TrendingUp} />
        <Stat label="Money Out" value={money(s.outflow)} tone="text-[rgb(var(--c-negative))]" icon={TrendingDown} />
        <Stat label="In Books Only" value={s.unmatchedBookCount} icon={FileSpreadsheet} />
      </div>

      {/* Closing balance check */}
      <AnimatePresence>
        {s.closing != null && s.expectedClosing != null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`text-xs text-center rounded-xl py-2 px-3 flex items-center justify-center gap-2 font-medium ${
              s.closingMatches
                ? 'bg-[rgb(var(--c-positive)_/_0.1)] text-[rgb(var(--c-positive))] border border-[rgb(var(--c-positive)_/_0.2)]'
                : 'bg-[rgb(var(--c-highlight)_/_0.1)] text-[rgb(var(--c-highlight))] border border-[rgb(var(--c-highlight)_/_0.2)]'
            }`}
          >
            {s.closingMatches
              ? <><CheckCircle2 className="w-3.5 h-3.5" /> Opening + activity matches the closing balance ✓</>
              : <><AlertTriangle className="w-3.5 h-3.5" /> Expected closing {money(s.expectedClosing)} ≠ statement closing {money(s.closing)}</>}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── Single line row ─────────────────────────────────────────────────────── */
function LineRow({ stmtId, line, accounts, onChange, selected, onToggleSelect, batchMode }) {
  const [busy, setBusy] = useState(false)
  const [creating, setCreating] = useState(false)
  const [catId, setCatId] = useState('')
  const [expanded, setExpanded] = useState(false)
  const inLine = line.direction === 'in'

  const act = async (fn, okMsg) => {
    setBusy(true)
    try {
      const res = await fn()
      if (okMsg) toast.success(okMsg)
      onChange(res.data.data)
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setBusy(false) }
  }

  const isMatched = line.status === 'matched' || line.status === 'created'
  const isCleared = line.status === 'cleared'
  const isUnmatched = line.status === 'unmatched'
  const proposals = line.proposedMatches || line.candidates || []
  const topProposal = proposals[0]
  const hasHighConf = topProposal && topProposal.score >= 85

  const borderColor = isMatched
    ? 'border-[rgb(var(--c-positive)_/_0.3)]'
    : isCleared
      ? 'border-[var(--c-border)]'
      : hasHighConf
        ? 'border-[rgb(var(--c-accent)_/_0.35)]'
        : 'border-[rgb(var(--c-highlight)_/_0.3)]'

  const bgColor = isMatched
    ? 'bg-[rgb(var(--c-positive)_/_0.07)]'
    : isCleared
      ? 'bg-[var(--glass-panel)]'
      : hasHighConf
        ? 'bg-[rgb(var(--c-accent)_/_0.05)]'
        : 'bg-[var(--glass-panel)]'

  return (
    <motion.div
      layout
      variants={cardVariant}
      className={`border rounded-xl overflow-hidden transition-colors duration-200 ${borderColor} ${bgColor}`}
    >
      <div className="p-3.5">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Batch checkbox */}
          {batchMode && isUnmatched && (
            <button
              onClick={() => onToggleSelect(line.lineRef)}
              className="mt-0.5 shrink-0 text-[rgb(var(--c-text3))] hover:text-[rgb(var(--c-accent))] transition-colors"
            >
              {selected
                ? <SquareCheck className="w-4 h-4 text-[rgb(var(--c-accent))]" />
                : <Square className="w-4 h-4" />}
            </button>
          )}

          {/* Direction icon */}
          <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
            inLine ? 'bg-[rgb(var(--c-positive)_/_0.15)]' : 'bg-[rgb(var(--c-negative)_/_0.15)]'
          }`}>
            {inLine
              ? <ArrowDownLeft className="w-3.5 h-3.5 text-[rgb(var(--c-positive))]" />
              : <ArrowUpRight className="w-3.5 h-3.5 text-[rgb(var(--c-negative))]" />}
          </div>

          {/* Description + date */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[rgb(var(--c-text))] truncate">{line.description || '—'}</p>
            <p className="text-[11px] text-[rgb(var(--c-text3))] mt-0.5">
              {fmtDate(line.date)}{line.reference ? ` · ${line.reference}` : ''}
            </p>
          </div>

          {/* Amount */}
          <div className="shrink-0 text-right">
            <p className={`text-sm font-bold tabular-nums ${inLine ? 'text-[rgb(var(--c-positive))]' : 'text-[rgb(var(--c-negative))]'}`}>
              {inLine ? '+' : '−'}{money(line.amount)}
            </p>
            {isUnmatched && topProposal && (
              <ScoreBadge score={topProposal.score} />
            )}
          </div>
        </div>

        {/* ── Matched state ─────────────────────── */}
        <AnimatePresence>
          {isMatched && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex items-center justify-between text-xs bg-[rgb(var(--c-positive)_/_0.1)] border border-[rgb(var(--c-positive)_/_0.25)] rounded-lg px-3 py-2"
            >
              <span className="text-[rgb(var(--c-positive))] flex items-center gap-1.5 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                {line.status === 'created' ? 'New entry posted' : 'Matched'}
                {line.matchedEntry ? `: ${line.matchedEntry.description}` : ''}
                {line.autoMatched && <span className="opacity-60 ml-1">(auto)</span>}
              </span>
              <button
                disabled={busy}
                onClick={() => act(() => reconApi.unmatch(stmtId, line.lineRef), 'Unmatched')}
                className="shrink-0 ml-2 text-[rgb(var(--c-text3))] hover:text-[rgb(var(--c-negative))] transition-colors"
              >
                Undo
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Cleared state ─────────────────────── */}
        <AnimatePresence>
          {isCleared && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex items-center justify-between text-xs bg-[var(--glass-panel)] border border-[var(--c-border)] rounded-lg px-3 py-2"
            >
              <span className="text-[rgb(var(--c-text3))]">Marked cleared{line.note ? `: ${line.note}` : ''}</span>
              <button
                disabled={busy}
                onClick={() => act(() => reconApi.unmatch(stmtId, line.lineRef), 'Reopened')}
                className="text-[rgb(var(--c-text3))] hover:text-[rgb(var(--c-accent))] transition-colors"
              >
                Undo
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Unmatched: proposals + actions ─────── */}
        {isUnmatched && (
          <div className="mt-3 space-y-2">
            {/* Proposals */}
            {proposals.length > 0 ? (
              <div className="space-y-1.5">
                {/* Top proposal (always visible) */}
                <motion.div
                  layout
                  className="flex items-center justify-between gap-2 bg-[var(--glass-panel)] border border-[var(--c-border2)] rounded-lg px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[rgb(var(--c-text))] truncate">{topProposal.description || '—'}</p>
                    <p className="text-[11px] text-[rgb(var(--c-text3))] mt-0.5">
                      {fmtDate(topProposal.date)} · {money(topProposal.amount)}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <ScoreBadge score={topProposal.score} />
                    <button
                      disabled={busy}
                      onClick={() => act(() => reconApi.match(stmtId, line.lineRef, topProposal.journalEntryId), 'Matched ✓')}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[rgb(var(--c-accent))] text-[rgb(var(--c-on-accent))] hover:bg-[rgb(var(--c-accent2))] transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Accept
                    </button>
                  </div>
                </motion.div>

                {/* More proposals (expandable) */}
                {proposals.length > 1 && (
                  <>
                    <button
                      onClick={() => setExpanded(!expanded)}
                      className="flex items-center gap-1 text-[11px] text-[rgb(var(--c-text3))] hover:text-[rgb(var(--c-text2))] transition-colors"
                    >
                      {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      {expanded ? 'Hide' : `${proposals.length - 1} more suggestion${proposals.length > 2 ? 's' : ''}`}
                    </button>
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1.5 overflow-hidden"
                        >
                          {proposals.slice(1).map((c) => (
                            <div key={String(c.journalEntryId)} className="flex items-center justify-between gap-2 bg-[var(--glass-panel)] border border-[var(--c-border)] rounded-lg px-3 py-2 opacity-80">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-[rgb(var(--c-text2))] truncate">{c.description || '—'}</p>
                                <p className="text-[11px] text-[rgb(var(--c-text3))]">{fmtDate(c.date)} · {money(c.amount)}</p>
                              </div>
                              <div className="shrink-0 flex items-center gap-2">
                                <ScoreBadge score={c.score} />
                                <button
                                  disabled={busy}
                                  onClick={() => act(() => reconApi.match(stmtId, line.lineRef, c.journalEntryId), 'Matched ✓')}
                                  className="text-[11px] px-2 py-0.5 rounded-lg border border-[var(--c-border2)] text-[rgb(var(--c-text2))] hover:border-[rgb(var(--c-accent))] hover:text-[rgb(var(--c-accent))] transition-colors"
                                >
                                  Select
                                </button>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-[rgb(var(--c-text3))] italic">No matching entry found in your books for this line.</p>
            )}

            {/* Create / clear actions */}
            {!creating ? (
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => setCreating(true)}
                  className="text-xs text-[rgb(var(--c-accent))] hover:underline flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Create entry
                </button>
                <span className="text-[var(--c-border2)] text-xs">·</span>
                <button
                  disabled={busy}
                  onClick={() => act(() => reconApi.clear(stmtId, line.lineRef), 'Cleared')}
                  className="text-xs text-[rgb(var(--c-text3))] hover:text-[rgb(var(--c-text2))] hover:underline transition-colors"
                >
                  Mark cleared
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 pt-1"
              >
                <select
                  value={catId}
                  onChange={(e) => setCatId(e.target.value)}
                  className="flex-1 text-xs border border-[var(--c-border2)] rounded-lg px-2 py-1.5 bg-[var(--glass-panel)] text-[rgb(var(--c-text))] outline-none focus:border-[rgb(var(--c-accent))]"
                >
                  <option value="">{inLine ? 'Income / source account…' : 'Expense / category account…'}</option>
                  {accounts.map((a) => (
                    <option key={a._id} value={a._id}>{a.accountName} ({a.accountType})</option>
                  ))}
                </select>
                <button
                  disabled={busy || !catId}
                  onClick={() => act(() => reconApi.create(stmtId, line.lineRef, { categoryAccountId: catId }), 'Entry posted ✓')}
                  className="shrink-0 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[rgb(var(--c-accent))] text-[rgb(var(--c-on-accent))] hover:bg-[rgb(var(--c-accent2))] transition-colors disabled:opacity-50"
                >
                  {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Post'}
                </button>
                <button onClick={() => setCreating(false)} className="text-[rgb(var(--c-text3))] hover:text-[rgb(var(--c-text2))]">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ── Workspace (active session) ──────────────────────────────────────────── */
function Workspace({ id, onBack }) {
  const qc = useQueryClient()
  const { data: accounts = [] } = useAccounts()
  const { data: stmt, isLoading } = useQuery({
    queryKey: ['recon-statement', id],
    queryFn: () => reconApi.get(id).then((r) => r.data.data),
    staleTime: 5_000,
  })
  const [tab, setTab] = useState('review')
  const [batchMode, setBatchMode] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [autoMatchBusy, setAutoMatchBusy] = useState(false)
  const [batchBusy, setBatchBusy] = useState(false)

  const applyUpdate = useCallback((updated) => {
    qc.setQueryData(['recon-statement', id], updated)
    setSelected(new Set())
  }, [qc, id])

  const toggleSelect = useCallback((lineRef) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(lineRef) ? next.delete(lineRef) : next.add(lineRef)
      return next
    })
  }, [])

  const toggleSelectAll = (unmatchedLines) => {
    const withProposals = unmatchedLines.filter((l) => (l.proposedMatches || l.candidates || []).length > 0)
    if (selected.size === withProposals.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(withProposals.map((l) => l.lineRef)))
    }
  }

  const runAutoMatch = async () => {
    setAutoMatchBusy(true)
    try {
      const res = await reconApi.autoMatch(id)
      const { autoMatchedCount, statement } = res.data.data
      if (autoMatchedCount > 0) {
        toast.success(`Auto-matched ${autoMatchedCount} line${autoMatchedCount > 1 ? 's' : ''} ✓`)
        applyUpdate(statement)
        qc.invalidateQueries({ queryKey: ['recon-statement', id] })
      } else {
        toast('No new high-confidence matches found', { icon: 'ℹ️' })
      }
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setAutoMatchBusy(false) }
  }

  const runBatchAccept = async () => {
    if (!selected.size) return
    setBatchBusy(true)
    try {
      const res = await reconApi.acceptBatch(id, Array.from(selected))
      const { acceptedCount, errors, statement } = res.data.data
      if (acceptedCount) toast.success(`Accepted ${acceptedCount} line${acceptedCount > 1 ? 's' : ''} ✓`)
      if (errors?.length) toast(`${errors.length} line${errors.length > 1 ? 's' : ''} could not be matched`, { icon: '⚠️' })
      applyUpdate(statement)
      qc.invalidateQueries({ queryKey: ['recon-statement', id] })
      setBatchMode(false)
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setBatchBusy(false) }
  }

  const finish = async () => {
    try {
      const res = await reconApi.finish(id)
      applyUpdate(res.data.data)
      qc.invalidateQueries({ queryKey: ['recon-sessions'] })
      toast.success('Reconciliation completed ✓')
    } catch (e) { toast.error(getErrorMessage(e)) }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-[var(--glass-panel)] animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    )
  }
  if (!stmt) return null

  const unmatched = stmt.lines?.filter((l) => l.status === 'unmatched') || []
  const done = stmt.lines?.filter((l) => l.status !== 'unmatched') || []
  const unmatchedWithProposals = unmatched.filter((l) => (l.proposedMatches || l.candidates || []).length > 0)
  const highConfCount = unmatchedWithProposals.filter((l) => {
    const top = (l.proposedMatches || l.candidates || [])[0]
    return top && top.score >= 85
  }).length

  const tabs = [
    { key: 'review', label: 'Needs Review', count: unmatched.length, warn: unmatched.length > 0 },
    { key: 'done', label: 'Reconciled', count: done.length },
    { key: 'books', label: 'In Books Only', count: stmt.unmatchedBookEntries?.length || 0 },
  ]

  return (
    <motion.div
      initial="hidden" animate="visible" variants={fadeUp}
      className="space-y-5"
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={onBack}
          className="text-sm text-[rgb(var(--c-text3))] hover:text-[rgb(var(--c-text))] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All sessions
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Auto-match */}
          {unmatched.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={runAutoMatch}
              disabled={autoMatchBusy}
              className="flex items-center gap-1.5 text-sm font-semibold px-3.5 py-1.5 rounded-xl border border-[rgb(var(--c-accent)_/_0.4)] text-[rgb(var(--c-accent))] hover:bg-[rgb(var(--c-accent)_/_0.1)] transition-all disabled:opacity-60"
            >
              {autoMatchBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Auto-Match{highConfCount > 0 ? ` (${highConfCount})` : ''}
            </motion.button>
          )}

          {/* Batch mode toggle */}
          {unmatched.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => { setBatchMode(!batchMode); setSelected(new Set()) }}
              className={`flex items-center gap-1.5 text-sm font-semibold px-3.5 py-1.5 rounded-xl border transition-all ${
                batchMode
                  ? 'border-[rgb(var(--c-highlight)_/_0.5)] text-[rgb(var(--c-highlight))] bg-[rgb(var(--c-highlight)_/_0.08)]'
                  : 'border-[var(--c-border2)] text-[rgb(var(--c-text2))] hover:border-[rgb(var(--c-text2))]'
              }`}
            >
              <ListChecks className="w-4 h-4" />
              {batchMode ? 'Cancel Batch' : 'Batch Select'}
            </motion.button>
          )}

          {/* Finish */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={finish}
            disabled={stmt.status === 'completed'}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-xl bg-[rgb(var(--c-accent))] text-[rgb(var(--c-on-accent))] hover:bg-[rgb(var(--c-accent2))] transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {stmt.status === 'completed' ? 'Completed' : 'Finish'}
          </motion.button>
        </div>
      </div>

      {/* ── Statement title ── */}
      <div>
        <h1 className="text-xl font-bold text-[rgb(var(--c-text))]">{stmt.name}</h1>
        <p className="text-sm text-[rgb(var(--c-text3))] mt-0.5">
          {stmt.bankAccountName} · {fmtDate(stmt.periodStart)} – {fmtDate(stmt.periodEnd)}
        </p>
      </div>

      {/* ── Summary ── */}
      {stmt.summary && <SummaryBar s={stmt.summary} />}

      {/* ── Batch accept bar ── */}
      <AnimatePresence>
        {batchMode && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="flex items-center justify-between gap-3 bg-[rgb(var(--c-highlight)_/_0.08)] border border-[rgb(var(--c-highlight)_/_0.3)] rounded-xl px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleSelectAll(unmatched)}
                className="text-xs text-[rgb(var(--c-highlight))] hover:underline font-medium"
              >
                {selected.size === unmatchedWithProposals.length && unmatchedWithProposals.length > 0 ? 'Deselect all' : 'Select all with proposals'}
              </button>
              <span className="text-xs text-[rgb(var(--c-text3))]">
                {selected.size} selected
              </span>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={runBatchAccept}
              disabled={batchBusy || !selected.size}
              className="flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-xl bg-[rgb(var(--c-highlight))] text-[rgb(var(--c-bg))] hover:opacity-90 transition-all disabled:opacity-40"
            >
              {batchBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Accept {selected.size > 0 ? selected.size : ''} Selected
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabs ── */}
      <div className="flex gap-0 border-b border-[var(--c-border)]">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative text-sm px-4 py-2.5 font-medium transition-colors ${
              tab === t.key
                ? 'text-[rgb(var(--c-accent))]'
                : 'text-[rgb(var(--c-text3))] hover:text-[rgb(var(--c-text2))]'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                t.warn && tab !== t.key
                  ? 'bg-[rgb(var(--c-highlight)_/_0.2)] text-[rgb(var(--c-highlight))]'
                  : 'bg-[var(--glass-panel)] text-[rgb(var(--c-text3))]'
              }`}>
                {t.count}
              </span>
            )}
            {tab === t.key && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-[rgb(var(--c-accent))]"
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        {tab === 'review' && (
          <motion.div key="review" initial="hidden" animate="visible" exit="exit" variants={stagger} className="space-y-2.5">
            {unmatched.length === 0
              ? (
                <motion.div variants={fadeUp} className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgb(var(--c-positive)_/_0.1)] flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-[rgb(var(--c-positive))]" />
                  </div>
                  <p className="font-semibold text-[rgb(var(--c-text))]">Every line is reconciled!</p>
                  <p className="text-sm text-[rgb(var(--c-text3))] mt-1">You can now finish and lock this session.</p>
                </motion.div>
              )
              : unmatched.map((l) => (
                <LineRow
                  key={l.lineRef}
                  stmtId={id}
                  line={l}
                  accounts={accounts}
                  onChange={applyUpdate}
                  batchMode={batchMode}
                  selected={selected.has(l.lineRef)}
                  onToggleSelect={toggleSelect}
                />
              ))}
          </motion.div>
        )}

        {tab === 'done' && (
          <motion.div key="done" initial="hidden" animate="visible" exit="exit" variants={stagger} className="space-y-2.5">
            {done.length === 0
              ? <p className="text-sm text-[rgb(var(--c-text3))] text-center py-12">Nothing reconciled yet.</p>
              : done.map((l) => (
                <LineRow key={l.lineRef} stmtId={id} line={l} accounts={accounts} onChange={applyUpdate} batchMode={false} selected={false} onToggleSelect={() => {}} />
              ))}
          </motion.div>
        )}

        {tab === 'books' && (
          <motion.div key="books" initial="hidden" animate="visible" exit="exit" variants={fadeUp} className="space-y-2">
            <p className="text-xs text-[rgb(var(--c-text3))]">
              These ledger entries touch this account but weren't on the statement — timing differences or not yet cleared by the bank.
            </p>
            {(stmt.unmatchedBookEntries || []).length === 0
              ? <p className="text-sm text-[rgb(var(--c-text3))] text-center py-12">Everything in your books is on the statement.</p>
              : (stmt.unmatchedBookEntries || []).map((e) => (
                <motion.div
                  key={e._id}
                  variants={cardVariant}
                  className="flex items-center justify-between bg-[var(--glass-panel)] border border-[var(--c-border)] rounded-xl px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[rgb(var(--c-text))] truncate">{e.description}</p>
                    <p className="text-xs text-[rgb(var(--c-text3))]">{fmtDate(e.date)}</p>
                  </div>
                  <p className={`text-sm font-bold tabular-nums shrink-0 ${e.direction === 'in' ? 'text-[rgb(var(--c-positive))]' : 'text-[rgb(var(--c-negative))]'}`}>
                    {e.direction === 'in' ? '+' : '−'}{money(e.amount)}
                  </p>
                </motion.div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── Session list ────────────────────────────────────────────────────────── */
function SessionList({ onOpen }) {
  const qc = useQueryClient()
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['recon-sessions'],
    queryFn: () => reconApi.list().then((r) => r.data.data),
    staleTime: 20_000,
  })

  const del = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this session? Your ledger entries are not affected.')) return
    try {
      await reconApi.remove(id)
      toast.success('Session deleted')
      qc.invalidateQueries({ queryKey: ['recon-sessions'] })
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  if (isLoading) return (
    <div className="space-y-2">
      {[...Array(2)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-[var(--glass-panel)] animate-pulse" />)}
    </div>
  )
  if (sessions.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-[rgb(var(--c-text3))] uppercase tracking-wider">Past Reconciliations</h3>
      <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-2">
        {sessions.map((s) => (
          <motion.div
            key={s._id}
            variants={cardVariant}
            onClick={() => onOpen(s._id)}
            whileHover={{ scale: 1.005, x: 2 }}
            className="flex items-center justify-between bg-[var(--glass-panel)] border border-[var(--c-border)] rounded-xl px-4 py-3.5 cursor-pointer hover:border-[var(--c-border2)] transition-colors"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[rgb(var(--c-text))] truncate">{s.name}</p>
              <p className="text-xs text-[rgb(var(--c-text3))] mt-0.5">{s.bankAccountName} · {fmtDate(s.periodEnd)}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-3">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                s.status === 'completed'
                  ? 'bg-[rgb(var(--c-positive)_/_0.12)] text-[rgb(var(--c-positive))]'
                  : 'bg-[rgb(var(--c-highlight)_/_0.12)] text-[rgb(var(--c-highlight))]'
              }`}>
                {s.status === 'completed' ? 'Done' : 'In Progress'}
              </span>
              <button
                onClick={(e) => del(s._id, e)}
                className="text-[rgb(var(--c-text3))] hover:text-[rgb(var(--c-negative))] transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

/* ── New reconciliation wizard ───────────────────────────────────────────── */
function StartReconciliation({ onStarted }) {
  const { data: accounts = [] } = useAccounts()
  const assetAccounts = accounts.filter((a) => a.accountType === 'Asset')
  const [bankAccountId, setBankAccountId] = useState('')
  const [file, setFile] = useState(null)
  const [parsed, setParsed] = useState(null)
  const [opening, setOpening] = useState('')
  const [closing, setClosing] = useState('')
  const [busy, setBusy] = useState(false)

  const inp = 'w-full text-sm border border-[var(--c-border2)] rounded-xl px-3 py-2.5 bg-[var(--glass-panel)] text-[rgb(var(--c-text))] outline-none focus:border-[rgb(var(--c-accent))] focus:ring-1 focus:ring-[rgb(var(--c-accent)_/_0.3)] transition-all'

  const onFile = async (f) => {
    if (!f) return
    setFile(f); setParsed(null); setBusy(true)
    try {
      const res = await reconApi.parse(f)
      setParsed(res.data.data)
      toast.success(`${res.data.data.count} lines read from statement`)
    } catch (e) { toast.error(getErrorMessage(e)); setFile(null) }
    finally { setBusy(false) }
  }

  const startImport = async () => {
    if (!bankAccountId) return toast.error('Select the bank account this statement belongs to')
    if (!parsed?.lines?.length) return toast.error('Upload a statement file first')
    setBusy(true)
    try {
      const res = await reconApi.import({
        bankAccountId, lines: parsed.lines, fileName: parsed.fileName,
        openingBalance: opening !== '' ? Number(opening) : undefined,
        closingBalance: closing !== '' ? Number(closing) : undefined,
      })
      toast.success('Statement imported & auto-matched ✓')
      onStarted(res.data.data._id)
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setBusy(false) }
  }

  return (
    <motion.div
      initial="hidden" animate="visible" variants={fadeUp}
      className="bg-[var(--glass-panel)] rounded-2xl border border-[var(--c-border)] p-6 shadow-[var(--shadow-card)] max-w-xl space-y-5"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[rgb(var(--c-accent)_/_0.15)] flex items-center justify-center">
          <Banknote className="w-5 h-5 text-[rgb(var(--c-accent))]" />
        </div>
        <div>
          <h2 className="font-bold text-[rgb(var(--c-text))]">Start a new reconciliation</h2>
          <p className="text-xs text-[rgb(var(--c-text3))]">Upload your bank statement and let VousFin match the books</p>
        </div>
      </div>

      {/* Account select */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[rgb(var(--c-text2))] uppercase tracking-wide">Bank / Cash Account</label>
        <select className={inp} value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)}>
          <option value="">Select account…</option>
          {assetAccounts.map((a) => <option key={a._id} value={a._id}>{a.accountName}</option>)}
        </select>
      </div>

      {/* File drop */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[rgb(var(--c-text2))] uppercase tracking-wide">Statement File (.csv, .xlsx, .xls)</label>
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[var(--c-border2)] rounded-xl py-8 cursor-pointer hover:border-[rgb(var(--c-accent))] hover:bg-[rgb(var(--c-accent)_/_0.04)] transition-all group">
          <div className="w-10 h-10 rounded-xl bg-[var(--glass-panel)] flex items-center justify-center group-hover:bg-[rgb(var(--c-accent)_/_0.1)] transition-colors">
            {busy ? <Loader2 className="w-5 h-5 animate-spin text-[rgb(var(--c-accent))]" /> : <Upload className="w-5 h-5 text-[rgb(var(--c-text3))]" />}
          </div>
          <span className="text-sm text-[rgb(var(--c-text3))]">{file ? file.name : 'Click to choose a file'}</span>
          <span className="text-xs text-[rgb(var(--c-text3))] opacity-60">Needs a Date column + Amount (or Debit/Credit)</span>
          <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
      </div>

      {/* Preview */}
      <AnimatePresence>
        {parsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[rgb(var(--c-accent)_/_0.05)] border border-[rgb(var(--c-accent)_/_0.2)] rounded-xl p-3.5 space-y-2"
          >
            <p className="text-xs font-semibold text-[rgb(var(--c-accent))] flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" /> {parsed.count} transactions found
            </p>
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {parsed.lines.slice(0, 5).map((l, i) => (
                <div key={i} className="flex justify-between text-xs text-[rgb(var(--c-text2))]">
                  <span className="truncate mr-2">{fmtDate(l.date)} · {l.description || '—'}</span>
                  <span className={l.direction === 'in' ? 'text-[rgb(var(--c-positive))]' : 'text-[rgb(var(--c-negative))]'} >
                    {l.direction === 'in' ? '+' : '−'}{money(l.amount)}
                  </span>
                </div>
              ))}
              {parsed.lines.length > 5 && (
                <p className="text-[11px] text-[rgb(var(--c-text3))]">…and {parsed.lines.length - 5} more</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Opening / closing balance */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[rgb(var(--c-text2))] uppercase tracking-wide">Opening Balance</label>
          <input type="number" className={inp} value={opening} onChange={(e) => setOpening(e.target.value)} placeholder="e.g. 100,000" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[rgb(var(--c-text2))] uppercase tracking-wide">Closing Balance</label>
          <input type="number" className={inp} value={closing} onChange={(e) => setClosing(e.target.value)} placeholder="e.g. 250,000" />
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={startImport}
        disabled={busy || !parsed}
        className="w-full flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-xl bg-[rgb(var(--c-accent))] text-[rgb(var(--c-on-accent))] hover:bg-[rgb(var(--c-accent2))] transition-colors disabled:opacity-50 shadow-[0_0_20px_-6px_rgb(var(--c-accent)_/_0.5)]"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        Import & Auto-Match
      </motion.button>
    </motion.div>
  )
}

/* ── Page shell ──────────────────────────────────────────────────────────── */
export default function BankReconciliationPage() {
  const [params, setParams] = useSearchParams()
  const id = params.get('id')
  const open = (sid) => setParams(sid ? { id: sid } : {})

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-7">
      <AnimatePresence mode="wait">
        {id ? (
          <motion.div key="workspace" initial="hidden" animate="visible" exit="exit" variants={fadeUp}>
            <Workspace id={id} onBack={() => open(null)} />
          </motion.div>
        ) : (
          <motion.div key="home" initial="hidden" animate="visible" exit="exit" variants={fadeUp} className="space-y-7">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-[rgb(var(--c-accent)_/_0.15)] flex items-center justify-center">
                  <Banknote className="w-4 h-4 text-[rgb(var(--c-accent))]" />
                </div>
                <h1 className="text-2xl font-bold text-[rgb(var(--c-text))]">Bank Reconciliation</h1>
              </div>
              <p className="text-sm text-[rgb(var(--c-text3))] ml-10">
                Match your statement against your books — VousFin does the obvious ones automatically.
              </p>
            </div>
            <StartReconciliation onStarted={open} />
            <SessionList onOpen={open} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
