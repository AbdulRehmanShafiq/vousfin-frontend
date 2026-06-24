/**
 * SodMatrixPage — Phase 6B (Segregation of Duties)
 *
 * Define which role pairs may not be held by the same person. If you set none,
 * VousFin uses a sensible default (accountant + approver — a preparer must not
 * also approve). These rules are enforced when roles are assigned on the Team page.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ShieldCheck, Plus, Trash2, Loader2 } from 'lucide-react'
import sodService from '@/services/sod.service'
import { getErrorMessage } from '@/utils/errorHandler'
import SelectField from '@/components/ui/SelectField'

const ROLES = [
  { v: 'owner', l: 'Owner' }, { v: 'accountant', l: 'Accountant' },
  { v: 'approver', l: 'Approver' }, { v: 'viewer', l: 'Viewer' },
]
const LABEL = Object.fromEntries(ROLES.map(r => [r.v, r.l]))

export default function SodMatrixPage() {
  const qc = useQueryClient()
  const [roleA, setRoleA] = useState('accountant')
  const [roleB, setRoleB] = useState('approver')
  const [reason, setReason] = useState('')

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['sod-rules'],
    queryFn: () => sodService.list().then(r => r.data?.data || []),
    staleTime: 60 * 1000,
  })
  const invalidate = () => qc.invalidateQueries({ queryKey: ['sod-rules'] })

  const add = useMutation({
    mutationFn: () => sodService.add(roleA, roleB, reason.trim()),
    onSuccess: () => { invalidate(); setReason(''); toast.success('Conflict rule added') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const remove = useMutation({
    mutationFn: (id) => sodService.remove(id),
    onSuccess: () => { invalidate(); toast.success('Rule removed') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <div className="animate-fade-in pb-10 space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-cyan/15"><ShieldCheck className="h-5 w-5 text-cyan" /></div>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Segregation of duties</h1>
          <p className="text-sm text-text-secondary mt-0.5">Roles that one person may not hold together. Enforced when you assign roles.</p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (roleA !== roleB) add.mutate() }} className="premium-card p-4 flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2">
          <SelectField value={roleA} onChange={(e) => setRoleA(e.target.value)} className="w-auto">
            {ROLES.map(r => <option key={r.v} value={r.v} className="bg-charcoal">{r.l}</option>)}
          </SelectField>
          <span className="text-text-muted text-[13px]">+</span>
          <SelectField value={roleB} onChange={(e) => setRoleB(e.target.value)} className="w-auto">
            {ROLES.map(r => <option key={r.v} value={r.v} className="bg-charcoal">{r.l}</option>)}
          </SelectField>
        </div>
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why (optional)"
          className="flex-1 min-w-[160px] px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary focus:outline-none focus:border-cyan/40" />
        <button type="submit" disabled={roleA === roleB || add.isPending}
          className="btn-gradient inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold disabled:opacity-50">
          {add.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Add conflict
        </button>
      </form>

      {isLoading ? (
        <div className="space-y-2">{[1,2].map(i => <div key={i} className="premium-card h-14 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {rules.map(r => (
            <div key={r._id} className="premium-card p-3.5 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-semibold text-text-primary">{LABEL[r.roleA] || r.roleA} + {LABEL[r.roleB] || r.roleB}</span>
                  {r.isDefault && <span className="text-[10.5px] uppercase tracking-wider text-text-muted">default</span>}
                </div>
                {r.reason && <p className="text-[11.5px] text-text-muted mt-0.5">{r.reason}</p>}
              </div>
              {!r.isDefault && (
                <button onClick={() => { if (confirm('Remove this conflict rule?')) remove.mutate(r._id) }}
                  aria-label="Remove" className="p-1.5 rounded-lg text-text-muted hover:text-negative hover:bg-glass-hover"><Trash2 className="h-4 w-4" /></button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
