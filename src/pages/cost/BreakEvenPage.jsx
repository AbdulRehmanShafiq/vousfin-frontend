/**
 * BreakEvenPage — SRS FR-07.4
 *
 * Work out how many units you must sell to cover costs, and play with
 * price / cost / volume without touching real data. "Fill from my numbers"
 * seeds fixed and variable costs from the ledger. Save scenarios side by side
 * to compare.
 */
import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { Target, Loader2, Sparkles, Plus, X } from 'lucide-react'
import costService from '@/services/cost.service'
import { getErrorMessage } from '@/utils/errorHandler'

const money = (n) => Number(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })
const num = (v) => (v === '' || v == null ? 0 : Number(v))
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100

// Client-side mirror of the backend math (instant, no round-trip needed).
function compute({ fixedCosts, pricePerUnit, variableCostPerUnit, expectedUnits, targetProfit }) {
  const fc = num(fixedCosts), p = num(pricePerUnit), v = num(variableCostPerUnit)
  const cm = r2(p - v)
  if (cm <= 0) return { feasible: false, reason: 'Price must be greater than variable cost per unit.' }
  const units = fc / cm
  return {
    feasible: true,
    breakEvenUnits: Math.ceil(units),
    breakEvenRevenue: r2(units * p),
    cmPerUnit: cm,
    projectedProfit: r2(num(expectedUnits) * cm - fc),
    unitsForTargetProfit: Math.ceil((fc + num(targetProfit)) / cm),
  }
}

export default function BreakEvenPage() {
  const [f, setF] = useState({ fixedCosts: '', pricePerUnit: '', variableCostPerUnit: '', expectedUnits: '', targetProfit: '' })
  const [scenarios, setScenarios] = useState([])
  const [estimating, setEstimating] = useState(false)
  const nextId = useRef(1)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const res = compute(f)
  const hasInputs = f.fixedCosts !== '' && f.pricePerUnit !== '' && f.variableCostPerUnit !== ''

  const fillFromActuals = async () => {
    setEstimating(true)
    try {
      const year = new Date().getFullYear()
      const { data } = await costService.estimate(`${year}-01-01`, `${year}-12-31`)
      const e = data?.data || {}
      setF((prev) => ({ ...prev, fixedCosts: String(r2(e.fixedCosts || 0)), variableCostPerUnit: prev.variableCostPerUnit || '' }))
      toast.success(`Filled fixed costs from this year (${money(e.fixedCosts)}). Set your price and per-unit variable cost.`)
    } catch (e) { toast.error(getErrorMessage(e)) } finally { setEstimating(false) }
  }

  const addScenario = () => {
    if (!res.feasible) return
    setScenarios([...scenarios, { ...f, ...res, id: nextId.current++ }])
  }

  return (
    <div className="animate-fade-in pb-10 space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-highlight/15"><Target className="h-5 w-5 text-highlight" /></div>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Break-even & what-if</h1>
          <p className="text-sm text-text-secondary mt-0.5">How much must you sell to cover your costs?</p>
        </div>
      </div>

      <div className="premium-card p-4 space-y-3">
        <div className="flex items-end gap-3 flex-wrap">
          <label className="flex flex-col gap-1"><span className="text-label text-text-muted">Fixed costs</span>
            <input type="number" value={f.fixedCosts} onChange={set('fixedCosts')} className="w-32 px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-right text-text-primary focus:outline-none focus:border-accent/40" /></label>
          <label className="flex flex-col gap-1"><span className="text-label text-text-muted">Price per unit</span>
            <input type="number" value={f.pricePerUnit} onChange={set('pricePerUnit')} className="w-28 px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-right text-text-primary focus:outline-none focus:border-accent/40" /></label>
          <label className="flex flex-col gap-1"><span className="text-label text-text-muted">Variable cost / unit</span>
            <input type="number" value={f.variableCostPerUnit} onChange={set('variableCostPerUnit')} className="w-28 px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-right text-text-primary focus:outline-none focus:border-accent/40" /></label>
          <button onClick={fillFromActuals} disabled={estimating}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-small text-accent hover:bg-glass-hover disabled:opacity-40">
            {estimating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Fill from my numbers
          </button>
        </div>

        {hasInputs && !res.feasible && <p className="text-small text-negative">{res.reason}</p>}
        {hasInputs && res.feasible && (
          <div className="flex gap-6 flex-wrap pt-1">
            <div><p className="text-label text-text-muted">Break-even units</p><p className="text-lg font-semibold text-text-primary">{money(res.breakEvenUnits)}</p></div>
            <div><p className="text-label text-text-muted">Break-even revenue</p><p className="text-lg font-semibold text-text-primary">{money(res.breakEvenRevenue)}</p></div>
            <div><p className="text-label text-text-muted">Margin per unit</p><p className="text-lg font-semibold text-positive">{money(res.cmPerUnit)}</p></div>
          </div>
        )}
      </div>

      {hasInputs && res.feasible && (
        <div className="premium-card p-4 space-y-3">
          <p className="text-small font-semibold text-text-secondary">What if…</p>
          <div className="flex items-end gap-3 flex-wrap">
            <label className="flex flex-col gap-1"><span className="text-label text-text-muted">Expected units sold</span>
              <input type="number" value={f.expectedUnits} onChange={set('expectedUnits')} className="w-32 px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-right text-text-primary focus:outline-none focus:border-accent/40" /></label>
            <label className="flex flex-col gap-1"><span className="text-label text-text-muted">Target profit</span>
              <input type="number" value={f.targetProfit} onChange={set('targetProfit')} className="w-32 px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-right text-text-primary focus:outline-none focus:border-accent/40" /></label>
            <button onClick={addScenario} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-small text-accent hover:bg-glass-hover">
              <Plus className="h-4 w-4" /> Save scenario
            </button>
          </div>
          <div className="flex gap-6 flex-wrap">
            <div><p className="text-label text-text-muted">Profit at expected units</p>
              <p className={`text-lg font-semibold ${res.projectedProfit >= 0 ? 'text-positive' : 'text-negative'}`}>{money(res.projectedProfit)}</p></div>
            <div><p className="text-label text-text-muted">Units for target profit</p>
              <p className="text-lg font-semibold text-text-primary">{money(res.unitsForTargetProfit)}</p></div>
          </div>
        </div>
      )}

      {scenarios.length > 0 && (
        <div className="premium-card p-4">
          <p className="text-small font-semibold text-text-secondary mb-2">Saved scenarios</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-text-muted text-left border-b border-glass">
                  <th className="py-2 pr-3 font-medium">Price</th><th className="py-2 px-3 font-medium">Var/unit</th>
                  <th className="py-2 px-3 font-medium text-right">BE units</th><th className="py-2 px-3 font-medium text-right">Exp. units</th>
                  <th className="py-2 px-3 font-medium text-right">Profit</th><th className="py-2 pl-3" />
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s) => (
                  <tr key={s.id} className="border-b border-glass/50">
                    <td className="py-1.5 pr-3 text-text-secondary">{money(s.pricePerUnit)}</td>
                    <td className="py-1.5 px-3 text-text-secondary">{money(s.variableCostPerUnit)}</td>
                    <td className="py-1.5 px-3 text-right text-text-secondary">{money(s.breakEvenUnits)}</td>
                    <td className="py-1.5 px-3 text-right text-text-secondary">{money(num(s.expectedUnits))}</td>
                    <td className={`py-1.5 px-3 text-right ${s.projectedProfit >= 0 ? 'text-positive' : 'text-negative'}`}>{money(s.projectedProfit)}</td>
                    <td className="py-1.5 pl-3 text-right">
                      <button onClick={() => setScenarios(scenarios.filter((x) => x.id !== s.id))} className="text-text-muted hover:text-negative"><X className="h-3.5 w-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
