/**
 * CalendarPage — FR-10.1 Compliance Calendar
 * Filing deadlines and obligation tracking for Pakistan/FBR obligations.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { CalendarDays, RefreshCw, CheckCircle2, Loader2, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react'
import complianceService from '@/services/compliance.service'
import { getErrorMessage } from '@/utils/errorHandler'
import SelectField from '@/components/ui/SelectField'

const STATUS_BADGE = {
  pending:   'bg-highlight/15 text-highlight border border-highlight/20',
  completed: 'bg-positive/15 text-positive border border-positive/20',
  overdue:   'bg-red-500/15 text-red-400 border border-red-500/20',
  waived:    'bg-slate-500/15 text-slate-400 border border-slate-500/20',
}

const CAT_BADGE = {
  tax:       'bg-blue-500/10 text-blue-400',
  corporate: 'bg-purple-500/10 text-purple-400',
  labour:    'bg-teal-500/10 text-teal-400',
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1]
const MONTHS = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function CalendarPage() {
  const qc = useQueryClient()
  const [year, setYear] = useState(CURRENT_YEAR)
  const [monthFilter, setMonthFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  // Complete dialog state
  const [completeTarget, setCompleteTarget] = useState(null)
  const [refNumber, setRefNumber] = useState('')
  const [refNotes, setRefNotes] = useState('')

  const invalidate = () => qc.invalidateQueries({ queryKey: ['compliance-obligations'] })

  const { data: obligations = [], isLoading } = useQuery({
    queryKey: ['compliance-obligations', year, monthFilter, statusFilter],
    queryFn: () => complianceService.listObligations({
      year,
      ...(monthFilter ? { month: monthFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    }).then(r => r.data?.data || []),
    staleTime: 60_000,
  })

  const generate = useMutation({
    mutationFn: () => complianceService.generateObligations(year),
    onSuccess: (r) => { invalidate(); toast.success(`Generated ${r.data?.data?.generated || 0} obligations for ${year}`) },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const checkOverdue = useMutation({
    mutationFn: () => complianceService.checkOverdue(),
    onSuccess: (r) => { invalidate(); toast.success(`Marked ${r.data?.data?.marked || 0} obligations as overdue`) },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const complete = useMutation({
    mutationFn: ({ id }) => complianceService.completeObligation(id, { referenceNumber: refNumber, notes: refNotes }),
    onSuccess: () => { invalidate(); setCompleteTarget(null); setRefNumber(''); setRefNotes(''); toast.success('Obligation marked complete') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const waive = useMutation({
    mutationFn: ({ id, notes }) => complianceService.waiveObligation(id, { notes }),
    onSuccess: () => { invalidate(); toast.success('Obligation waived') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  // Retention policies section at bottom
  const { data: policies = [] } = useQuery({
    queryKey: ['retention-policies'],
    queryFn: () => complianceService.listPolicies().then(r => r.data?.data || []),
    staleTime: 300_000,
  })

  return (
    <div className="animate-fade-in pb-10 space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-accent/15"><CalendarDays className="h-5 w-5 text-accent" /></div>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Compliance Calendar</h1>
          <p className="text-sm text-text-secondary mt-0.5">Your filing deadlines and regulatory obligations — Pakistan/FBR focused.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="premium-card p-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <SelectField label="Year" value={year} onChange={e => setYear(Number(e.target.value))} className="w-auto">
            {YEARS.map(y => <option key={y} value={y} className="bg-charcoal">{y}</option>)}
          </SelectField>
        </div>
        <div className="flex flex-col gap-1">
          <SelectField label="Month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="w-auto">
            <option value="" className="bg-charcoal">All months</option>
            {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1} className="bg-charcoal">{m}</option>)}
          </SelectField>
        </div>
        <div className="flex flex-col gap-1">
          <SelectField label="Status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-auto">
            <option value="" className="bg-charcoal">All statuses</option>
            {['pending','completed','overdue','waived'].map(s => <option key={s} value={s} className="bg-charcoal capitalize">{s}</option>)}
          </SelectField>
        </div>
        <div className="flex gap-2 ml-auto">
          <button onClick={() => checkOverdue.mutate()} disabled={checkOverdue.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-glass text-small text-text-secondary hover:text-text-primary hover:bg-glass-hover disabled:opacity-50">
            {checkOverdue.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Check overdue
          </button>
          <button onClick={() => generate.mutate()} disabled={generate.isPending}
            className="btn-gradient inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-small font-semibold disabled:opacity-50">
            {generate.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CalendarDays className="h-3.5 w-3.5" />} Generate {year}
          </button>
        </div>
      </div>

      {/* Complete modal */}
      {completeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="premium-card p-6 w-full max-w-md space-y-4">
            <h2 className="text-base font-semibold text-text-primary">Mark complete — {completeTarget.template?.name || completeTarget.code}</h2>
            <div className="space-y-3">
              <input value={refNumber} onChange={e => setRefNumber(e.target.value)} placeholder="Reference / filing number (optional)"
                className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none focus:border-accent/40" />
              <textarea value={refNotes} onChange={e => setRefNotes(e.target.value)} placeholder="Notes (optional)" rows={2}
                className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none focus:border-accent/40 resize-none" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setCompleteTarget(null); setRefNumber(''); setRefNotes('') }}
                className="px-4 py-2 rounded-lg text-small text-text-muted hover:text-text-primary border border-glass hover:bg-glass-hover">Cancel</button>
              <button onClick={() => complete.mutate({ id: completeTarget._id })} disabled={complete.isPending}
                className="btn-gradient inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-small font-semibold disabled:opacity-50">
                {complete.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Confirm complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Obligations list */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="premium-card h-16 animate-pulse" />)}</div>
      ) : obligations.length === 0 ? (
        <div className="premium-card p-8 text-center text-text-muted text-sm">
          No obligations found. Click &quot;Generate {year}&quot; to create this year&apos;s obligations.
        </div>
      ) : (
        <div className="space-y-2">
          {obligations.map(o => {
            const isExpanded = expandedId === o._id
            const tpl = o.template || {}
            return (
              <div key={o._id} className="premium-card overflow-hidden">
                <div className="p-3.5 flex items-center gap-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : o._id)}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-small font-semibold text-text-primary">{tpl.name || o.code}</span>
                      {tpl.category && <span className={`text-label px-1.5 py-0.5 rounded font-medium uppercase tracking-wider ${CAT_BADGE[tpl.category] || ''}`}>{tpl.category}</span>}
                      <span className={`text-label px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_BADGE[o.status] || ''}`}>{o.status}</span>
                    </div>
                    <div className="flex gap-3 mt-0.5">
                      <span className="text-label text-text-muted">Period: {o.period}</span>
                      <span className={`text-label ${o.status === 'overdue' ? 'text-red-400' : o.status === 'pending' ? 'text-highlight' : 'text-text-muted'}`}>
                        Due: {formatDate(o.dueDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {o.status === 'pending' || o.status === 'overdue' ? (
                      <>
                        <button onClick={e => { e.stopPropagation(); setCompleteTarget(o) }}
                          className="text-label px-2.5 py-1 rounded-lg bg-positive/10 text-positive hover:bg-positive/20 border border-positive/20">
                          Complete
                        </button>
                        <button onClick={e => { e.stopPropagation(); if (confirm('Waive this obligation?')) waive.mutate({ id: o._id, notes: '' }) }}
                          className="text-label px-2.5 py-1 rounded-lg bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 border border-slate-500/20">
                          Waive
                        </button>
                      </>
                    ) : null}
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-3.5 border-t border-glass/20 pt-2.5 space-y-1">
                    {tpl.description && <p className="text-xs text-text-secondary">{tpl.description}</p>}
                    {tpl.frequencyLabel && <p className="text-label text-text-muted">Frequency: {tpl.frequencyLabel}</p>}
                    {o.referenceNumber && <p className="text-label text-text-muted">Reference: {o.referenceNumber}</p>}
                    {o.notes && <p className="text-label text-text-muted">Notes: {o.notes}</p>}
                    {o.completedAt && <p className="text-label text-text-muted">Completed: {formatDate(o.completedAt)}</p>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Retention Policies section */}
      {policies.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-text-muted" />
            <h2 className="text-base font-semibold text-text-primary">Document Retention Policies</h2>
          </div>
          <p className="text-xs text-text-secondary">These policies are enforced automatically — documents cannot be deleted before their retention period expires.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {policies.map(p => (
              <div key={p.docType} className="premium-card p-3">
                <p className="text-small font-semibold text-text-primary capitalize">{(p.docType || '').replace(/_/g, ' ')}</p>
                <p className="text-label text-text-muted mt-0.5">Retain {p.retentionYears}yr · Archive after {p.archiveAfterYears}yr</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
