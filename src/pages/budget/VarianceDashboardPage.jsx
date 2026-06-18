/**
 * VarianceDashboardPage — SRS FR-04.2
 *
 * See how your real numbers compare to the plan. Each account shows its budget,
 * what actually happened, the gap, and a simple traffic-light (green = on track,
 * amber = watch it, red = well over). Click a row to see the entries behind it.
 */
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FileBarChart2, Loader2 } from 'lucide-react'
import budgetService from '@/services/budget.service'

const money = (n) => Number(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })
const pct = (p) => (p == null ? '—' : `${Math.round(p * 100)}%`)
const SCENARIOS = ['base', 'optimistic', 'pessimistic']

const RAG = {
  green: { dot: 'bg-emerald', text: 'text-emerald', label: 'On track' },
  amber: { dot: 'bg-amber', text: 'text-amber', label: 'Watch' },
  red:   { dot: 'bg-negative', text: 'text-negative', label: 'Over' },
}

export default function VarianceDashboardPage() {
  const [scenario, setScenario] = useState('base')
  const [budgetId, setBudgetId] = useState('')

  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets', 'active'],
    queryFn: () => budgetService.list({ status: 'active' }).then((r) => r.data?.data || []),
    staleTime: 60 * 1000,
  })

  const scenarioBudgets = useMemo(() => budgets.filter((b) => b.scenario === scenario), [budgets, scenario])
  const activeId = budgetId || scenarioBudgets[0]?._id || ''

  const { data: variance, isLoading } = useQuery({
    queryKey: ['budgets', 'variance', activeId],
    queryFn: () => budgetService.variance(activeId).then((r) => r.data?.data),
    enabled: !!activeId,
    staleTime: 30 * 1000,
  })

  const lines = variance?.lines || []
  const totals = variance?.totals || {}

  return (
    <div className="animate-fade-in pb-10 space-y-5 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-cyan/15"><FileBarChart2 className="h-5 w-5 text-cyan" /></div>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Budget vs Actual</h1>
          <p className="text-sm text-text-secondary mt-0.5">How your real numbers compare to the plan.</p>
        </div>
      </div>

      <div className="premium-card p-4 flex items-end gap-3 flex-wrap">
        <label className="flex flex-col gap-1">
          <span className="text-[11.5px] text-text-muted">Plan type</span>
          <select value={scenario} onChange={(e) => { setScenario(e.target.value); setBudgetId('') }}
            className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary capitalize focus:outline-none">
            {SCENARIOS.map((s) => <option key={s} value={s} className="bg-charcoal capitalize">{s}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <span className="text-[11.5px] text-text-muted">Budget</span>
          <select value={activeId} onChange={(e) => setBudgetId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary focus:outline-none">
            {scenarioBudgets.length === 0 && <option value="" className="bg-charcoal">No active budget for this plan type</option>}
            {scenarioBudgets.map((b) => <option key={b._id} value={b._id} className="bg-charcoal">{b.name} (v{b.version})</option>)}
          </select>
        </label>
      </div>

      {isLoading && (
        <div className="premium-card p-6 flex items-center gap-2 text-text-secondary text-[13px]">
          <Loader2 className="h-4 w-4 animate-spin" /> Working out the numbers…
        </div>
      )}

      {!isLoading && activeId && lines.length > 0 && (
        <div className="premium-card p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-text-muted text-left border-b border-glass">
                  <th className="py-2 pr-3 font-medium">Account</th>
                  <th className="py-2 px-3 font-medium text-right">Plan</th>
                  <th className="py-2 px-3 font-medium text-right">Actual</th>
                  <th className="py-2 px-3 font-medium text-right">Gap</th>
                  <th className="py-2 px-3 font-medium text-right">%</th>
                  <th className="py-2 pl-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => {
                  const rag = RAG[l.rag] || RAG.green
                  const to = `/transactions?accountId=${l.accountId}${l.costCenterId ? `&costCenterId=${l.costCenterId}` : ''}`
                  return (
                    <tr key={`${l.accountId}-${l.costCenterId || ''}`} className="border-b border-glass/50 hover:bg-glass-hover">
                      <td className="py-2 pr-3">
                        <Link to={to} className="text-text-primary hover:text-cyan">{l.accountName || l.accountId}</Link>
                      </td>
                      <td className="py-2 px-3 text-right text-text-secondary">{money(l.budget)}</td>
                      <td className="py-2 px-3 text-right text-text-secondary">{money(l.actual)}</td>
                      <td className={`py-2 px-3 text-right ${l.favorable ? 'text-emerald' : rag.text}`}>{money(l.variance)}</td>
                      <td className="py-2 px-3 text-right text-text-secondary">{pct(l.variancePct)}</td>
                      <td className="py-2 pl-3">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] ${rag.text}`}>
                          <span className={`h-2 w-2 rounded-full ${rag.dot}`} />
                          {l.favorable ? 'On track' : rag.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="font-semibold text-text-primary">
                  <td className="py-2 pr-3">Total</td>
                  <td className="py-2 px-3 text-right">{money(totals.budget)}</td>
                  <td className="py-2 px-3 text-right">{money(totals.actual)}</td>
                  <td className="py-2 px-3 text-right">{money(totals.variance)}</td>
                  <td className="py-2 px-3" />
                  <td className="py-2 pl-3" />
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="text-[11px] text-text-muted mt-2">Click any account to see the entries behind it.</p>
        </div>
      )}

      {!isLoading && activeId && lines.length === 0 && (
        <div className="premium-card p-6 text-center text-[13px] text-text-secondary">This budget has no lines to compare yet.</div>
      )}
      {!isLoading && !activeId && (
        <div className="premium-card p-6 text-center text-[13px] text-text-secondary">
          No active budget for this plan type yet. Create one in the Budget Editor and get it approved.
        </div>
      )}
    </div>
  )
}
