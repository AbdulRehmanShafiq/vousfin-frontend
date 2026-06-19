/**
 * BudgetEditorPage — SRS FR-04.1
 *
 * Set your plan for the year: how much you expect to earn and spend, account by
 * account, month by month. Three quick ways to fill it in: pull last year's real
 * numbers, type one yearly figure and split it evenly, or edit any month by hand.
 * Save it as a draft, then submit it for approval.
 */
import { useState, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Target, Loader2, Sparkles, Save, SendHorizonal, CalendarDays } from 'lucide-react'
import budgetService from '@/services/budget.service'
import { useAccounts } from '@/hooks/useAccounts'
import { useFiscalYears } from '@/hooks/useFiscalYear'
import { getErrorMessage } from '@/utils/errorHandler'

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100

// Mirror of the backend splitEvenly: even split, last month absorbs the remainder.
function splitEvenly(annual) {
  const a = Number(annual) || 0
  if (!a) return Array(12).fill(0)
  const per = round2(a / 12)
  const months = Array(11).fill(per)
  months.push(round2(a - per * 11))
  return months
}
const annualOf = (arr) => round2((arr || []).reduce((s, m) => s + (Number(m) || 0), 0))
const SCENARIOS = ['base', 'optimistic', 'pessimistic']

export default function BudgetEditorPage() {
  const qc = useQueryClient()
  const [fiscalYearId, setFiscalYearId] = useState('')
  const [scenario, setScenario] = useState('base')
  const [name, setName] = useState('')
  const [budgetId, setBudgetId] = useState(null)
  const [monthly, setMonthly] = useState({}) // { [accountId]: number[12] }

  const { data: fiscalYears = [] } = useFiscalYears()
  const { data: accounts = [] } = useAccounts()

  // Only income & spending accounts are budgeted (the P&L).
  const rows = useMemo(() => {
    const order = { Revenue: 0, Expense: 1 }
    return accounts
      .filter((a) => a.accountType === 'Revenue' || a.accountType === 'Expense')
      .sort((a, b) => (order[a.accountType] - order[b.accountType]) || a.accountName.localeCompare(b.accountName))
  }, [accounts])

  const cell = (id, m) => (monthly[id]?.[m] ?? 0)
  const setCell = (id, m, val) => setMonthly((prev) => {
    const next = { ...prev }
    const arr = [...(next[id] || Array(12).fill(0))]
    arr[m] = Number(val) || 0
    next[id] = arr
    return next
  })
  const applyAnnual = (id, annual) => setMonthly((prev) => ({ ...prev, [id]: splitEvenly(annual) }))

  const buildLines = () => rows
    .map((a) => ({ accountId: a._id, monthly: monthly[a._id] || Array(12).fill(0) }))
    .filter((l) => l.monthly.some((m) => Number(m) !== 0))

  const seed = useMutation({
    mutationFn: () => budgetService.seed({ fiscalYearId, scenario }).then((r) => r.data?.data),
    onSuccess: (data) => {
      const next = {}
      for (const l of (data?.lines || [])) next[l.accountId] = l.monthly
      setMonthly(next)
      toast.success("Filled in from last year's numbers")
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const save = useMutation({
    mutationFn: () => {
      if (!name.trim()) { const err = new Error('Give your budget a name first.'); err.handled = true; throw err }
      const lines = buildLines()
      if (lines.length === 0) { const err = new Error('Enter at least one figure before saving.'); err.handled = true; throw err }
      if (budgetId) return budgetService.update(budgetId, { name: name.trim(), lines }).then((r) => r.data?.data)
      return budgetService.create({ name: name.trim(), fiscalYearId, scenario, lines }).then((r) => r.data?.data)
    },
    onSuccess: (data) => { setBudgetId(data._id); qc.invalidateQueries({ queryKey: ['budgets'] }); toast.success('Budget saved as a draft') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const submit = useMutation({
    mutationFn: () => budgetService.submit(budgetId).then((r) => r.data?.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['budgets'] }); toast.success('Sent for approval') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const canEdit = !!fiscalYearId
  const renderGroup = (type, heading) => {
    const group = rows.filter((a) => a.accountType === type)
    if (group.length === 0) return null
    return (
      <>
        <tr><td colSpan={14} className="pt-3 pb-1 text-[11.5px] uppercase tracking-wider text-text-muted">{heading}</td></tr>
        {group.map((a) => (
          <tr key={a._id} className="border-b border-glass/50">
            <td className="py-1.5 pr-2 text-[12.5px] text-text-primary whitespace-nowrap sticky left-0 bg-glass-panel/40">{a.accountName}</td>
            <td className="py-1.5 px-1">
              <input type="number" value={annualOf(monthly[a._id]) || ''} placeholder="year"
                onChange={(e) => applyAnnual(a._id, e.target.value)}
                className="w-20 px-1.5 py-1 rounded border border-glass bg-glass-panel/40 text-[12px] text-right text-text-primary focus:outline-none focus:border-cyan/40" />
            </td>
            {Array.from({ length: 12 }).map((_, m) => (
              <td key={m} className="py-1.5 px-0.5">
                <input type="number" value={cell(a._id, m) || ''}
                  onChange={(e) => setCell(a._id, m, e.target.value)}
                  className="w-16 px-1 py-1 rounded border border-glass bg-glass-panel/30 text-[11.5px] text-right text-text-secondary focus:outline-none focus:border-cyan/40" />
              </td>
            ))}
          </tr>
        ))}
      </>
    )
  }

  return (
    <div className="animate-fade-in pb-10 space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-cyan/15"><Target className="h-5 w-5 text-cyan" /></div>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Budget / Plan</h1>
          <p className="text-sm text-text-secondary mt-0.5">Plan what you expect to earn and spend this year.</p>
        </div>
      </div>

      <div className="premium-card p-4 flex items-end gap-3 flex-wrap">
        <label className="flex flex-col gap-1">
          <span className="text-[11.5px] text-text-muted">Year</span>
          <select value={fiscalYearId} onChange={(e) => setFiscalYearId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary focus:outline-none">
            <option value="" className="bg-charcoal">Pick a year…</option>
            {fiscalYears.map((fy) => <option key={fy._id} value={fy._id} className="bg-charcoal">{fy.name}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11.5px] text-text-muted">Plan type</span>
          <select value={scenario} onChange={(e) => setScenario(e.target.value)}
            className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary capitalize focus:outline-none">
            {SCENARIOS.map((s) => <option key={s} value={s} className="bg-charcoal capitalize">{s}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <span className="text-[11.5px] text-text-muted">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 2025-26 Operating Budget"
            className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary focus:outline-none focus:border-cyan/40" />
        </label>
        <button onClick={() => seed.mutate()} disabled={!fiscalYearId || seed.isPending}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] text-cyan hover:bg-glass-hover disabled:opacity-40">
          {seed.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Seed from last year
        </button>
      </div>

      {fiscalYears.length === 0 && (
        <div className="premium-card p-6 flex flex-col items-center text-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber/15"><CalendarDays className="h-5 w-5 text-amber" /></div>
          <div>
            <p className="text-[14px] font-semibold text-text-primary">Set up a financial year first</p>
            <p className="text-[12.5px] text-text-secondary mt-1 max-w-md">
              A budget is a plan for one year, so you need to tell VousFin which year you’re planning for.
              It only takes a moment — then come back here.
            </p>
          </div>
          <Link to="/accounting/fiscal-years"
            className="btn-gradient inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold">
            <CalendarDays className="h-4 w-4" /> Set up a financial year
          </Link>
        </div>
      )}

      {canEdit && rows.length > 0 && (
        <div className="premium-card p-4 space-y-3">
          <div className="overflow-x-auto">
            <table className="text-[12px] border-collapse">
              <thead>
                <tr className="text-text-muted text-left border-b border-glass">
                  <th className="py-2 pr-2 font-medium sticky left-0 bg-glass-panel/40">Account</th>
                  <th className="py-2 px-1 font-medium text-right">Year</th>
                  {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((mo) => (
                    <th key={mo} className="py-2 px-0.5 font-medium text-right">{mo}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {renderGroup('Revenue', 'Expected income')}
                {renderGroup('Expense', 'Expected spending')}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-text-muted">Tip: type a yearly figure in the “Year” box to spread it evenly across the months, then tweak any month.</p>

          <div className="flex items-center gap-2">
            <button onClick={() => save.mutate()} disabled={save.isPending}
              className="btn-gradient inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold disabled:opacity-50">
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save draft
            </button>
            {budgetId && (
              <button onClick={() => submit.mutate()} disabled={submit.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold text-emerald hover:bg-glass-hover disabled:opacity-50">
                {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />} Submit for approval
              </button>
            )}
          </div>
        </div>
      )}

      {canEdit && rows.length === 0 && (
        <div className="premium-card p-6 text-center text-[13px] text-text-secondary">
          No income or spending accounts yet — add some in your Chart of Accounts first.
        </div>
      )}
    </div>
  )
}
