/**
 * PayrollRunPage — SRS FR-08.2/.3
 *
 * Run payroll for a month: pick the month, calculate everyone's take-home pay,
 * review the figures, then post it to the books and mark it paid. A posted run
 * is locked — to fix something you reverse it and run again.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Wallet, Calculator, Loader2, BookCheck, Banknote, Undo2 } from 'lucide-react'
import payrollService from '@/services/payroll.service'
import { useAccounts } from '@/hooks/useAccounts'
import { getErrorMessage } from '@/utils/errorHandler'

const money = (n) => 'PKR ' + Number(n || 0).toLocaleString('en-PK')
const thisMonth = () => new Date().toISOString().slice(0, 7)

const STATUS_STYLE = {
  draft: 'text-text-muted', processed: 'text-cyan', posted: 'text-emerald', paid: 'text-emerald', reversed: 'text-amber',
}

export default function PayrollRunPage() {
  const qc = useQueryClient()
  const [period, setPeriod] = useState(thisMonth())
  const [run, setRun] = useState(null)
  const [bankAccountId, setBankAccountId] = useState('')

  const { data: accounts = [] } = useAccounts()
  const bankAccounts = accounts.filter(a => a.accountSubtype === 'Bank and Cash')

  const { data: runs = [] } = useQuery({
    queryKey: ['payroll', 'runs'],
    queryFn: () => payrollService.listRuns().then(r => r.data?.data || []),
    staleTime: 30 * 1000,
  })

  const refreshRuns = () => qc.invalidateQueries({ queryKey: ['payroll', 'runs'] })

  const calc = useMutation({
    mutationFn: () => payrollService.processRun({ period, adjustments: {} }).then(r => r.data?.data),
    onSuccess: (data) => { setRun(data); refreshRuns(); toast.success('Payroll calculated') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const post = useMutation({
    mutationFn: () => payrollService.postRun(run._id).then(r => r.data?.data),
    onSuccess: (data) => { setRun(data); refreshRuns(); toast.success('Posted to the books') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const pay = useMutation({
    mutationFn: () => payrollService.payRun(run._id, bankAccountId).then(r => r.data?.data),
    onSuccess: (data) => { setRun(data); refreshRuns(); toast.success('Marked as paid') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const reverse = useMutation({
    mutationFn: (id) => payrollService.reverseRun(id).then(r => r.data?.data),
    onSuccess: () => { setRun(null); refreshRuns(); toast.success('Payroll reversed') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const openRun = (id) => payrollService.getRun(id).then(r => setRun(r.data?.data))
  const t = run?.totals || {}

  return (
    <div className="animate-fade-in pb-10 space-y-5 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-cyan/15"><Wallet className="h-5 w-5 text-cyan" /></div>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Run payroll</h1>
          <p className="text-sm text-text-secondary mt-0.5">Calculate take-home pay, post it to your books, and pay your team.</p>
        </div>
      </div>

      <div className="premium-card p-4 flex items-end gap-3 flex-wrap">
        <label className="flex flex-col gap-1">
          <span className="text-[11.5px] text-text-muted">Month</span>
          <input type="month" value={period} onChange={e => setPeriod(e.target.value)}
            className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary focus:outline-none focus:border-cyan/40" />
        </label>
        <button onClick={() => calc.mutate()} disabled={calc.isPending}
          className="btn-gradient inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold disabled:opacity-50">
          {calc.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />} Calculate
        </button>
      </div>

      {run && (
        <div className="premium-card p-4 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-text-primary">{run.period}</span>
              <span className={`text-[11px] uppercase tracking-wider ${STATUS_STYLE[run.status] || 'text-text-muted'}`}>{run.status}</span>
            </div>
            <div className="flex items-center gap-2">
              {run.status === 'processed' && (
                <button onClick={() => post.mutate()} disabled={post.isPending}
                  className="btn-gradient inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold disabled:opacity-50">
                  {post.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BookCheck className="h-3.5 w-3.5" />} Post to books
                </button>
              )}
              {run.status === 'posted' && (
                <>
                  <select value={bankAccountId} onChange={e => setBankAccountId(e.target.value)}
                    className="px-2 py-1.5 rounded-lg border border-glass bg-glass-panel/40 text-[12px] text-text-primary focus:outline-none">
                    <option value="" className="bg-charcoal">Pay from…</option>
                    {bankAccounts.map(a => <option key={a._id} value={a._id} className="bg-charcoal">{a.accountName}</option>)}
                  </select>
                  <button onClick={() => pay.mutate()} disabled={!bankAccountId || pay.isPending}
                    className="btn-gradient inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold disabled:opacity-50">
                    {pay.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Banknote className="h-3.5 w-3.5" />} Mark paid
                  </button>
                </>
              )}
              {(run.status === 'posted' || run.status === 'paid') && (
                <button onClick={() => reverse.mutate(run._id)} disabled={reverse.isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-amber hover:bg-glass-hover disabled:opacity-50">
                  <Undo2 className="h-3.5 w-3.5" /> Reverse
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-text-muted text-left border-b border-glass">
                  <th className="py-2 pr-3 font-medium">Employee</th>
                  <th className="py-2 px-3 font-medium text-right">Gross</th>
                  <th className="py-2 px-3 font-medium text-right">Income tax</th>
                  <th className="py-2 px-3 font-medium text-right">Pension</th>
                  <th className="py-2 px-3 font-medium text-right">PF</th>
                  <th className="py-2 px-3 font-medium text-right">Other</th>
                  <th className="py-2 pl-3 font-medium text-right">Take-home</th>
                </tr>
              </thead>
              <tbody>
                {run.lines.map((l) => (
                  <tr key={l.employeeId} className="border-b border-glass/50">
                    <td className="py-2 pr-3 text-text-primary">{l.employeeName} <span className="text-text-muted">({l.employeeCode})</span></td>
                    <td className="py-2 px-3 text-right text-text-secondary">{money(l.gross)}</td>
                    <td className="py-2 px-3 text-right text-text-secondary">{money(l.incomeTax)}</td>
                    <td className="py-2 px-3 text-right text-text-secondary">{money(l.eobiEmployee)}</td>
                    <td className="py-2 px-3 text-right text-text-secondary">{money(l.pfEmployee)}</td>
                    <td className="py-2 px-3 text-right text-text-secondary">{money(l.otherDeductionsTotal)}</td>
                    <td className="py-2 pl-3 text-right font-semibold text-text-primary">{money(l.netPay)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold text-text-primary">
                  <td className="py-2 pr-3">Total</td>
                  <td className="py-2 px-3 text-right">{money(t.gross)}</td>
                  <td className="py-2 px-3 text-right">{money(t.incomeTax)}</td>
                  <td className="py-2 px-3 text-right">{money(t.eobiEmployee)}</td>
                  <td className="py-2 px-3 text-right">{money(t.pfEmployee)}</td>
                  <td className="py-2 px-3 text-right">{money(t.otherDeductions)}</td>
                  <td className="py-2 pl-3 text-right">{money(t.netPay)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {runs.length > 0 && (
        <div className="space-y-2">
          <p className="text-[12.5px] font-semibold text-text-secondary">Past runs</p>
          {runs.map(r => (
            <button key={r._id} onClick={() => openRun(r._id)}
              className="premium-card p-3 w-full flex items-center justify-between text-left hover:bg-glass-hover">
              <span className="text-[13px] text-text-primary">{r.period}</span>
              <span className="flex items-center gap-3">
                <span className="text-[12px] text-text-secondary">{money(r.totals?.netPay)}</span>
                <span className={`text-[10.5px] uppercase tracking-wider ${STATUS_STYLE[r.status] || 'text-text-muted'}`}>{r.status}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
