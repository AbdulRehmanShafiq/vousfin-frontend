/**
 * PayslipsPage — SRS FR-08.2 / FR-08.4
 *
 * Download payslips and the bank-transfer file for a payroll run, plus each
 * employee's annual salary-tax certificate.
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FileText, Download, Loader2 } from 'lucide-react'
import payrollService from '@/services/payroll.service'
import { downloadFromResponse } from '@/utils/exportHelpers'
import { getErrorMessage } from '@/utils/errorHandler'

const currentTaxYear = () => {
  const d = new Date()
  const start = d.getMonth() + 1 >= 7 ? d.getFullYear() : d.getFullYear() - 1
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`
}

export default function PayslipsPage() {
  const [runId, setRunId] = useState('')
  const [busy, setBusy] = useState('')
  const [taxYear, setTaxYear] = useState(currentTaxYear())

  const { data: runs = [] } = useQuery({
    queryKey: ['payroll', 'runs'],
    queryFn: () => payrollService.listRuns().then(r => r.data?.data || []),
    staleTime: 30 * 1000,
  })
  const { data: employees = [] } = useQuery({
    queryKey: ['payroll', 'employees'],
    queryFn: () => payrollService.listEmployees().then(r => r.data?.data || []),
    staleTime: 60 * 1000,
  })

  const run = (cb) => async (key) => {
    setBusy(key)
    try { await cb() } catch (e) { toast.error(getErrorMessage(e)) } finally { setBusy('') }
  }

  const downloadBankFile = run(async () => {
    const res = await payrollService.bankFile(runId)
    downloadFromResponse(res, `payroll-${runId}.csv`)
  })
  const downloadPayslip = (employeeId) => run(async () => {
    const res = await payrollService.payslip(runId, employeeId)
    downloadFromResponse(res, `payslip-${employeeId}.pdf`)
  })(`slip-${employeeId}`)
  const downloadCert = (employeeId) => run(async () => {
    const res = await payrollService.certificatePdf(employeeId, taxYear)
    downloadFromResponse(res, `salary-certificate-${taxYear}.pdf`)
  })(`cert-${employeeId}`)

  const inputCls = 'px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary focus:outline-none focus:border-cyan/40'

  return (
    <div className="animate-fade-in pb-10 space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-cyan/15"><FileText className="h-5 w-5 text-cyan" /></div>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Payslips & certificates</h1>
          <p className="text-sm text-text-secondary mt-0.5">Download payslips, the bank-transfer file, and yearly tax certificates.</p>
        </div>
      </div>

      <div className="premium-card p-4 space-y-3">
        <label className="flex flex-col gap-1 max-w-xs">
          <span className="text-[11.5px] text-text-muted">Payroll run</span>
          <select value={runId} onChange={e => setRunId(e.target.value)} className={inputCls}>
            <option value="" className="bg-charcoal">Choose a month…</option>
            {runs.map(r => <option key={r._id} value={r._id} className="bg-charcoal">{r.period} ({r.status})</option>)}
          </select>
        </label>
        {runId && (
          <button onClick={() => downloadBankFile('bank')} disabled={busy === 'bank'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] text-text-secondary border border-glass hover:bg-glass-hover disabled:opacity-50">
            {busy === 'bank' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} Bank-transfer file (CSV)
          </button>
        )}
      </div>

      <div className="premium-card p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[12.5px] font-semibold text-text-secondary">Each employee</p>
          <label className="flex items-center gap-2">
            <span className="text-[11.5px] text-text-muted">Tax year</span>
            <input value={taxYear} onChange={e => setTaxYear(e.target.value)} className={`${inputCls} w-28`} />
          </label>
        </div>
        {employees.map(emp => (
          <div key={emp._id} className="flex items-center justify-between gap-3 border-b border-glass/50 pb-2">
            <span className="text-[13px] text-text-primary">{emp.fullName} <span className="text-text-muted">({emp.code})</span></span>
            <div className="flex items-center gap-2">
              <button onClick={() => downloadPayslip(emp._id)} disabled={!runId || busy === `slip-${emp._id}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] text-text-secondary border border-glass hover:bg-glass-hover disabled:opacity-40">
                {busy === `slip-${emp._id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />} Payslip
              </button>
              <button onClick={() => downloadCert(emp._id)} disabled={busy === `cert-${emp._id}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] text-text-secondary border border-glass hover:bg-glass-hover disabled:opacity-40">
                {busy === `cert-${emp._id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />} Certificate
              </button>
            </div>
          </div>
        ))}
        {employees.length === 0 && <p className="text-[13px] text-text-secondary">No employees yet.</p>}
      </div>
    </div>
  )
}
