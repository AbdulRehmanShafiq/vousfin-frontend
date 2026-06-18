/**
 * CommandCenterPage — the one inbox (Autonomy roadmap Phase 0).
 *
 * Everything that needs you (and what VousFin is doing for you) in one place:
 * actionable proposed actions (approve / dismiss) first, then the insights it's
 * surfacing. Plus the autonomy dials — how much you trust each capability to act.
 */
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Brain, CheckCircle2, AlertTriangle, AlertCircle, Info, ArrowUpRight,
  Check, X, Sparkles, RefreshCw, Receipt, Loader2, Send, Play, ListChecks, ImagePlus,
} from 'lucide-react'
import {
  useAutonomyInbox, useAutonomyReport, useSetCapability,
  useApproveAction, useRejectAction, useIngestDocument, useAutonomyScan,
  usePlans, useRunPlan, useAutonomyControl,
} from '@/hooks/useAutonomy'
import { cn } from '@/utils/cn'

/* ── Autonomy dials ─────────────────────────────────────────────────────── */
const CAP_LABEL = {
  bookkeeping: 'Bookkeeping', reconciliation: 'Reconciliation', collections: 'Collections',
  payments: 'Payments', tax: 'Tax', close: 'Month-end close', advisory: 'Advisory',
}
const LEVELS = [
  { v: 'observe',   l: 'Observe' },
  { v: 'suggest',   l: 'Suggest' },
  { v: 'copilot',   l: 'Co-pilot' },
  { v: 'autopilot', l: 'Autopilot' },
]
const LEVEL_TONE = {
  observe:   'text-text-muted',
  suggest:   'text-cyan',
  copilot:   'text-amber',
  autopilot: 'text-positive',
}
const LEVEL_NAME = Object.fromEntries(LEVELS.map(o => [o.v, o.l]))

function AutonomyDials() {
  const { data: report, isLoading } = useAutonomyReport()
  const setCap = useSetCapability()
  const caps = report?.capabilities || []
  const summary = report?.summary || {}

  return (
    <div className="premium-card p-5">
      <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan/15"><Sparkles className="h-4 w-4 text-cyan" /></div>
          <div>
            <h2 className="text-sm font-bold text-text-primary">How much VousFin acts for you</h2>
            <p className="text-[12.5px] text-text-muted">Turn each area up as you trust it. Everything starts at “Suggest”.</p>
          </div>
        </div>
        {summary.totalDecisions > 0 ? (
          <div className="text-right shrink-0">
            <p className="num text-base font-bold text-positive leading-none">{Math.round((summary.accuracy || 0) * 100)}%</p>
            <p className="text-[12px] text-text-muted mt-0.5">accurate · {summary.totalDecisions} reviewed</p>
          </div>
        ) : (
          <p className="text-[11.5px] text-text-muted max-w-[220px] text-right">As you approve or dismiss, VousFin learns and suggests where to trust it more.</p>
        )}
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-glass-panel animate-pulse" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3">
          {caps.map((c) => (
            <div key={c.capability} className="px-3 py-2 rounded-xl border border-glass bg-glass-panel/40">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-medium text-text-secondary">{CAP_LABEL[c.capability]}</span>
                <select
                  value={c.level}
                  onChange={(e) => setCap.mutate({ capability: c.capability, level: e.target.value })}
                  className={cn('bg-transparent text-[12.5px] font-bold focus:outline-none cursor-pointer', LEVEL_TONE[c.level])}
                >
                  {LEVELS.map(o => <option key={o.v} value={o.v} className="bg-charcoal text-text-primary">{o.l}</option>)}
                </select>
              </div>
              {c.total > 0 && (
                <p className="text-[11px] text-text-muted mt-1">{Math.round((c.accuracy || 0) * 100)}% accurate · {c.total} decisions</p>
              )}
              {c.recommendation && (
                <button
                  type="button"
                  onClick={() => setCap.mutate({ capability: c.capability, level: c.recommendation.to })}
                  title={c.recommendation.reason}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-semibold text-cyan hover:underline"
                >
                  <ArrowUpRight className="h-3 w-3" /> Try {LEVEL_NAME[c.recommendation.to]}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Inbox items ────────────────────────────────────────────────────────── */
const INSIGHT_TONE = {
  critical: { Icon: AlertTriangle, border: 'border-negative/25', bg: 'bg-negative/8', text: 'text-negative' },
  warning:  { Icon: AlertCircle,   border: 'border-amber/25',    bg: 'bg-amber/8',    text: 'text-amber' },
  info:     { Icon: Info,          border: 'border-cyan/20',     bg: 'bg-cyan/6',     text: 'text-cyan' },
}

function InsightCard({ item }) {
  const tone = INSIGHT_TONE[item.level] || INSIGHT_TONE.info
  const body = (
    <div className={cn('flex items-start gap-2.5 p-3.5 rounded-xl border h-full', tone.bg, tone.border)}>
      <tone.Icon className={cn('h-4 w-4 shrink-0 mt-0.5', tone.text)} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-text-primary leading-snug">{item.title}</p>
        {item.summary && <p className="text-[12.5px] text-text-secondary leading-relaxed mt-0.5">{item.summary}</p>}
        {item.actionTo && (
          <span className="inline-flex items-center gap-1 text-[12.5px] text-cyan font-medium mt-1.5">
            {item.actionLabel || 'Open'} <ArrowUpRight className="h-3 w-3" />
          </span>
        )}
      </div>
      <span className="text-[10.5px] uppercase tracking-wider text-text-muted shrink-0">{item.capability}</span>
    </div>
  )
  return item.actionTo ? <Link to={item.actionTo} className="block group">{body}</Link> : <div>{body}</div>
}

function ActionCard({ item }) {
  const approve = useApproveAction()
  const reject = useRejectAction()
  return (
    <div className="premium-card p-4 flex items-start gap-3">
      <div className="p-2 rounded-xl bg-positive/12 shrink-0"><Brain className="h-4 w-4 text-positive" /></div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-text-primary leading-tight">{item.title}</p>
          <span className="text-[10.5px] uppercase tracking-wider text-text-muted">{item.capability}</span>
          {item.confidence != null && (
            <span className="text-[11px] font-bold text-cyan">{Math.round(item.confidence * 100)}% sure</span>
          )}
        </div>
        {item.summary && <p className="text-[12.5px] text-text-secondary mt-0.5">{item.summary}</p>}
        <div className="flex items-center gap-2 mt-2.5">
          <button onClick={() => approve.mutate(item.id)} disabled={approve.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-positive/12 text-positive text-[12.5px] font-semibold hover:bg-positive/20 transition-colors disabled:opacity-50">
            <Check className="h-3.5 w-3.5" /> Approve
          </button>
          <button onClick={() => reject.mutate(item.id)} disabled={reject.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-text-muted text-[12.5px] font-semibold hover:bg-glass-hover transition-colors disabled:opacity-50">
            <X className="h-3.5 w-3.5" /> Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

/* Downscale a photo in the browser → base64 JPEG, so big phone snaps upload fast. */
function fileToImage(file, maxDim = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale), h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      resolve({ base64: dataUrl.split(',')[1], mimeType: 'image/jpeg', preview: dataUrl })
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')) }
    img.src = url
  })
}

/* ── Hand it to your bookkeeper ─────────────────────────────────────────── */
function BookkeeperIntake() {
  const [text, setText] = useState('')
  const [photo, setPhoto] = useState(null) // { base64, mimeType, preview }
  const fileRef = useRef(null)
  const ingest = useIngestDocument()

  const pickPhoto = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image'); return }
    try { setPhoto(await fileToImage(file)) } catch { toast.error('Could not read that image') }
  }

  const submit = (e) => {
    e.preventDefault()
    if (ingest.isPending) return
    const rawText = text.trim()
    if (!rawText && !photo) return
    const payload = photo
      ? { image: photo.base64, mimeType: photo.mimeType, source: 'upload', rawText }
      : { rawText, source: 'manual' }
    ingest.mutate(payload, { onSuccess: (d) => { if (d?.action) { setText(''); setPhoto(null) } } })
  }

  return (
    <form onSubmit={submit} className="premium-card p-5">
      <div className="flex items-center gap-2.5 mb-1">
        <div className="p-1.5 rounded-lg bg-positive/15"><Receipt className="h-4 w-4 text-positive" /></div>
        <div>
          <h2 className="text-sm font-bold text-text-primary">Hand it to your bookkeeper</h2>
          <p className="text-[12.5px] text-text-muted">Snap a photo of a bill, or type it — VousFin reads it and writes the entry for you.</p>
        </div>
      </div>

      {photo ? (
        <div className="relative mt-3">
          <img src={photo.preview} alt="bill to read" className="max-h-40 w-auto rounded-xl border border-glass" />
          <button type="button" onClick={() => setPhoto(null)} aria-label="Remove photo"
            className="absolute top-1.5 left-1.5 p-1 rounded-md bg-charcoal/80 text-text-secondary hover:text-text-primary">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder='e.g. "Paid Rs 50,000 office rent to ABC Properties on 1 June"'
          className="w-full mt-3 px-3 py-2.5 rounded-xl border border-glass bg-glass-panel/40 text-[13px] text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:border-cyan/40 resize-none"
        />
      )}

      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={pickPhoto} className="hidden" />

      <div className="flex items-center justify-between gap-3 mt-2.5">
        <button type="button" onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-muted hover:text-cyan transition-colors">
          <ImagePlus className="h-3.5 w-3.5" /> {photo ? 'Change photo' : 'Add a photo'}
        </button>
        <button type="submit" disabled={(!text.trim() && !photo) || ingest.isPending}
          className="btn-gradient inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold shrink-0">
          {ingest.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {ingest.isPending ? 'Reading…' : 'Read it'}
        </button>
      </div>
      <p className="text-[11.5px] text-text-muted mt-2">It won’t touch your books until you approve — unless you’ve dialed Bookkeeping up.</p>
    </form>
  )
}

/* ── The plain-language control line ───────────────────────────────────── */
function ControlLine() {
  const [text, setText] = useState('')
  const control = useAutonomyControl()
  const submit = (e) => {
    e.preventDefault()
    const t = text.trim()
    if (!t || control.isPending) return
    control.mutate(t, { onSuccess: (d) => { if (d?.understood) setText('') } })
  }
  return (
    <form onSubmit={submit} className="premium-card p-3.5">
      <div className="flex items-center gap-2.5">
        <Brain className="h-4 w-4 text-cyan shrink-0" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Tell VousFin what to do — e.g. "set tax to autopilot" or "don’t pay ACME for now"'
          className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-muted/70 focus:outline-none"
        />
        <button type="submit" disabled={!text.trim() || control.isPending} aria-label="Send command"
          className="p-1.5 rounded-lg bg-cyan/15 text-cyan hover:bg-cyan/25 transition-colors disabled:opacity-40">
          {control.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </form>
  )
}

/* ── Routines (the orchestrator) + the observable plan ─────────────────── */
function Routines() {
  const { data } = usePlans()
  const run = useRunPlan()
  const playbooks = data?.playbooks || []
  const latest = data?.latest
  const STEP_TONE = { done: 'text-positive', failed: 'text-negative', pending: 'text-text-muted' }

  return (
    <div className="premium-card p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="p-1.5 rounded-lg bg-amber/15"><ListChecks className="h-4 w-4 text-amber" /></div>
        <div>
          <h2 className="text-sm font-bold text-text-primary">Run a routine</h2>
          <p className="text-[12.5px] text-text-muted">Let the team work a whole cycle at once — it all still comes back here for your OK.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {playbooks.map(pb => (
          <button key={pb.key} onClick={() => run.mutate(pb.key)} disabled={run.isPending} title={pb.description}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-glass bg-glass-panel/40 text-[12.5px] font-semibold text-text-secondary hover:border-amber/40 hover:text-text-primary transition-colors disabled:opacity-50">
            {run.isPending && run.variables === pb.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 text-amber" />}
            {pb.name}
          </button>
        ))}
      </div>

      {latest && (
        <div className="mt-4 pt-3 border-t border-glass">
          <p className="text-[11.5px] uppercase tracking-wider text-text-muted mb-2">
            Last run · {latest.name}{latest.totalProposed > 0 ? ` · surfaced ${latest.totalProposed}` : ' · all clear'}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {(latest.steps || []).map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-[12px]">
                <span className={cn('h-1.5 w-1.5 rounded-full', s.status === 'done' ? 'bg-positive' : s.status === 'failed' ? 'bg-negative' : 'bg-text-muted')} />
                <span className="text-text-secondary">{s.label}</span>
                <span className={cn('font-semibold', STEP_TONE[s.status] || 'text-text-muted')}>{s.proposed > 0 ? s.proposed : '✓'}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function CommandCenterPage() {
  const { data, isLoading, isError, isFetching, refetch } = useAutonomyInbox()
  const scan = useAutonomyScan()
  const items = data?.items || []
  const counts = data?.counts || {}
  const actions  = items.filter(i => i.kind === 'action')
  const insights = items.filter(i => i.kind === 'insight')

  // On open, quietly let the agents look for reconciliation + collections work.
  const scannedOnce = useRef(false)
  useEffect(() => {
    if (scannedOnce.current) return
    scannedOnce.current = true
    scan.mutate()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const busy = isFetching || scan.isPending
  const refreshAll = () => { scan.mutate(); refetch() }

  return (
    <div className="animate-fade-in pb-10 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Command Center</h1>
          <p className="text-sm text-text-secondary mt-1">Everything that needs you — and what VousFin is handling for you.</p>
        </div>
        <button onClick={refreshAll} aria-label="Refresh" disabled={busy}
          className="p-2 rounded-lg border border-glass text-text-muted hover:text-cyan hover:border-cyan/40 transition-colors disabled:opacity-50">
          <RefreshCw className={cn('h-4 w-4', busy && 'animate-spin')} />
        </button>
      </div>

      <ControlLine />

      <AutonomyDials />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BookkeeperIntake />
        <Routines />
      </div>

      {/* Waiting for you */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[12.5px] font-bold uppercase tracking-widest text-text-muted">Waiting for you</span>
          {counts.actions > 0 && <span className="text-[12px] font-bold text-positive">{counts.actions}</span>}
          <div className="flex-1 h-px bg-glass" />
        </div>
        {isLoading ? (
          <div className="space-y-3">{[1, 2].map(i => <div key={i} className="premium-card h-20 animate-pulse" />)}</div>
        ) : actions.length === 0 ? (
          <div className="premium-card p-5 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-positive shrink-0" />
            <p className="text-[13px] text-text-secondary">Nothing needs your approval right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 stagger-rise">{actions.map(a => <ActionCard key={a.id} item={a} />)}</div>
        )}
      </div>

      {/* Worth knowing */}
      {(insights.length > 0 || !isLoading) && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[12.5px] font-bold uppercase tracking-widest text-text-muted">Worth knowing</span>
            <div className="flex-1 h-px bg-glass" />
          </div>
          {isError ? (
            <div className="premium-card p-5 text-center">
              <p className="text-sm text-negative">Couldn’t load right now.</p>
              <button onClick={() => refetch()} className="mt-1.5 text-sm text-cyan font-semibold hover:underline">Try again</button>
            </div>
          ) : insights.length === 0 ? (
            <div className="premium-card p-5 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-positive shrink-0" />
              <p className="text-[13px] text-text-secondary">All clear — we checked your spending, cash flow, tax and forecast.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-rise">
              {insights.map(i => <InsightCard key={i.id} item={i} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
