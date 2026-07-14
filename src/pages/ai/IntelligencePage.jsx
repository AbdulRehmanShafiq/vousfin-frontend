import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Brain, Sparkles, Gauge, ClipboardCheck, ScrollText, Check, X, Undo2,
  TrendingUp, AlertTriangle, ChevronRight, Info,
} from 'lucide-react'
import toast from 'react-hot-toast'
import aiDecisionService from '@/services/aiDecision.service'
import autonomyService from '@/services/autonomy.service'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { getErrorMessage } from '@/utils/errorHandler'

/*
 * IntelligencePage — the window into VousFin's brain (Intelligence Roadmap).
 * Route: /ai/intelligence. Surfaces the advisor feed (Phase 4), the automation
 * scorecard + close readiness (Phase 3), and the AI decision ledger with
 * plain-language explanations and one-click accept/correct/reverse (Phase 0/2),
 * plus measured calibration (Phase 1).
 */

const SEVERITY_VARIANT = { critical: 'danger', high: 'warning', medium: 'info', info: 'default' }
const OUTCOME_VARIANT = { pending: 'warning', accepted: 'success', corrected: 'info', reversed: 'danger' }
const pct = (n) => (n === null || n === undefined ? '—' : `${Math.round(n * 100)}%`)

function SectionTitle({ icon: Icon, title, hint }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-4 w-4 text-accent" />
      <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-text-secondary">{title}</h2>
      {hint && <span className="text-xs text-text-muted">· {hint}</span>}
    </div>
  )
}

function AdvisorFeed() {
  const { data, isLoading } = useQuery({
    queryKey: ['advisor-recommendations'],
    queryFn: () => aiDecisionService.recommendations().then((r) => r.data.data),
  })
  const recs = data?.recommendations || []
  return (
    <div>
      <SectionTitle icon={Sparkles} title="What your numbers say" hint="proactive advice" />
      {isLoading ? (
        <Card><div className="h-16 animate-pulse rounded bg-glass-panel" /></Card>
      ) : recs.length === 0 ? (
        <Card><p className="text-sm text-text-muted">Nothing needs your attention right now — cash, receivables, health and automation all look fine.</p></Card>
      ) : (
        <div className="space-y-2">
          {recs.map((r) => (
            <Card key={r.id} className="flex items-start gap-3">
              <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${r.severity === 'critical' ? 'text-negative' : r.severity === 'high' ? 'text-highlight-2' : 'text-accent'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-text-primary">{r.title}</p>
                  <Badge variant={SEVERITY_VARIANT[r.severity]}>{r.severity}</Badge>
                </div>
                <p className="mt-1 text-sm text-text-muted">{r.why}</p>
                {r.action?.link && (
                  <a href={r.action.link} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline">
                    {r.action.label} <ChevronRight className="h-3 w-3" />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function WhatIfBox() {
  const [q, setQ] = useState('')
  const [answer, setAnswer] = useState(null)
  const [busy, setBusy] = useState(false)
  const ask = async () => {
    if (!q.trim()) return
    setBusy(true)
    try { setAnswer((await aiDecisionService.whatIf(q)).data.data) }
    catch (e) { toast.error(getErrorMessage(e)) }
    finally { setBusy(false) }
  }
  return (
    <div>
      <SectionTitle icon={TrendingUp} title="Ask a what-if" hint="grounded in your real numbers" />
      <Card>
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ask()}
            placeholder="Can I afford to hire 2 people at Rs 60,000 each?"
            className="flex-1 rounded-lg border border-glass bg-glass-panel px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40" />
          <Button className="!px-4 !py-2" disabled={busy} onClick={ask}>Ask</Button>
        </div>
        {answer && (
          <p className={`mt-3 text-sm ${answer.understood ? 'text-text-secondary' : 'text-text-muted'}`}>{answer.answer}</p>
        )}
      </Card>
    </div>
  )
}

function ScorecardStrip() {
  const { data: stp } = useQuery({ queryKey: ['stp-scorecard'], queryFn: () => autonomyService.getStpScorecard(90).then((r) => r.data.data) })
  const { data: readiness } = useQuery({ queryKey: ['close-readiness'], queryFn: () => autonomyService.getCloseReadiness().then((r) => r.data.data) })
  const caps = [
    ['Auto-posted', stp?.posting?.rate],
    ['Auto-matched', stp?.matching?.rate],
    ['Auto-reconciled', stp?.reconciliation?.rate],
    ['Auto-categorized', stp?.categorization?.rate],
  ]
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <SectionTitle icon={Gauge} title="Automation depth" hint="last 90 days" />
        <Card>
          <div className="flex items-baseline gap-2">
            <span className="num text-3xl font-semibold text-text-primary">{pct(stp?.stpScore)}</span>
            <span className="text-xs text-text-muted">of the work VousFin did by itself</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {caps.map(([label, rate]) => (
              <div key={label} className="rounded-lg bg-glass-panel px-3 py-2">
                <p className="text-label uppercase tracking-wide text-text-muted">{label}</p>
                <p className="num text-lg font-semibold text-text-primary">{pct(rate)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div>
        <SectionTitle icon={ClipboardCheck} title="Close readiness" hint={readiness?.period?.name || 'current period'} />
        <Card>
          {!readiness?.closeable ? (
            <p className="text-sm text-text-muted">No period is ready to close yet.</p>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="num text-3xl font-semibold text-text-primary">{readiness.score}%</span>
                <Badge variant={readiness.ready ? 'success' : 'warning'}>{readiness.ready ? 'Ready to close' : 'Not ready'}</Badge>
              </div>
              <div className="mt-3 space-y-1.5">
                {(readiness.checks || []).map((c) => (
                  <div key={c.key} className="flex items-center gap-2 text-sm">
                    {c.ok ? <Check className="h-4 w-4 text-positive" /> : <X className="h-4 w-4 text-negative" />}
                    <span className={c.ok ? 'text-text-muted' : 'text-text-primary'}>{c.label}</span>
                    {!c.ok && c.count > 0 && <span className="text-xs text-highlight-2">({c.count})</span>}
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

function CalibrationStat() {
  const { data } = useQuery({ queryKey: ['ai-stats'], queryFn: () => aiDecisionService.stats().then((r) => r.data.data) })
  if (!data) return null
  const s = data.stats || {}
  return (
    <Card className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <span className="flex items-center gap-1.5 text-text-muted"><Info className="h-4 w-4" /> Measured from your history:</span>
      <span><b className="text-text-primary">{pct(s.acceptanceRate)}</b> <span className="text-text-muted">accepted as-is</span></span>
      <span><b className="text-text-primary">{pct(s.correctionRate)}</b> <span className="text-text-muted">corrected</span></span>
      <span><b className="text-text-primary">{pct(s.reversalRate)}</b> <span className="text-text-muted">reversed</span></span>
      <span className="text-text-muted">Auto-record fires at <b className="text-text-primary">{pct(data.effectiveAutoPostThreshold)}</b> confidence</span>
    </Card>
  )
}

function DecisionRow({ d, onChanged }) {
  const [open, setOpen] = useState(false)
  const [explanation, setExplanation] = useState(null)
  const [busy, setBusy] = useState(false)

  const toggle = async () => {
    const next = !open
    setOpen(next)
    if (next && !explanation) {
      try { setExplanation((await aiDecisionService.explain(d._id)).data.data.explanation) }
      catch (e) { toast.error(getErrorMessage(e)) }
    }
  }
  const act = async (outcome) => {
    setBusy(true)
    try {
      await aiDecisionService.setOutcome(d._id, outcome)
      toast.success(outcome === 'reversed' ? 'Marked as reversed' : `Marked as ${outcome}`)
      onChanged()
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setBusy(false) }
  }

  return (
    <Card noPadding className="overflow-hidden">
      <button onClick={toggle} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-glass-hover">
        <Badge variant="default">{d.kind}</Badge>
        <span className="min-w-0 flex-1 truncate text-sm text-text-primary">{d.inputsSummary}</span>
        {d.confidence != null && <span className="num text-xs text-text-muted">{pct(d.confidence)}</span>}
        <Badge variant={OUTCOME_VARIANT[d.outcome] || 'default'}>{d.outcome}</Badge>
        <ChevronRight className={`h-4 w-4 text-text-muted transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-glass px-4 py-3">
          <p className="text-sm text-text-secondary">{explanation ? explanation.text : 'Loading explanation…'}</p>
          {d.outcome === 'pending' && (
            <div className="mt-3 flex gap-2">
              <Button className="!px-3 !py-1.5 !text-xs" disabled={busy} onClick={() => act('accepted')}><Check className="mr-1 h-3.5 w-3.5" /> Accept</Button>
              <Button variant="secondary" className="!px-3 !py-1.5 !text-xs" disabled={busy} onClick={() => act('corrected')}><Undo2 className="mr-1 h-3.5 w-3.5" /> Correct</Button>
              <Button variant="ghost" className="!px-3 !py-1.5 !text-xs" disabled={busy} onClick={() => act('reversed')}><X className="mr-1 h-3.5 w-3.5" /> Reverse</Button>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

function DecisionLedger() {
  const qc = useQueryClient()
  const [kind, setKind] = useState('')
  const { data, isLoading } = useQuery({
    queryKey: ['ai-decisions', kind],
    queryFn: () => aiDecisionService.list(kind ? { kind } : {}).then((r) => r.data.data),
  })
  const decisions = data?.data || []
  const kinds = ['', 'parse', 'classify', 'recommend', 'match', 'reconcile']
  return (
    <div>
      <SectionTitle icon={ScrollText} title="AI decision ledger" hint="every AI action, explained" />
      <div className="mb-2 flex flex-wrap gap-1.5">
        {kinds.map((k) => (
          <button key={k || 'all'} onClick={() => setKind(k)}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold ${kind === k ? 'bg-accent text-black' : 'bg-glass-panel text-text-muted hover:text-text-primary'}`}>
            {k || 'All'}
          </button>
        ))}
      </div>
      {isLoading ? (
        <Card><div className="h-16 animate-pulse rounded bg-glass-panel" /></Card>
      ) : decisions.length === 0 ? (
        <EmptyState icon={Brain} title="No AI decisions yet" description="Once VousFin reads a transaction, matches a bill, or gives advice, every decision shows up here with its reasoning." />
      ) : (
        <div className="space-y-2">
          {decisions.map((d) => (
            <DecisionRow key={d._id} d={d} onChanged={() => qc.invalidateQueries({ queryKey: ['ai-decisions'] })} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function IntelligencePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-1">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft">
          <Brain className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Intelligence</h1>
          <p className="text-sm text-text-muted">What VousFin sees, decides, and recommends — with the reasoning behind it.</p>
        </div>
      </div>
      <CalibrationStat />
      <AdvisorFeed />
      <WhatIfBox />
      <ScorecardStrip />
      <DecisionLedger />
    </div>
  )
}
