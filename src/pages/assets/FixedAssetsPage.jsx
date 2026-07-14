/**
 * FixedAssetsPage — Fixed Asset Register (PPE).
 * Add assets, view their depreciation schedule, post each year's depreciation to
 * the ledger, and dispose an asset (records gain/loss automatically).
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Boxes, Plus, Loader2, TrendingDown, Trash2, ChevronDown } from 'lucide-react'
import fixedAssetService from '@/services/fixedAsset.service'
import SelectField from '@/components/ui/SelectField'
import { getErrorMessage } from '@/utils/errorHandler'

const METHODS = [
  { v: 'straight_line', l: 'Straight-line (even each year)' },
  { v: 'declining_balance', l: 'Declining balance (faster early)' },
]
const fmt = (n) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })
const STATUS_STYLE = {
  active: 'text-positive',
  disposed: 'text-text-muted',
  fully_depreciated: 'text-accent',
}

export default function FixedAssetsPage() {
  const qc = useQueryClient()
  const blank = { name: '', category: '', acquisitionDate: '', acquisitionCost: '', salvageValue: '0', usefulLifeYears: '5', depreciationMethod: 'straight_line' }
  const [form, setForm] = useState(blank)
  const [openId, setOpenId] = useState(null)
  const [disposeFor, setDisposeFor] = useState(null)
  const [disposal, setDisposal] = useState({ disposalDate: '', proceeds: '' })

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['fixed-assets'],
    queryFn: () => fixedAssetService.list().then(r => r.data?.data || []),
  })
  const invalidate = () => qc.invalidateQueries({ queryKey: ['fixed-assets'] })

  const set = (k) => (e) => {
    let v = e.target.value
    if (['acquisitionCost', 'salvageValue', 'usefulLifeYears'].includes(k) && v !== '' && Number(v) < 0) v = '0'
    setForm((f) => ({ ...f, [k]: v }))
  }

  const valid = form.name.trim() && form.acquisitionDate && Number(form.acquisitionCost) > 0
    && Number(form.usefulLifeYears) >= 1 && Number(form.salvageValue) <= Number(form.acquisitionCost)

  const create = useMutation({
    mutationFn: () => fixedAssetService.create({
      name: form.name.trim(), category: form.category.trim() || undefined,
      acquisitionDate: form.acquisitionDate, acquisitionCost: Number(form.acquisitionCost),
      salvageValue: Number(form.salvageValue || 0), usefulLifeYears: Number(form.usefulLifeYears),
      depreciationMethod: form.depreciationMethod,
    }),
    onSuccess: () => { invalidate(); setForm(blank); toast.success('Asset added') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const depreciate = useMutation({
    mutationFn: (id) => fixedAssetService.depreciate(id),
    onSuccess: () => { invalidate(); toast.success('Depreciation posted') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const dispose = useMutation({
    mutationFn: ({ id, data }) => fixedAssetService.dispose(id, data),
    onSuccess: (r) => {
      invalidate(); setDisposeFor(null); setDisposal({ disposalDate: '', proceeds: '' })
      const { gain, loss } = r.data?.data || {}
      toast.success(gain > 0 ? `Disposed — gain ${fmt(gain)}` : loss > 0 ? `Disposed — loss ${fmt(loss)}` : 'Asset disposed')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <div className="animate-fade-in pb-10 space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-accent/15"><Boxes className="h-5 w-5 text-accent" /></div>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Fixed assets</h1>
          <p className="text-sm text-text-secondary mt-0.5">Equipment, vehicles and other long-term assets — with depreciation and disposal.</p>
        </div>
      </div>

      {/* Add asset */}
      <form onSubmit={(e) => { e.preventDefault(); if (valid) create.mutate() }} className="premium-card p-4 space-y-3">
        <p className="text-small font-semibold text-text-primary">Add an asset</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={form.name} onChange={set('name')} placeholder="Asset name (e.g. Delivery Van)" className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none focus:border-accent/40" />
          <input value={form.category} onChange={set('category')} placeholder="Category (optional)" className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none focus:border-accent/40" />
          <label className="text-xs text-text-muted">Acquisition date
            <input type="date" value={form.acquisitionDate} onChange={set('acquisitionDate')} className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none focus:border-accent/40 mt-1" />
          </label>
          <label className="text-xs text-text-muted">Cost
            <input type="number" min={0} step="0.01" value={form.acquisitionCost} onChange={set('acquisitionCost')} placeholder="0" className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none focus:border-accent/40 mt-1" />
          </label>
          <label className="text-xs text-text-muted">Salvage value (end-of-life worth)
            <input type="number" min={0} max={form.acquisitionCost || undefined} step="0.01" value={form.salvageValue} onChange={set('salvageValue')} className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none focus:border-accent/40 mt-1" />
          </label>
          <label className="text-xs text-text-muted">Useful life (years)
            <input type="number" min={1} max={100} step="1" value={form.usefulLifeYears} onChange={set('usefulLifeYears')} className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none focus:border-accent/40 mt-1" />
          </label>
          <label className="text-xs text-text-muted sm:col-span-2">Depreciation method
            <SelectField value={form.depreciationMethod} onChange={set('depreciationMethod')} className="mt-1">
              {METHODS.map(m => <option key={m.v} value={m.v} className="bg-charcoal">{m.l}</option>)}
            </SelectField>
          </label>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={!valid || create.isPending} className="btn-gradient inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-small font-semibold disabled:opacity-50">
            {create.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Add asset
          </button>
        </div>
      </form>

      {/* Asset list */}
      {isLoading ? (
        <div className="space-y-2">{[1, 2].map(i => <div key={i} className="premium-card h-20 animate-pulse" />)}</div>
      ) : assets.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-8">No assets yet.</p>
      ) : (
        <div className="space-y-2">
          {assets.map(a => {
            const nbv = Number(a.acquisitionCost || 0) - Number(a.accumulatedDepreciation || 0)
            return (
              <div key={a._id} className="premium-card p-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-text-primary">{a.name}</span>
                      <span className={`text-label uppercase tracking-wider ${STATUS_STYLE[a.status] || 'text-text-muted'}`}>{a.status.replace('_', ' ')}</span>
                    </div>
                    <p className="text-label text-text-muted mt-0.5">
                      Cost {fmt(a.acquisitionCost)} · Accum. dep. {fmt(a.accumulatedDepreciation)} · Net book value {fmt(nbv)} · {a.depreciationMethod === 'declining_balance' ? 'Declining' : 'Straight-line'} / {a.usefulLifeYears}y
                    </p>
                  </div>
                  <button onClick={() => setOpenId(openId === a._id ? null : a._id)} className="text-xs text-text-muted hover:text-text-primary inline-flex items-center gap-1">
                    Schedule <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openId === a._id ? 'rotate-180' : ''}`} />
                  </button>
                  {a.status === 'active' && (
                    <>
                      <button onClick={() => depreciate.mutate(a._id)} disabled={depreciate.isPending} className="text-xs inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-glass text-text-secondary hover:text-text-primary hover:bg-glass-hover disabled:opacity-50">
                        <TrendingDown className="h-3.5 w-3.5" /> Post depreciation
                      </button>
                      <button onClick={() => { setDisposeFor(disposeFor === a._id ? null : a._id); setDisposal({ disposalDate: '', proceeds: '' }) }} className="text-xs inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-negative hover:bg-glass-hover">
                        <Trash2 className="h-3.5 w-3.5" /> Dispose
                      </button>
                    </>
                  )}
                </div>

                {openId === a._id && <ScheduleTable id={a._id} />}

                {disposeFor === a._id && (
                  <form onSubmit={(e) => { e.preventDefault(); if (disposal.disposalDate) dispose.mutate({ id: a._id, data: { disposalDate: disposal.disposalDate, proceeds: Number(disposal.proceeds || 0) } }) }}
                    className="mt-3 flex flex-wrap items-end gap-3 border-t border-glass pt-3">
                    <label className="text-xs text-text-muted">Disposal date
                      <input type="date" required value={disposal.disposalDate} onChange={(e) => setDisposal(d => ({ ...d, disposalDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none focus:border-accent/40 mt-1" />
                    </label>
                    <label className="text-xs text-text-muted">Sale proceeds
                      <input type="number" min={0} step="0.01" value={disposal.proceeds} onChange={(e) => setDisposal(d => ({ ...d, proceeds: e.target.value }))} placeholder="0" className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none focus:border-accent/40 mt-1" />
                    </label>
                    <button type="submit" disabled={dispose.isPending} className="px-3 py-2 rounded-lg bg-negative/15 text-negative text-small font-semibold disabled:opacity-50">
                      {dispose.isPending ? 'Disposing…' : 'Confirm disposal'}
                    </button>
                  </form>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ScheduleTable({ id }) {
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['fixed-asset-schedule', id],
    queryFn: () => fixedAssetService.schedule(id).then(r => r.data?.data || []),
  })
  if (isLoading) return <div className="mt-3 h-16 animate-pulse bg-glass rounded-lg" />
  return (
    <div className="mt-3 overflow-x-auto border-t border-glass pt-3">
      <table className="w-full text-xs">
        <thead><tr className="text-text-muted text-left">
          <th className="py-1 pr-4">Year</th><th className="py-1 pr-4">Depreciation</th><th className="py-1 pr-4">Accumulated</th><th className="py-1">Book value</th>
        </tr></thead>
        <tbody className="text-text-secondary">
          {rows.map(r => (
            <tr key={r.year} className="border-t border-glass/50">
              <td className="py-1 pr-4">{r.year}</td>
              <td className="py-1 pr-4">{fmt(r.depreciation)}</td>
              <td className="py-1 pr-4">{fmt(r.accumulated)}</td>
              <td className="py-1">{fmt(r.bookValue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
