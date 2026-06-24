/**
 * InternalAuditPage — Phase 6C (Internal Audit)
 *
 * One page with three sections:
 *  1. Plans — create a plan, see the list, draw a sample, raise findings
 *  2. Findings — list all findings with inline response recording
 *  3. Aging summary — open issues by age bucket and risk level
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  ClipboardCheck, Plus, ChevronDown, ChevronUp, Loader2,
  AlertTriangle, CheckCircle2, Clock, BarChart3,
} from 'lucide-react'
import internalAuditService from '@/services/internalAudit.service'
import { getErrorMessage } from '@/utils/errorHandler'

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleDateString() : '—'
const fmtAmt = (n) => n != null ? Number(n).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'

const RISK_BADGE = {
  critical: 'bg-red-500/20 text-red-400',
  high:     'bg-orange-500/20 text-orange-400',
  medium:   'bg-yellow-500/20 text-yellow-400',
  low:      'bg-green-500/20 text-green-400',
}

const STATUS_BADGE = {
  draft:       'bg-text-muted/20 text-text-muted',
  in_progress: 'bg-cyan/20 text-cyan',
  completed:   'bg-green-500/20 text-green-400',
}

const FINDING_STATUS_BADGE = {
  open:        'bg-red-500/20 text-red-400',
  in_progress: 'bg-cyan/20 text-cyan',
  resolved:    'bg-green-500/20 text-green-400',
}

// ── Create Plan Form ──────────────────────────────────────────────────────────
function CreatePlanForm({ onCreated }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '', scope: '',
    periodStart: '', periodEnd: '',
    sampleStrategy: 'risk_based', sampleSize: 10,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const mut = useMutation({
    mutationFn: () => internalAuditService.createPlan({
      ...form,
      sampleSize: Number(form.sampleSize),
    }),
    onSuccess: (res) => {
      toast.success('Audit plan created')
      setOpen(false)
      setForm({ name: '', scope: '', periodStart: '', periodEnd: '', sampleStrategy: 'risk_based', sampleSize: 10 })
      onCreated(res.data?.data)
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="btn-gradient inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold">
        <Plus className="h-3.5 w-3.5" /> New audit plan
      </button>
    )
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); mut.mutate() }}
      className="premium-card p-5 space-y-4 max-w-2xl">
      <h3 className="text-sm font-semibold text-text-primary">New audit plan</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-[11.5px] text-text-muted mb-1">Plan name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} required
            className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary focus:outline-none focus:border-cyan/40" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[11.5px] text-text-muted mb-1">Scope (what are you reviewing?)</label>
          <input value={form.scope} onChange={e => set('scope', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary focus:outline-none focus:border-cyan/40" />
        </div>
        <div>
          <label className="block text-[11.5px] text-text-muted mb-1">Period start *</label>
          <input type="date" value={form.periodStart} onChange={e => set('periodStart', e.target.value)} required
            className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary focus:outline-none focus:border-cyan/40" />
        </div>
        <div>
          <label className="block text-[11.5px] text-text-muted mb-1">Period end *</label>
          <input type="date" value={form.periodEnd} onChange={e => set('periodEnd', e.target.value)} required
            min={form.periodStart || undefined}
            className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary focus:outline-none focus:border-cyan/40" />
        </div>
        <div>
          <label className="block text-[11.5px] text-text-muted mb-1">Sample method</label>
          <select value={form.sampleStrategy} onChange={e => set('sampleStrategy', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary focus:outline-none">
            <option value="risk_based" className="bg-charcoal">Risk-based (highest amounts)</option>
            <option value="random"     className="bg-charcoal">Random</option>
          </select>
        </div>
        <div>
          <label className="block text-[11.5px] text-text-muted mb-1">Sample size (1–100)</label>
          <input type="number" min={1} max={100} step={1} value={form.sampleSize}
            onChange={e => set('sampleSize', Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary focus:outline-none focus:border-cyan/40" />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit"
          disabled={mut.isPending || !form.name.trim() || !form.periodStart || !form.periodEnd || form.periodEnd < form.periodStart}
          className="btn-gradient inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold disabled:opacity-50">
          {mut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Create
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className="px-4 py-2 rounded-lg text-[12.5px] text-text-muted hover:text-text-primary hover:bg-glass-hover">
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Raise Finding Form (small inline) ────────────────────────────────────────
function RaiseFindingForm({ planId, linkedEntityId, onRaised }) {
  const [obs, setObs] = useState('')
  const [risk, setRisk] = useState('medium')
  const [open, setOpen] = useState(false)

  const mut = useMutation({
    mutationFn: () => internalAuditService.raiseFinding({
      planId, linkedEntityId: linkedEntityId || undefined,
      linkedEntityType: linkedEntityId ? 'journalEntry' : undefined,
      observation: obs.trim(), riskRating: risk,
    }),
    onSuccess: () => {
      toast.success('Finding raised')
      setObs(''); setOpen(false)
      onRaised()
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="text-[11px] text-cyan hover:underline">
        + Raise finding
      </button>
    )
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); mut.mutate() }}
      className="mt-2 border border-glass rounded-lg p-3 bg-glass-panel/30 space-y-2">
      <textarea value={obs} onChange={e => setObs(e.target.value)} required rows={2}
        placeholder="What did you observe?"
        className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[12px] text-text-primary resize-none focus:outline-none focus:border-cyan/40" />
      <div className="flex items-center gap-2">
        <select value={risk} onChange={e => setRisk(e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-glass bg-glass-panel/40 text-[12px] text-text-primary focus:outline-none">
          {['critical','high','medium','low'].map(r => (
            <option key={r} value={r} className="bg-charcoal capitalize">{r}</option>
          ))}
        </select>
        <button type="submit" disabled={mut.isPending || !obs.trim()}
          className="btn-gradient px-3 py-1.5 rounded-lg text-[11.5px] font-semibold disabled:opacity-50">
          {mut.isPending ? <Loader2 className="h-3 w-3 animate-spin inline" /> : 'Raise'}
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className="text-[11.5px] text-text-muted hover:text-text-primary">Cancel</button>
      </div>
    </form>
  )
}

// ── Plan Card ─────────────────────────────────────────────────────────────────
function PlanCard({ plan, onFindingRaised }) {
  const qc = useQueryClient()
  const [expanded, setExpanded] = useState(false)
  const [sample, setSample] = useState(null)
  const [sampling, setSampling] = useState(false)

  const drawSample = async () => {
    setSampling(true)
    try {
      const res = await internalAuditService.drawSample(plan._id)
      setSample(res.data?.data || [])
      qc.invalidateQueries({ queryKey: ['audit-plans'] })
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setSampling(false) }
  }

  return (
    <div className="premium-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13.5px] font-semibold text-text-primary">{plan.name}</span>
            <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-semibold ${STATUS_BADGE[plan.status] || ''}`}>
              {plan.status?.replace('_', ' ')}
            </span>
          </div>
          {plan.scope && <p className="text-[11.5px] text-text-muted mt-0.5">{plan.scope}</p>}
          <p className="text-[11.5px] text-text-muted mt-1">
            {fmt(plan.periodStart)} – {fmt(plan.periodEnd)} &middot; {plan.sampleStrategy?.replace('_', '-')} &middot; size {plan.sampleSize}
          </p>
        </div>
        <button onClick={() => setExpanded(e => !e)}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-glass-hover">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="space-y-3 border-t border-glass/40 pt-3">
          <button onClick={drawSample} disabled={sampling}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan/30 text-cyan text-[12px] font-medium hover:bg-cyan/10 disabled:opacity-50">
            {sampling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BarChart3 className="h-3.5 w-3.5" />}
            Draw sample
          </button>

          {sample !== null && (
            <div className="space-y-1.5">
              <p className="text-[11px] text-text-muted uppercase tracking-wider">{sample.length} transaction(s) sampled</p>
              {sample.length === 0 && (
                <p className="text-[12px] text-text-secondary">No transactions found in this period.</p>
              )}
              {sample.map((tx) => (
                <div key={tx._id} className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-glass-panel/30 border border-glass/30">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-text-primary font-medium">{fmtAmt(tx.amount)}</span>
                      <span className="text-[10.5px] text-text-muted capitalize">{tx.transactionType}</span>
                      <span className="text-[10.5px] text-text-muted">{fmt(tx.transactionDate)}</span>
                    </div>
                    {tx.description && <p className="text-[11px] text-text-muted mt-0.5 truncate">{tx.description}</p>}
                    <RaiseFindingForm planId={plan._id} linkedEntityId={tx._id} onRaised={onFindingRaised} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Also allow raising a finding without linking a specific transaction */}
          <div className="pt-1">
            <p className="text-[11px] text-text-muted mb-1">Raise a finding without a specific transaction:</p>
            <RaiseFindingForm planId={plan._id} linkedEntityId={null} onRaised={onFindingRaised} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Record Response Form ──────────────────────────────────────────────────────
function RecordResponseForm({ finding, onDone }) {
  const [response, setResponse] = useState(finding.managementResponse || '')
  const [targetDate, setTargetDate] = useState(
    finding.targetResolutionDate ? finding.targetResolutionDate.slice(0, 10) : '',
  )
  const [status, setStatus] = useState(finding.status || 'open')

  const mut = useMutation({
    mutationFn: () => internalAuditService.recordResponse(finding._id, {
      managementResponse: response,
      targetResolutionDate: targetDate || null,
      status,
    }),
    onSuccess: () => { toast.success('Response recorded'); onDone() },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); mut.mutate() }}
      className="mt-2 border border-glass rounded-lg p-3 bg-glass-panel/30 space-y-2">
      <textarea value={response} onChange={e => setResponse(e.target.value)} rows={2}
        placeholder="Management response…"
        className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[12px] text-text-primary resize-none focus:outline-none focus:border-cyan/40" />
      <div className="flex flex-wrap items-center gap-2">
        <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-glass bg-glass-panel/40 text-[12px] text-text-primary focus:outline-none" />
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-glass bg-glass-panel/40 text-[12px] text-text-primary focus:outline-none">
          {['open','in_progress','resolved'].map(s => (
            <option key={s} value={s} className="bg-charcoal capitalize">{s.replace('_', ' ')}</option>
          ))}
        </select>
        <button type="submit" disabled={mut.isPending}
          className="btn-gradient px-3 py-1.5 rounded-lg text-[11.5px] font-semibold disabled:opacity-50">
          {mut.isPending ? <Loader2 className="h-3 w-3 animate-spin inline" /> : 'Save'}
        </button>
      </div>
    </form>
  )
}

// ── Findings Section ──────────────────────────────────────────────────────────
function FindingsSection({ refreshKey }) {
  const qc = useQueryClient()
  const [showResponse, setShowResponse] = useState(null) // findingId

  const { data: findings = [], isLoading } = useQuery({
    queryKey: ['audit-findings', refreshKey],
    queryFn: () => internalAuditService.listFindings().then(r => r.data?.data || []),
    staleTime: 30 * 1000,
  })
  const invalidate = () => qc.invalidateQueries({ queryKey: ['audit-findings'] })

  if (isLoading) return <div className="premium-card h-24 animate-pulse" />

  return (
    <div className="space-y-2">
      {findings.length === 0 && (
        <p className="text-[13px] text-text-secondary">No findings yet. Draw a sample from a plan to raise findings.</p>
      )}
      {findings.map(f => (
        <div key={f._id} className="premium-card p-3.5 space-y-2">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-semibold ${RISK_BADGE[f.riskRating] || ''}`}>
                  {f.riskRating}
                </span>
                <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-semibold ${FINDING_STATUS_BADGE[f.status] || ''}`}>
                  {f.status?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[13px] text-text-primary mt-1">{f.observation}</p>
              {f.managementResponse && (
                <p className="text-[11.5px] text-text-muted mt-1 italic">Response: {f.managementResponse}</p>
              )}
              {f.targetResolutionDate && (
                <p className="text-[11px] text-text-muted">Target: {fmt(f.targetResolutionDate)}</p>
              )}
            </div>
            <button onClick={() => setShowResponse(showResponse === f._id ? null : f._id)}
              className="text-[11px] text-cyan hover:underline shrink-0">
              {showResponse === f._id ? 'Cancel' : 'Respond'}
            </button>
          </div>
          {showResponse === f._id && (
            <RecordResponseForm finding={f} onDone={() => { setShowResponse(null); invalidate() }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Aging Section ─────────────────────────────────────────────────────────────
function AgingSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['audit-aging'],
    queryFn: () => internalAuditService.aging().then(r => r.data?.data),
    staleTime: 60 * 1000,
  })

  if (isLoading) return <div className="premium-card h-32 animate-pulse" />
  if (!data) return null

  const BUCKETS = ['0-30', '31-60', '61-90', '90+']
  const BUCKET_LABELS = { '0-30': '0–30 days', '31-60': '31–60 days', '61-90': '61–90 days', '90+': 'Over 90 days' }
  const BUCKET_COLOR  = { '0-30': 'text-green-400', '31-60': 'text-yellow-400', '61-90': 'text-orange-400', '90+': 'text-red-400' }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {BUCKETS.map(b => (
          <div key={b} className="premium-card p-3 text-center">
            <p className={`text-2xl font-bold ${BUCKET_COLOR[b]}`}>{data.buckets[b]?.length ?? 0}</p>
            <p className="text-[11px] text-text-muted mt-1">{BUCKET_LABELS[b]}</p>
          </div>
        ))}
      </div>
      <div className="premium-card p-4">
        <p className="text-[11.5px] text-text-muted uppercase tracking-wider mb-3">By risk level</p>
        <div className="flex flex-wrap gap-4">
          {['critical','high','medium','low'].map(r => (
            <div key={r} className="flex items-center gap-1.5">
              <span className={`inline-block w-2 h-2 rounded-full ${
                r === 'critical' ? 'bg-red-400' : r === 'high' ? 'bg-orange-400' :
                r === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
              }`} />
              <span className="text-[12px] text-text-primary capitalize">{r}</span>
              <span className="text-[12px] text-text-muted">{data.byRisk[r] ?? 0}</span>
            </div>
          ))}
        </div>
        <p className="text-[11.5px] text-text-muted mt-3">Total open: <span className="text-text-primary font-medium">{data.total}</span></p>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function InternalAuditPage() {
  const qc = useQueryClient()
  const [findingRefresh, setFindingRefresh] = useState(0)
  const bumpFindings = () => setFindingRefresh(n => n + 1)

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['audit-plans'],
    queryFn: () => internalAuditService.listPlans().then(r => r.data?.data || []),
    staleTime: 60 * 1000,
  })

  const handlePlanCreated = () => {
    qc.invalidateQueries({ queryKey: ['audit-plans'] })
  }

  return (
    <div className="animate-fade-in pb-10 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-cyan/15">
          <ClipboardCheck className="h-5 w-5 text-cyan" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Internal audit</h1>
          <p className="text-sm text-text-secondary mt-0.5">Plan reviews, sample transactions, raise findings and track responses.</p>
        </div>
      </div>

      {/* ── Plans section ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-text-muted" />
            <h2 className="text-base font-semibold text-text-primary">Audit plans</h2>
          </div>
          <CreatePlanForm onCreated={handlePlanCreated} />
        </div>

        {plansLoading ? (
          <div className="space-y-2">{[1,2].map(i => <div key={i} className="premium-card h-16 animate-pulse" />)}</div>
        ) : plans.length === 0 ? (
          <p className="text-[13px] text-text-secondary">No audit plans yet. Create one to get started.</p>
        ) : (
          <div className="space-y-3">
            {plans.map(p => (
              <PlanCard key={p._id} plan={p} onFindingRaised={() => { bumpFindings(); qc.invalidateQueries({ queryKey: ['audit-aging'] }) }} />
            ))}
          </div>
        )}
      </section>

      {/* ── Findings section ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-text-muted" />
          <h2 className="text-base font-semibold text-text-primary">Findings</h2>
        </div>
        <FindingsSection refreshKey={findingRefresh} />
      </section>

      {/* ── Aging section ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-text-muted" />
          <h2 className="text-base font-semibold text-text-primary">Open-issue aging</h2>
          <span className="text-[11px] text-text-muted">(how long unresolved findings have been open)</span>
        </div>
        <AgingSection />
      </section>
    </div>
  )
}
