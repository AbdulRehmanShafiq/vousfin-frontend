/**
 * JobCostingPage — SRS FR-07.2
 *
 * Track what a job actually costs against its budget. Add costs (materials,
 * labour, overhead) as you go — each posts to Work in Progress — then mark the
 * job complete to move the finished cost into stock. Over/under budget is shown
 * per category.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Hammer, Loader2, Plus, BookCheck, ArrowLeft } from 'lucide-react'
import costService from '@/services/cost.service'
import { useAccounts } from '@/hooks/useAccounts'
import { getErrorMessage } from '@/utils/errorHandler'

const money = (n) => Number(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })
const CATEGORIES = ['material', 'labour', 'overhead']
const STATUS_STYLE = { open: 'text-text-muted', in_progress: 'text-cyan', completed: 'text-emerald', cancelled: 'text-amber' }

function VarianceRow({ label, v }) {
  if (!v) return null
  const over = !v.favourable
  return (
    <tr className="border-b border-glass/50">
      <td className="py-2 pr-3 capitalize text-text-primary">{label}</td>
      <td className="py-2 px-3 text-right text-text-secondary">{money(v.standard)}</td>
      <td className="py-2 px-3 text-right text-text-secondary">{money(v.actual)}</td>
      <td className={`py-2 pl-3 text-right ${over ? 'text-negative' : 'text-emerald'}`}>
        {over ? '+' : ''}{money(v.variance)} {over ? 'over' : 'under'}
      </td>
    </tr>
  )
}

function JobDetail({ jobId, onBack }) {
  const qc = useQueryClient()
  const { data: accounts = [] } = useAccounts()
  const { data: job, isLoading } = useQuery({
    queryKey: ['cost', 'job', jobId],
    queryFn: () => costService.getJob(jobId).then((r) => r.data?.data),
  })
  const [form, setForm] = useState({ category: 'material', amount: '', sourceAccountId: '', description: '' })
  const refresh = () => { qc.invalidateQueries({ queryKey: ['cost', 'job', jobId] }); qc.invalidateQueries({ queryKey: ['cost', 'jobs'] }) }

  const addCost = useMutation({
    mutationFn: () => costService.addCost(jobId, { ...form, amount: parseFloat(form.amount) }).then((r) => r.data?.data),
    onSuccess: () => { setForm({ category: 'material', amount: '', sourceAccountId: '', description: '' }); refresh(); toast.success('Cost added') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const complete = useMutation({
    mutationFn: () => costService.complete(jobId).then((r) => r.data?.data),
    onSuccess: () => { refresh(); toast.success('Job completed — cost moved to stock') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (isLoading || !job) return <div className="premium-card p-6 text-text-secondary text-[13px]"><Loader2 className="h-4 w-4 animate-spin inline mr-2" />Loading…</div>
  const v = job.variance || {}
  const canEdit = job.status === 'open' || job.status === 'in_progress'

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[12.5px] text-text-secondary hover:text-cyan">
        <ArrowLeft className="h-4 w-4" /> All jobs
      </button>
      <div className="premium-card p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-[15px] font-semibold text-text-primary">{job.name} <span className="text-text-muted">({job.code})</span></h2>
            <span className={`text-[11px] uppercase tracking-wider ${STATUS_STYLE[job.status]}`}>{job.status.replace('_', ' ')}</span>
          </div>
          {job.status === 'in_progress' && (
            <button onClick={() => complete.mutate()} disabled={complete.isPending}
              className="btn-gradient inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold disabled:opacity-50">
              {complete.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BookCheck className="h-3.5 w-3.5" />} Complete job
            </button>
          )}
        </div>

        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="text-text-muted text-left border-b border-glass">
              <th className="py-2 pr-3 font-medium">Category</th>
              <th className="py-2 px-3 font-medium text-right">Budget</th>
              <th className="py-2 px-3 font-medium text-right">Actual</th>
              <th className="py-2 pl-3 font-medium text-right">Over / Under</th>
            </tr>
          </thead>
          <tbody>
            <VarianceRow label="Material" v={v.material} />
            <VarianceRow label="Labour" v={v.labour} />
            <VarianceRow label="Overhead" v={v.overhead} />
          </tbody>
          <tfoot>
            <tr className="font-semibold text-text-primary">
              <td className="py-2 pr-3">Total</td>
              <td className="py-2 px-3 text-right">{money(v.total?.standard)}</td>
              <td className="py-2 px-3 text-right">{money(v.total?.actual)}</td>
              <td className={`py-2 pl-3 text-right ${v.total?.favourable ? 'text-emerald' : 'text-negative'}`}>
                {v.total?.favourable ? '' : '+'}{money(v.total?.variance)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {canEdit && (
        <div className="premium-card p-4 space-y-3">
          <p className="text-[12.5px] font-semibold text-text-secondary">Add a cost</p>
          <div className="flex items-end gap-2 flex-wrap">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-text-muted">Type</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary capitalize focus:outline-none">
                {CATEGORIES.map((c) => <option key={c} value={c} className="bg-charcoal capitalize">{c}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-text-muted">Amount</span>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-28 px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-right text-text-primary focus:outline-none focus:border-cyan/40" />
            </label>
            <label className="flex flex-col gap-1 flex-1 min-w-[160px]">
              <span className="text-[11px] text-text-muted">Paid from / consumed</span>
              <select value={form.sourceAccountId} onChange={(e) => setForm({ ...form, sourceAccountId: e.target.value })}
                className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary focus:outline-none">
                <option value="" className="bg-charcoal">Pick an account…</option>
                {accounts.map((a) => <option key={a._id} value={a._id} className="bg-charcoal">{a.accountCode} — {a.accountName}</option>)}
              </select>
            </label>
            <button onClick={() => addCost.mutate()} disabled={!form.amount || !form.sourceAccountId || addCost.isPending}
              className="btn-gradient inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold disabled:opacity-50">
              {addCost.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
            </button>
          </div>
        </div>
      )}

      {(job.costSheet || []).length > 0 && (
        <div className="premium-card p-4">
          <p className="text-[12.5px] font-semibold text-text-secondary mb-2">Cost history</p>
          <table className="w-full text-[12px]">
            <tbody>
              {job.costSheet.map((c, i) => (
                <tr key={i} className="border-b border-glass/50">
                  <td className="py-1.5 pr-3 capitalize text-text-secondary">{c.category}</td>
                  <td className="py-1.5 px-3 text-text-muted">{c.description}</td>
                  <td className="py-1.5 pl-3 text-right text-text-primary">{money(c.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function JobCostingPage() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState(null)
  const [creating, setCreating] = useState(false)
  const [nj, setNj] = useState({ code: '', name: '', material: '', labour: '', overhead: '' })

  const { data: jobs = [] } = useQuery({
    queryKey: ['cost', 'jobs'],
    queryFn: () => costService.listJobs().then((r) => r.data?.data || []),
    staleTime: 30 * 1000,
  })

  const create = useMutation({
    mutationFn: () => costService.createJob({
      code: nj.code, name: nj.name,
      standardCost: { material: parseFloat(nj.material) || 0, labour: parseFloat(nj.labour) || 0, overhead: parseFloat(nj.overhead) || 0 },
    }).then((r) => r.data?.data),
    onSuccess: () => { setCreating(false); setNj({ code: '', name: '', material: '', labour: '', overhead: '' }); qc.invalidateQueries({ queryKey: ['cost', 'jobs'] }); toast.success('Job created') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (selected) return <div className="animate-fade-in pb-10 max-w-4xl"><JobDetail jobId={selected} onBack={() => setSelected(null)} /></div>

  return (
    <div className="animate-fade-in pb-10 space-y-5 max-w-4xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gold/15"><Hammer className="h-5 w-5 text-gold" /></div>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Jobs</h1>
            <p className="text-sm text-text-secondary mt-0.5">Track what each job costs against its budget.</p>
          </div>
        </div>
        <button onClick={() => setCreating(!creating)} className="btn-gradient inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold">
          <Plus className="h-4 w-4" /> New job
        </button>
      </div>

      {creating && (
        <div className="premium-card p-4 space-y-3">
          <div className="flex items-end gap-2 flex-wrap">
            <label className="flex flex-col gap-1"><span className="text-[11px] text-text-muted">Code</span>
              <input value={nj.code} onChange={(e) => setNj({ ...nj, code: e.target.value })} className="w-28 px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary focus:outline-none focus:border-cyan/40" /></label>
            <label className="flex flex-col gap-1 flex-1 min-w-[160px]"><span className="text-[11px] text-text-muted">Name</span>
              <input value={nj.name} onChange={(e) => setNj({ ...nj, name: e.target.value })} className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary focus:outline-none focus:border-cyan/40" /></label>
          </div>
          <div className="flex items-end gap-2 flex-wrap">
            {['material', 'labour', 'overhead'].map((k) => (
              <label key={k} className="flex flex-col gap-1"><span className="text-[11px] text-text-muted capitalize">Budget {k}</span>
                <input type="number" value={nj[k]} onChange={(e) => setNj({ ...nj, [k]: e.target.value })} className="w-28 px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-right text-text-primary focus:outline-none focus:border-cyan/40" /></label>
            ))}
            <button onClick={() => create.mutate()} disabled={!nj.code || !nj.name || create.isPending}
              className="btn-gradient inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold disabled:opacity-50">
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {jobs.length === 0 && <div className="premium-card p-6 text-center text-[13px] text-text-secondary">No jobs yet. Create one to start tracking costs.</div>}
        {jobs.map((j) => (
          <button key={j._id} onClick={() => setSelected(j._id)} className="premium-card p-3 w-full flex items-center justify-between text-left hover:bg-glass-hover">
            <span className="text-[13px] text-text-primary">{j.name} <span className="text-text-muted">({j.code})</span></span>
            <span className={`text-[10.5px] uppercase tracking-wider ${STATUS_STYLE[j.status]}`}>{j.status.replace('_', ' ')}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
