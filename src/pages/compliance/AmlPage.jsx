/**
 * AmlPage — FR-10.3 AML/KYC Screening
 * Counterparty risk flags and STR drafts.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ShieldAlert, Loader2, FileText, X } from 'lucide-react'
import complianceService from '@/services/compliance.service'
import { getErrorMessage } from '@/utils/errorHandler'
import SelectField from '@/components/ui/SelectField'

const RESULT_BADGE = {
  clear:          'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  flagged:        'bg-red-500/15 text-red-400 border border-red-500/20',
  pending_review: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
}

function RiskBar({ score }) {
  const pct = Math.min(100, score || 0)
  const color = pct >= 30 ? '#f87171' : pct >= 15 ? '#fbbf24' : '#34d399'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 rounded-full bg-glass overflow-hidden">
        <div style={{ width: `${pct}%`, backgroundColor: color }} className="h-full rounded-full" />
      </div>
      <span className="text-[11px] text-text-muted">{pct}</span>
    </div>
  )
}

export default function AmlPage() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['aml-screenings'] })

  const [resultFilter, setResultFilter] = useState('')
  const [justifyTarget, setJustifyTarget] = useState(null)
  const [justifyText, setJustifyText] = useState('')
  const [strModal, setStrModal] = useState(null) // holds the STR draft object

  const { data: screenings = [], isLoading } = useQuery({
    queryKey: ['aml-screenings', resultFilter],
    queryFn: () => complianceService.listScreenings(resultFilter ? { result: resultFilter } : {}).then(r => r.data?.data || []),
    staleTime: 60_000,
  })

  const addJustification = useMutation({
    mutationFn: ({ id }) => complianceService.addJustification(id, { justification: justifyText }),
    onSuccess: () => { invalidate(); setJustifyTarget(null); setJustifyText(''); toast.success('Justification saved') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const loadSTR = useMutation({
    mutationFn: (id) => complianceService.draftSTR(id).then(r => r.data?.data),
    onSuccess: (draft) => setStrModal(draft),
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <div className="animate-fade-in pb-10 space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-red-500/15"><ShieldAlert className="h-5 w-5 text-red-400" /></div>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">AML Screening</h1>
          <p className="text-sm text-text-secondary mt-0.5">Counterparty risk flags and suspicious transaction report drafts.</p>
        </div>
      </div>

      <div className="premium-card p-3.5 flex items-start gap-2 text-[12.5px] text-text-secondary border-l-2 border-amber-500/40">
        <ShieldAlert className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
        Screening runs automatically when you add a new customer or vendor. High-value transactions (PKR 500,000+) and counterparty names matching risk keywords are flagged.
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <SelectField value={resultFilter} onChange={e => setResultFilter(e.target.value)} className="w-auto">
          <option value="" className="bg-charcoal">All results</option>
          {['clear', 'flagged', 'pending_review'].map(r => (
            <option key={r} value={r} className="bg-charcoal capitalize">{r.replace('_', ' ')}</option>
          ))}
        </SelectField>
        <span className="text-[12px] text-text-muted">{screenings.length} record{screenings.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Justify modal */}
      {justifyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="premium-card p-6 w-full max-w-md space-y-4">
            <div className="flex items-start justify-between">
              <h2 className="text-base font-semibold text-text-primary">Add justification — {justifyTarget.counterpartyName}</h2>
              <button onClick={() => setJustifyTarget(null)}><X className="h-4 w-4 text-text-muted" /></button>
            </div>
            <textarea value={justifyText} onChange={e => setJustifyText(e.target.value)} rows={4}
              maxLength={1000}
              placeholder="Explain why this counterparty has been reviewed and cleared..."
              className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary focus:outline-none focus:border-cyan/40 resize-none" />
            <p className="text-[10.5px] text-text-muted text-right">{justifyText.length}/1000</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setJustifyTarget(null)} className="px-3 py-1.5 rounded-lg text-[12.5px] text-text-muted border border-glass hover:bg-glass-hover">Cancel</button>
              <button onClick={() => addJustification.mutate({ id: justifyTarget._id })}
                disabled={addJustification.isPending || !justifyText.trim()}
                className="btn-gradient inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12.5px] font-semibold disabled:opacity-50">
                {addJustification.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STR Draft modal */}
      {strModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="premium-card p-6 w-full max-w-lg space-y-4">
            <div className="flex items-start justify-between">
              <h2 className="text-base font-semibold text-text-primary">STR Draft — {strModal.counterpartyName}</h2>
              <button onClick={() => setStrModal(null)}><X className="h-4 w-4 text-text-muted" /></button>
            </div>
            <div className="p-3 rounded-lg bg-glass-panel/40 border border-glass text-[12.5px] text-text-secondary leading-relaxed whitespace-pre-wrap">
              {strModal.draftText}
            </div>
            <p className="text-[11.5px] text-text-muted">This is a draft only. No report has been submitted. Review with your compliance officer before filing.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setStrModal(null)} className="btn-gradient px-4 py-1.5 rounded-lg text-[12.5px] font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="premium-card h-16 animate-pulse" />)}</div>
      ) : screenings.length === 0 ? (
        <div className="premium-card p-8 text-center text-text-muted text-sm">
          No screening records yet. Add a customer or vendor to trigger automatic screening.
        </div>
      ) : (
        <div className="space-y-2">
          {screenings.map(s => (
            <div key={s._id} className="premium-card p-3.5 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-semibold text-text-primary">{s.counterpartyName}</span>
                  <span className={`text-[10.5px] px-2 py-0.5 rounded-full capitalize font-medium ${RESULT_BADGE[s.result] || ''}`}>
                    {(s.result || '').replace('_', ' ')}
                  </span>
                  <span className="text-[10.5px] text-text-muted capitalize">{s.counterpartyType}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <RiskBar score={s.riskScore} />
                  {s.flags?.length > 0 && (
                    <span className="text-[11px] text-text-muted">{s.flags.join(' · ')}</span>
                  )}
                </div>
                {s.justification && (
                  <p className="text-[11.5px] text-text-muted mt-1">Justification: {s.justification}</p>
                )}
              </div>
              {s.result === 'flagged' && (
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button onClick={() => { setJustifyTarget(s); setJustifyText(s.justification || '') }}
                    className="text-[11.5px] px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 whitespace-nowrap">
                    Justify
                  </button>
                  <button onClick={() => loadSTR.mutate(s._id)} disabled={loadSTR.isPending}
                    className="inline-flex items-center gap-1 text-[11.5px] px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 whitespace-nowrap disabled:opacity-50">
                    <FileText className="h-3 w-3" /> Draft STR
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
