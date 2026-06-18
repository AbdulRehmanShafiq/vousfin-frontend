/**
 * CostCentersPage — SRS FR-07.1
 *
 * Manage the cost / profit centre dimension: departments, branches, projects,
 * locations. These tags can then be attached to any transaction so the books
 * can be sliced by department — the foundation for budget-by-department,
 * profitability analysis and cost-centre P&L.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Building2, Plus, Pencil, Trash2, Loader2, Check } from 'lucide-react'
import costCenterService from '@/services/costCenter.service'
import { getErrorMessage } from '@/utils/errorHandler'

const TYPES = [
  { v: 'department', l: 'Department' },
  { v: 'branch',     l: 'Branch' },
  { v: 'project',    l: 'Project' },
  { v: 'location',   l: 'Location' },
  { v: 'cost_center', l: 'Cost centre' },
]
const TYPE_LABEL = Object.fromEntries(TYPES.map(t => [t.v, t.l]))
const blank = { code: '', name: '', type: 'department', parentId: '', description: '', isActive: true }

function Form({ initial, centres, onSave, onCancel, isPending }) {
  const [form, setForm] = useState(initial || blank)
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const submit = (e) => {
    e.preventDefault()
    if (!form.code.trim() || !form.name.trim()) return
    onSave({ ...form, parentId: form.parentId || null })
  }
  return (
    <form onSubmit={submit} className="premium-card p-4 grid sm:grid-cols-2 gap-3">
      <input value={form.code} onChange={set('code')} placeholder="Code (e.g. SALES)"
        className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary focus:outline-none focus:border-cyan/40" />
      <input value={form.name} onChange={set('name')} placeholder="Name (e.g. Sales Department)"
        className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary focus:outline-none focus:border-cyan/40" />
      <select value={form.type} onChange={set('type')}
        className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary focus:outline-none">
        {TYPES.map(t => <option key={t.v} value={t.v} className="bg-charcoal">{t.l}</option>)}
      </select>
      <select value={form.parentId || ''} onChange={set('parentId')}
        className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary focus:outline-none">
        <option value="" className="bg-charcoal">No parent (top level)</option>
        {centres.filter(c => c._id !== form._id).map(c => (
          <option key={c._id} value={c._id} className="bg-charcoal">{c.code} — {c.name}</option>
        ))}
      </select>
      <input value={form.description} onChange={set('description')} placeholder="Description (optional)"
        className="sm:col-span-2 px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary focus:outline-none focus:border-cyan/40" />
      <label className="flex items-center gap-2 text-[12.5px] text-text-secondary">
        <input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Active
      </label>
      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg text-[12.5px] text-text-muted hover:bg-glass-hover">Cancel</button>
        <button type="submit" disabled={!form.code.trim() || !form.name.trim() || isPending}
          className="btn-gradient inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12.5px] font-semibold disabled:opacity-50">
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save
        </button>
      </div>
    </form>
  )
}

export default function CostCentersPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null) // null | 'new' | costCenter
  const { data: centres = [], isLoading } = useQuery({
    queryKey: ['cost-centers'],
    queryFn: () => costCenterService.list().then(r => r.data?.data || []),
    staleTime: 60 * 1000,
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['cost-centers'] })
  const save = useMutation({
    mutationFn: (data) => data._id ? costCenterService.update(data._id, data) : costCenterService.create(data),
    onSuccess: () => { invalidate(); setEditing(null); toast.success('Cost centre saved') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const remove = useMutation({
    mutationFn: (id) => costCenterService.remove(id),
    onSuccess: () => { invalidate(); toast.success('Cost centre deleted') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const nameOf = (id) => centres.find(c => c._id === id)?.name

  return (
    <div className="animate-fade-in pb-10 space-y-5 max-w-4xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan/15"><Building2 className="h-5 w-5 text-cyan" /></div>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Cost centres</h1>
            <p className="text-sm text-text-secondary mt-0.5">Tag your books by department, branch, project or location.</p>
          </div>
        </div>
        {editing === null && (
          <button onClick={() => setEditing('new')}
            className="btn-gradient inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold">
            <Plus className="h-4 w-4" /> New cost centre
          </button>
        )}
      </div>

      {editing === 'new' && <Form centres={centres} onSave={save.mutate} onCancel={() => setEditing(null)} isPending={save.isPending} />}

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="premium-card h-14 animate-pulse" />)}</div>
      ) : centres.length === 0 && editing === null ? (
        <div className="premium-card p-6 text-center text-[13px] text-text-secondary">
          No cost centres yet. Add your first one to start tagging transactions by department.
        </div>
      ) : (
        <div className="space-y-2">
          {centres.map(cc => editing?._id === cc._id ? (
            <Form key={cc._id} initial={cc} centres={centres} onSave={save.mutate} onCancel={() => setEditing(null)} isPending={save.isPending} />
          ) : (
            <div key={cc._id} className="premium-card p-3.5 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-semibold text-text-primary">{cc.code}</span>
                  <span className="text-[13px] text-text-secondary">{cc.name}</span>
                  <span className="text-[10.5px] uppercase tracking-wider text-text-muted">{TYPE_LABEL[cc.type] || cc.type}</span>
                  {!cc.isActive && <span className="text-[10.5px] text-amber">inactive</span>}
                </div>
                {cc.parentId && <p className="text-[11.5px] text-text-muted mt-0.5">under {nameOf(cc.parentId) || '—'}</p>}
              </div>
              <button onClick={() => setEditing(cc)} aria-label="Edit" className="p-1.5 rounded-lg text-text-muted hover:text-cyan hover:bg-glass-hover"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => { if (confirm(`Delete cost centre "${cc.name}"?`)) remove.mutate(cc._id) }} aria-label="Delete" className="p-1.5 rounded-lg text-text-muted hover:text-negative hover:bg-glass-hover"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
