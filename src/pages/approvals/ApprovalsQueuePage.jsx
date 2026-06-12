/**
 * Approvals (#6)
 *
 * When you turn on approvals, any transaction above your limit waits here
 * instead of posting straight to the books. Approve it and VousFin posts the
 * real journal entry; reject it and nothing is recorded. Nothing touches your
 * ledger until you approve — so your books stay clean and every decision is logged.
 */
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Check, X, Loader2, ShieldCheck, Clock } from 'lucide-react'
import approvalService from '@/services/approval.service'
import { useAccounts } from '@/hooks/useAccounts'
import { getErrorMessage } from '@/utils/errorHandler'

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—')
const STATUS_FILTERS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

function Queue() {
  const qc = useQueryClient()
  const [status, setStatus] = useState('pending')
  const [busyId, setBusyId] = useState(null)
  const accountsQuery = useAccounts()
  const accName = (id) => accountsQuery.data?.find((a) => a._id === id)?.accountName || '—'

  const { data, isLoading } = useQuery({
    queryKey: ['approvals', status],
    queryFn: () => approvalService.list({ status }).then((r) => r.data.data),
    staleTime: 10_000,
  })
  const items = data?.data || []

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['approvals'] })
    qc.invalidateQueries({ queryKey: ['approvals-count'] })
    qc.invalidateQueries({ queryKey: ['transactions'] })
  }

  const decide = async (id, action) => {
    let reason
    if (action === 'reject') {
      // Optional: record WHY it was rejected (kept in the audit trail).
      reason = window.prompt('Reason for rejecting (optional):', '')
      if (reason === null) return // user hit Cancel — don't reject
    }
    setBusyId(id)
    try {
      if (action === 'approve') { await approvalService.approve(id); toast.success('Approved & posted to your ledger') }
      else { await approvalService.reject(id, reason || undefined); toast('Rejected', { icon: '🚫' }) }
      refresh()
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setBusyId(null) }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {STATUS_FILTERS.map((s) => (
          <button key={s.key} onClick={() => setStatus(s.key)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium ${status === s.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nothing {status} right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <div key={p._id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{p.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {fmtDate(p.transactionDate)} · by {p.submittedBy?.fullName || 'You'}
                    {p.source === 'recurring' && <span className="ml-1 px-1.5 py-0.5 rounded bg-purple-50 text-purple-600">recurring</span>}
                  </p>
                </div>
                <p className="font-bold text-gray-900 shrink-0">{Number(p.amount).toLocaleString()}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-2.5 text-xs mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="flex justify-between"><span className="text-gray-500">Debit</span><span className="font-medium text-gray-800 truncate ml-2">{accName(p.debitAccountId?._id || p.debitAccountId)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Credit</span><span className="font-medium text-gray-800 truncate ml-2">{accName(p.creditAccountId?._id || p.creditAccountId)}</span></div>
              </div>

              {p.status === 'pending' ? (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => decide(p._id, 'approve')} disabled={busyId === p._id}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1.5 rounded-lg disabled:opacity-50">
                    {busyId === p._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Approve &amp; post
                  </button>
                  <button onClick={() => decide(p._id, 'reject')} disabled={busyId === p._id}
                    className="px-3 border border-gray-300 hover:bg-red-50 hover:border-red-200 text-red-500 text-xs font-medium py-1.5 rounded-lg flex items-center gap-1.5">
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              ) : (
                <p className={`text-xs mt-3 font-medium ${p.status === 'approved' ? 'text-green-600' : 'text-red-500'}`}>
                  {p.status === 'approved' ? '✓ Approved & posted' : '✕ Rejected'}
                  {p.reviewedBy?.fullName ? ` by ${p.reviewedBy.fullName}` : ''}{p.decisionNote ? ` — ${p.decisionNote}` : ''}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Settings() {
  const qc = useQueryClient()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['approval-settings'],
    queryFn: () => approvalService.getSettings().then((r) => r.data.data),
    staleTime: 30_000,
  })
  // Seed local form once loaded
  if (data && form === null) {
    setForm({ enabled: !!data.enabled, threshold: data.threshold ?? 0, allowSelfApproval: data.allowSelfApproval !== false })
  }

  if (isLoading || form === null) return <div className="h-40 bg-gray-100 animate-pulse rounded-xl" />

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const inp = 'w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200'

  const save = async () => {
    setSaving(true)
    try {
      await approvalService.updateSettings({
        enabled: form.enabled, threshold: Number(form.threshold) || 0, allowSelfApproval: form.allowSelfApproval,
      })
      toast.success('Approval settings saved')
      qc.invalidateQueries({ queryKey: ['approval-settings'] })
      qc.invalidateQueries({ queryKey: ['approvals-count'] })
    } catch (e) { toast.error(getErrorMessage(e)) }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-lg bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-5">
      <label className="flex items-center justify-between gap-3 cursor-pointer">
        <span>
          <span className="block text-sm font-semibold text-gray-900">Require approval for big transactions</span>
          <span className="block text-xs text-gray-500 mt-0.5">When on, transactions above the limit wait for approval before posting.</span>
        </span>
        <input type="checkbox" checked={form.enabled} onChange={(e) => set('enabled', e.target.checked)} className="h-5 w-5 rounded" />
      </label>

      <div className={form.enabled ? '' : 'opacity-50 pointer-events-none'}>
        <label className="text-xs font-medium text-gray-600">Approval limit</label>
        <input type="number" min="0" step="1" className={inp} value={form.threshold} onChange={(e) => set('threshold', e.target.value)} placeholder="100000" />
        <p className="text-xs text-gray-400 mt-1">Transactions for more than this amount need approval. Smaller ones post right away.</p>
      </div>

      <label className={`flex items-center justify-between gap-3 cursor-pointer ${form.enabled ? '' : 'opacity-50 pointer-events-none'}`}>
        <span>
          <span className="block text-sm font-semibold text-gray-900">Let the submitter approve their own</span>
          <span className="block text-xs text-gray-500 mt-0.5">Turn off for stricter separation (someone else must approve).</span>
        </span>
        <input type="checkbox" checked={form.allowSelfApproval} onChange={(e) => set('allowSelfApproval', e.target.checked)} className="h-5 w-5 rounded" />
      </label>

      <button onClick={save} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-1.5">
        {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save settings
      </button>
    </div>
  )
}

const TABS = [{ key: 'queue', label: 'Queue' }, { key: 'settings', label: 'Settings' }]

export default function ApprovalsQueuePage() {
  const [tab, setTab] = useState('queue')
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">Review big transactions before they hit your books.</p>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`text-sm px-4 py-2 font-medium border-b-2 transition-colors ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'queue' ? <Queue /> : <Settings />}
    </div>
  )
}
