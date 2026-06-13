/**
 * ScenariosPage — FR-03.3 decision impact modeler.
 * Simulations only — visually marked, never real records.
 */
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FlaskConical, Save, Trash2, Play } from 'lucide-react'
import api from '@/services/api'

const fmt = (n) => `Rs ${Math.round(Math.abs(Number(n) || 0)).toLocaleString()}`
const FIELDS = [
  ['extraMonthlyExpense', 'Extra monthly expense (e.g. 3 hires × 80,000)'],
  ['extraMonthlyRevenue', 'Extra monthly revenue (e.g. new contract)'],
  ['revenueChangePct',    'Revenue change % (e.g. −15 for a discount)'],
  ['expenseChangePct',    'Expense change %'],
  ['oneOffCost',          'One-off cost (e.g. branch setup)'],
]

export default function ScenariosPage() {
  const qc = useQueryClient()
  const [params, setParams] = useState({})
  const [name, setName] = useState('')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)

  const { data: saved = [] } = useQuery({
    queryKey: ['scenarios'],
    queryFn: () => api.get('/scenarios').then(r => r.data.data),
  })

  const run = async (p = params) => {
    setBusy(true)
    try { setResult((await api.post('/scenarios/simulate', p)).data.data) }
    catch { toast.error('Simulation failed') }
    finally { setBusy(false) }
  }

  const save = async () => {
    if (!name.trim()) return toast.error('Give the scenario a name')
    await api.post('/scenarios', { name, params })
    toast.success('Scenario saved')
    setName(''); qc.invalidateQueries({ queryKey: ['scenarios'] })
  }

  const remove = async (id) => {
    await api.delete(`/scenarios/${id}`)
    qc.invalidateQueries({ queryKey: ['scenarios'] })
  }

  return (
    <div className="space-y-6">
      {/* SIMULATION banner — never real data */}
      <div className="flex items-center gap-2 rounded-md border border-amber/30 bg-amber/10 px-3 py-2 text-xs text-amber-2">
        <FlaskConical className="h-4 w-4" />
        Simulation sandbox — projections use your live ledger as baseline; nothing here creates real records.
      </div>

      <div className="premium-card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Define the decision</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {FIELDS.map(([key, label]) => (
            <label key={key} className="text-xs text-text-muted">
              {label}
              <input
                type="number" value={params[key] ?? ''}
                onChange={e => setParams(p => ({ ...p, [key]: e.target.value === '' ? 0 : Number(e.target.value) }))}
                className="num mt-1 w-full bg-transparent border border-glass rounded-md px-3 py-2 text-sm text-text-primary focus-ring"
              />
            </label>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={() => run()} disabled={busy}
            className="btn-gradient rounded-md px-4 py-2 text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50">
            <Play className="h-3.5 w-3.5" /> {busy ? 'Computing…' : 'Run simulation'}
          </button>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Scenario name…"
            className="bg-transparent border border-glass rounded-md px-3 py-2 text-sm text-text-primary focus-ring" />
          <button onClick={save} className="btn-outline rounded-md px-3 py-2 text-sm flex items-center gap-1.5">
            <Save className="h-3.5 w-3.5" /> Save
          </button>
        </div>
      </div>

      {result && (
        <div className="premium-card p-5 border-dashed" style={{ borderStyle: 'dashed' }}>
          <p className="text-[12.5px] uppercase tracking-widest text-amber-2 mb-3">Simulated projection · {result.computedInMs}ms</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {result.horizons.map(h => (
              <div key={h.months} className="rounded-md border border-glass p-3">
                <p className="text-xs text-text-muted mb-2">{h.months} month{h.months > 1 ? 's' : ''}</p>
                <p className="num text-lg font-semibold text-text-primary">{fmt(h.projected.netProfit)}</p>
                <p className="text-[12.5px] text-text-muted">projected net {h.projected.netProfit < 0 ? '(loss)' : 'profit'}</p>
                <p className={`num text-xs mt-2 ${h.vsBaseline.netProfitDelta >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {h.vsBaseline.netProfitDelta >= 0 ? '+' : '−'}{fmt(h.vsBaseline.netProfitDelta)} vs baseline
                </p>
                <p className="text-[12.5px] text-text-muted mt-2">
                  Break-even {h.breakEven.achieved ? 'covered' : 'NOT covered'}
                  {h.breakEven.paybackMonths ? ` · payback ${h.breakEven.paybackMonths} mo` : ''}
                  {h.cashRunwayMonths !== null ? ` · runway ${h.cashRunwayMonths} mo` : ''}
                </p>
              </div>
            ))}
          </div>
          <p className="num text-[12.5px] text-text-muted mt-3">
            Baseline (live GL, trailing 3 months): revenue {fmt(result.baseline.monthlyRevenue)}/mo · expenses {fmt(result.baseline.monthlyExpense)}/mo · cash {fmt(result.baseline.startingCash)}
          </p>
        </div>
      )}

      {saved.length > 0 && (
        <div className="premium-card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Saved scenarios</h3>
          <div className="space-y-2">
            {saved.map(s => (
              <div key={s._id} className="flex items-center justify-between rounded-md border border-glass px-3 py-2">
                <span className="text-sm text-text-secondary">{s.name}</span>
                <span className="flex gap-2">
                  <button onClick={() => { setParams(s.params); run(s.params) }}
                    className="text-xs text-accent hover:underline">Run</button>
                  <button onClick={() => remove(s._id)} className="text-negative/70 hover:text-negative">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
