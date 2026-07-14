/**
 * LeasesPage — FR-10.2 IFRS-16 Leases + IAS-36 Impairment
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Building2, Plus, Loader2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import complianceService from '@/services/compliance.service'
import { getErrorMessage } from '@/utils/errorHandler'

// Validation helpers for lease form
function isLeaseFormValid(f) {
  if (!f.assetName.trim()) return false
  if (!f.commencementDate) return false
  const term = parseInt(f.leaseTerm)
  if (!Number.isInteger(term) || term < 1 || term > 600) return false
  const pay = parseFloat(f.monthlyPayment)
  if (isNaN(pay) || pay < 0) return false
  const rate = parseFloat(f.discountRate)
  if (isNaN(rate) || rate < 0 || rate > 100) return false
  return true
}

// Validation helpers for impairment form
function isImpFormValid(f) {
  if (!f.assetName.trim()) return false
  const ca = parseFloat(f.carryingAmount)
  if (isNaN(ca) || ca < 0) return false
  const ra = parseFloat(f.recoverableAmount)
  if (isNaN(ra) || ra < 0) return false
  return true
}

const IAS36_INDICATORS = [
  'Asset market value has declined significantly',
  'Business environment has changed adversely',
  'Asset is idle or plans to discontinue use',
  'Physical damage or obsolescence observed',
  'Asset performance is worse than expected',
  'Market interest rates have increased significantly',
  'Net assets of the business exceed market capitalisation',
  'Asset has become technologically outdated',
  'Regulatory or government action affects the asset',
  'Economic performance of the asset is worse than budgeted',
]

const STATUS_BADGE = {
  active:     'bg-positive/15 text-positive border border-positive/20',
  terminated: 'bg-red-500/15 text-red-400 border border-red-500/20',
  expired:    'bg-slate-500/15 text-slate-400 border border-slate-500/20',
}

const IMP_STATUS_BADGE = {
  assessed:     'bg-highlight/15 text-highlight border border-highlight/20',
  loss_posted:  'bg-red-500/15 text-red-400 border border-red-500/20',
  no_impairment:'bg-positive/15 text-positive border border-positive/20',
}

function fmt(n) { return typeof n === 'number' ? n.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—' }

export default function LeasesPage() {
  const qc = useQueryClient()
  const invalidateLeases = () => qc.invalidateQueries({ queryKey: ['leases'] })
  const invalidateImp = () => qc.invalidateQueries({ queryKey: ['impairments'] })

  // Lease form
  const [showLeaseForm, setShowLeaseForm] = useState(false)
  const [leaseForm, setLeaseForm] = useState({ assetName: '', commencementDate: '', leaseTerm: '', monthlyPayment: '', discountRate: '' })

  // Schedule expand
  const [scheduleLeaseId, setScheduleLeaseId] = useState(null)

  // Impairment form
  const [showImpForm, setShowImpForm] = useState(false)
  const [impForm, setImpForm] = useState({ assetName: '', carryingAmount: '', recoverableAmount: '', indicators: [] })

  const { data: leases = [], isLoading: leasesLoading } = useQuery({
    queryKey: ['leases'],
    queryFn: () => complianceService.listLeases().then(r => r.data?.data || []),
    staleTime: 60_000,
  })

  const { data: scheduleData } = useQuery({
    queryKey: ['lease-schedule', scheduleLeaseId],
    queryFn: () => scheduleLeaseId ? complianceService.getSchedule(scheduleLeaseId).then(r => r.data?.data) : null,
    enabled: !!scheduleLeaseId,
    staleTime: 300_000,
  })

  const { data: assessments = [], isLoading: impLoading } = useQuery({
    queryKey: ['impairments'],
    queryFn: () => complianceService.listAssessments().then(r => r.data?.data || []),
    staleTime: 60_000,
  })

  const createLease = useMutation({
    mutationFn: () => complianceService.createLease({
      ...leaseForm,
      leaseTerm: parseInt(leaseForm.leaseTerm),
      monthlyPayment: parseFloat(leaseForm.monthlyPayment),
      discountRate: parseFloat(leaseForm.discountRate) / 100,
    }),
    onSuccess: () => { invalidateLeases(); setShowLeaseForm(false); setLeaseForm({ assetName: '', commencementDate: '', leaseTerm: '', monthlyPayment: '', discountRate: '' }); toast.success('Lease created') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const postAmortization = useMutation({
    mutationFn: (id) => complianceService.postAmortization(id),
    onSuccess: () => { invalidateLeases(); toast.success('Monthly amortization posted to ledger') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const terminateLease = useMutation({
    mutationFn: (id) => complianceService.terminateLease(id),
    onSuccess: () => { invalidateLeases(); toast.success('Lease terminated') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const createAssessment = useMutation({
    mutationFn: () => complianceService.createAssessment({
      ...impForm,
      carryingAmount: parseFloat(impForm.carryingAmount),
      recoverableAmount: parseFloat(impForm.recoverableAmount),
    }),
    onSuccess: () => { invalidateImp(); setShowImpForm(false); setImpForm({ assetName: '', carryingAmount: '', recoverableAmount: '', indicators: [] }); toast.success('Assessment created') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const postLoss = useMutation({
    mutationFn: (id) => complianceService.postImpairmentLoss(id),
    onSuccess: () => { invalidateImp(); toast.success('Impairment loss posted to ledger') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const toggleIndicator = (ind) => {
    setImpForm(f => ({
      ...f,
      indicators: f.indicators.includes(ind) ? f.indicators.filter(i => i !== ind) : [...f.indicators, ind],
    }))
  }

  return (
    <div className="animate-fade-in pb-10 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-purple-500/15"><Building2 className="h-5 w-5 text-purple-400" /></div>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Leases &amp; Impairment</h1>
          <p className="text-sm text-text-secondary mt-0.5">IFRS-16 lease amortization schedules and IAS-36 asset impairment assessments.</p>
        </div>
      </div>

      {/* ── LEASES SECTION ─────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">Leases</h2>
          <button onClick={() => setShowLeaseForm(v => !v)}
            className="btn-gradient inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-small font-semibold">
            <Plus className="h-3.5 w-3.5" /> Add lease
          </button>
        </div>

        {showLeaseForm && (
          <div className="premium-card p-4 space-y-3">
            <p className="text-xs text-text-muted">Discount rate = annual rate (e.g. 12 for 12%). Lease term: 1–600 months.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-label text-text-muted uppercase tracking-wider">Asset name *</label>
                <input type="text" value={leaseForm.assetName} onChange={e => setLeaseForm(f => ({ ...f, assetName: e.target.value }))}
                  placeholder="Office premises" required
                  className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none focus:border-accent/40" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label text-text-muted uppercase tracking-wider">Commencement date *</label>
                <input type="date" value={leaseForm.commencementDate} onChange={e => setLeaseForm(f => ({ ...f, commencementDate: e.target.value }))}
                  required
                  className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none focus:border-accent/40" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label text-text-muted uppercase tracking-wider">Lease term (months) *</label>
                <input type="number" min={1} max={600} step={1}
                  value={leaseForm.leaseTerm} onChange={e => setLeaseForm(f => ({ ...f, leaseTerm: e.target.value }))}
                  placeholder="36" required
                  className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none focus:border-accent/40" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label text-text-muted uppercase tracking-wider">Monthly payment (PKR) *</label>
                <input type="number" min={0} step="0.01"
                  value={leaseForm.monthlyPayment} onChange={e => setLeaseForm(f => ({ ...f, monthlyPayment: e.target.value }))}
                  placeholder="50000" required
                  className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none focus:border-accent/40" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label text-text-muted uppercase tracking-wider">Annual discount rate (%) *</label>
                <input type="number" min={0} max={100} step="0.01"
                  value={leaseForm.discountRate} onChange={e => setLeaseForm(f => ({ ...f, discountRate: e.target.value }))}
                  placeholder="12" required
                  className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none focus:border-accent/40" />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowLeaseForm(false)} className="px-3 py-1.5 rounded-lg text-small text-text-muted border border-glass hover:bg-glass-hover">Cancel</button>
              <button onClick={() => createLease.mutate()} disabled={createLease.isPending || !isLeaseFormValid(leaseForm)}
                className="btn-gradient inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-small font-semibold disabled:opacity-50">
                {createLease.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Save lease
              </button>
            </div>
          </div>
        )}

        {leasesLoading ? (
          <div className="space-y-2">{[1,2].map(i => <div key={i} className="premium-card h-14 animate-pulse" />)}</div>
        ) : leases.length === 0 ? (
          <div className="premium-card p-6 text-center text-text-muted text-sm">No leases yet. Add one above.</div>
        ) : (
          <div className="space-y-2">
            {leases.map(l => {
              const showSched = scheduleLeaseId === l._id
              return (
                <div key={l._id} className="premium-card overflow-hidden">
                  <div className="p-3.5 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-small font-semibold text-text-primary">{l.assetName}</span>
                        <span className={`text-label px-2 py-0.5 rounded-full capitalize font-medium ${STATUS_BADGE[l.status] || ''}`}>{l.status}</span>
                      </div>
                      <p className="text-label text-text-muted mt-0.5">
                        {l.leaseTerm} months · PKR {fmt(l.monthlyPayment)}/mo · Rate {(l.discountRate * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => setScheduleLeaseId(showSched ? null : l._id)}
                        className="text-label inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-glass text-text-muted hover:text-text-primary hover:bg-glass-hover">
                        {showSched ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />} Schedule
                      </button>
                      {l.status === 'active' && (
                        <>
                          <button onClick={() => postAmortization.mutate(l._id)} disabled={postAmortization.isPending}
                            className="text-label px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20">
                            Post this month
                          </button>
                          <button onClick={() => { if (confirm('Terminate this lease?')) terminateLease.mutate(l._id) }}
                            className="text-label px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">
                            Terminate
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {showSched && scheduleData && (
                    <div className="border-t border-glass/20 overflow-x-auto">
                      <div className="p-3 space-y-1">
                        <p className="text-label text-text-muted">Initial liability: PKR {fmt(scheduleData.initialLiability)} · ROU asset: PKR {fmt(scheduleData.initialRouAsset)}</p>
                      </div>
                      <table className="w-full text-label text-text-secondary">
                        <thead>
                          <tr className="border-b border-glass/20">
                            {['Period','Opening Liability','Interest','Payment','Principal','Closing Liability','ROU Dep'].map(h => (
                              <th key={h} className="px-3 py-2 text-left text-label text-text-muted font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(scheduleData.schedule || []).map(row => (
                            <tr key={row.period} className="border-b border-glass/10 hover:bg-glass-hover/20">
                              <td className="px-3 py-1.5">{row.period}</td>
                              <td className="px-3 py-1.5">{fmt(row.openingLiability)}</td>
                              <td className="px-3 py-1.5">{fmt(row.interestCharge)}</td>
                              <td className="px-3 py-1.5">{fmt(row.payment)}</td>
                              <td className="px-3 py-1.5">{fmt(row.principalRepayment)}</td>
                              <td className="px-3 py-1.5">{fmt(row.closingLiability)}</td>
                              <td className="px-3 py-1.5">{fmt(row.rouDepreciation)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── IMPAIRMENT SECTION ─────────────────────────────────────────────── */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">Impairment Assessments (IAS-36)</h2>
          <button onClick={() => setShowImpForm(v => !v)}
            className="btn-gradient inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-small font-semibold">
            <Plus className="h-3.5 w-3.5" /> New assessment
          </button>
        </div>

        {showImpForm && (
          <div className="premium-card p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-label text-text-muted uppercase tracking-wider">Asset name *</label>
                <input type="text" value={impForm.assetName} onChange={e => setImpForm(f => ({ ...f, assetName: e.target.value }))}
                  placeholder="Machine A" required
                  className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none focus:border-accent/40" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label text-text-muted uppercase tracking-wider">Carrying amount (PKR) *</label>
                <input type="number" min={0} step="0.01" value={impForm.carryingAmount}
                  onChange={e => setImpForm(f => ({ ...f, carryingAmount: e.target.value }))}
                  placeholder="100000" required
                  className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none focus:border-accent/40" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label text-text-muted uppercase tracking-wider">Recoverable amount (PKR) *</label>
                <input type="number" min={0} step="0.01" value={impForm.recoverableAmount}
                  onChange={e => setImpForm(f => ({ ...f, recoverableAmount: e.target.value }))}
                  placeholder="80000" required
                  className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none focus:border-accent/40" />
              </div>
            </div>
            <div>
              <p className="text-label text-text-muted uppercase tracking-wider mb-2">IAS-36 Impairment Indicators (tick all that apply)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {IAS36_INDICATORS.map(ind => (
                  <label key={ind} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={impForm.indicators.includes(ind)} onChange={() => toggleIndicator(ind)}
                      className="w-3.5 h-3.5 accent-accent" />
                    <span className="text-xs text-text-secondary">{ind}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowImpForm(false)} className="px-3 py-1.5 rounded-lg text-small text-text-muted border border-glass hover:bg-glass-hover">Cancel</button>
              <button onClick={() => createAssessment.mutate()} disabled={createAssessment.isPending || !isImpFormValid(impForm)}
                className="btn-gradient inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-small font-semibold disabled:opacity-50">
                {createAssessment.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Save assessment
              </button>
            </div>
          </div>
        )}

        {impLoading ? (
          <div className="space-y-2">{[1,2].map(i => <div key={i} className="premium-card h-14 animate-pulse" />)}</div>
        ) : assessments.length === 0 ? (
          <div className="premium-card p-6 text-center text-text-muted text-sm">No assessments yet. Click &quot;New assessment&quot; above.</div>
        ) : (
          <div className="space-y-2">
            {assessments.map(a => (
              <div key={a._id} className="premium-card p-3.5 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-small font-semibold text-text-primary">{a.assetName}</span>
                    <span className={`text-label px-2 py-0.5 rounded-full capitalize font-medium ${IMP_STATUS_BADGE[a.status] || ''}`}>{(a.status || '').replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-label text-text-muted mt-0.5">
                    Carrying: PKR {fmt(a.carryingAmount)} · Recoverable: PKR {fmt(a.recoverableAmount)} · Loss: PKR {fmt(a.impairmentLoss)}
                  </p>
                  {a.indicators?.length > 0 && (
                    <p className="text-label text-text-muted mt-0.5">{a.indicators.length} indicator{a.indicators.length !== 1 ? 's' : ''} ticked</p>
                  )}
                </div>
                {a.impairmentLoss > 0 && a.status !== 'loss_posted' && (
                  <button onClick={() => { if (confirm('Post this impairment loss to the ledger?')) postLoss.mutate(a._id) }}
                    disabled={postLoss.isPending}
                    className="inline-flex items-center gap-1.5 text-label px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 disabled:opacity-50">
                    <AlertTriangle className="h-3.5 w-3.5" /> Post loss
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
