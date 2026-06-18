/**
 * EmployeesPage — SRS FR-08.1
 *
 * Set up the people you pay. Each employee has a monthly salary made of a basic
 * amount plus allowances, and optional pension (EOBI) and provident-fund settings.
 * These feed the monthly payroll run. Plain language throughout — the technical
 * terms (EOBI, WHT) stay secondary.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Users, Plus, Pencil, Loader2, Check } from 'lucide-react'
import payrollService from '@/services/payroll.service'
import costCenterService from '@/services/costCenter.service'
import { getErrorMessage } from '@/utils/errorHandler'

const num = (v) => (v === '' || v == null ? 0 : Number(v))

const blankStructure = {
  effectiveFrom: new Date().toISOString().slice(0, 10),
  basic: '',
  allowances: { houseRent: '', medical: '', conveyance: '', special: '', other: '' },
  taxExempt: { medicalCapPctOfBasic: 10 },
  eobi: { enabled: false, employeeAmount: 250, employerAmount: 1500 },
  providentFund: { enabled: false, employeePctOfBasic: 0, employerPctOfBasic: 0 },
  recurringDeductions: [],
}
const blank = {
  code: '', fullName: '', designation: '', department: '',
  bankAccountTitle: '', iban: '', status: 'active',
  salaryStructure: [blankStructure],
}

function field(label, child) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11.5px] text-text-muted">{label}</span>
      {child}
    </label>
  )
}
const inputCls = 'px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary focus:outline-none focus:border-cyan/40'

function Form({ initial, departments, onSave, onCancel, isPending }) {
  const [form, setForm] = useState(initial || blank)
  const s = form.salaryStructure[0]
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const setS = (path) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => {
      const ns = structuredClone(f.salaryStructure)
      let o = ns[0]
      const parts = path.split('.')
      while (parts.length > 1) o = o[parts.shift()]
      o[parts[0]] = val
      return { ...f, salaryStructure: ns }
    })
  }
  const submit = (e) => {
    e.preventDefault()
    if (!form.code.trim() || !form.fullName.trim() || s.basic === '') return
    // coerce numerics
    const a = s.allowances
    const payload = {
      ...form,
      department: form.department || null,
      salaryStructure: [{
        effectiveFrom: s.effectiveFrom,
        basic: num(s.basic),
        allowances: { houseRent: num(a.houseRent), medical: num(a.medical), conveyance: num(a.conveyance), special: num(a.special), other: num(a.other) },
        taxExempt: { medicalCapPctOfBasic: num(s.taxExempt.medicalCapPctOfBasic) },
        eobi: { enabled: s.eobi.enabled, employeeAmount: num(s.eobi.employeeAmount), employerAmount: num(s.eobi.employerAmount) },
        providentFund: { enabled: s.providentFund.enabled, employeePctOfBasic: num(s.providentFund.employeePctOfBasic), employerPctOfBasic: num(s.providentFund.employerPctOfBasic) },
        recurringDeductions: s.recurringDeductions,
      }],
    }
    onSave(payload)
  }
  return (
    <form onSubmit={submit} className="premium-card p-4 space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        {field('Staff ID / code', <input value={form.code} onChange={set('code')} placeholder="e.g. EMP-001" className={inputCls} />)}
        {field('Full name', <input value={form.fullName} onChange={set('fullName')} placeholder="e.g. Ali Khan" className={inputCls} />)}
        {field('Job title', <input value={form.designation} onChange={set('designation')} placeholder="e.g. Accountant" className={inputCls} />)}
        {field('Department', (
          <select value={form.department || ''} onChange={set('department')} className={inputCls}>
            <option value="" className="bg-charcoal">No department</option>
            {departments.map(d => <option key={d._id} value={d._id} className="bg-charcoal">{d.code} — {d.name}</option>)}
          </select>
        ))}
        {field('Bank account title', <input value={form.bankAccountTitle} onChange={set('bankAccountTitle')} placeholder="As on the bank account" className={inputCls} />)}
        {field('IBAN', <input value={form.iban} onChange={set('iban')} placeholder="PK.." className={inputCls} />)}
      </div>

      <div className="border-t border-glass pt-3">
        <p className="text-[12.5px] font-semibold text-text-secondary mb-2">Monthly salary</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {field('Effective from', <input type="date" value={s.effectiveFrom} onChange={setS('effectiveFrom')} className={inputCls} />)}
          {field('Basic pay', <input type="number" value={s.basic} onChange={setS('basic')} placeholder="0" className={inputCls} />)}
          {field('House rent', <input type="number" value={s.allowances.houseRent} onChange={setS('allowances.houseRent')} placeholder="0" className={inputCls} />)}
          {field('Medical', <input type="number" value={s.allowances.medical} onChange={setS('allowances.medical')} placeholder="0" className={inputCls} />)}
          {field('Conveyance', <input type="number" value={s.allowances.conveyance} onChange={setS('allowances.conveyance')} placeholder="0" className={inputCls} />)}
          {field('Other allowance', <input type="number" value={s.allowances.other} onChange={setS('allowances.other')} placeholder="0" className={inputCls} />)}
          {field('Medical tax-free up to (% of basic)', <input type="number" value={s.taxExempt.medicalCapPctOfBasic} onChange={setS('taxExempt.medicalCapPctOfBasic')} className={inputCls} />)}
        </div>
      </div>

      <div className="border-t border-glass pt-3 grid sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-[12.5px] text-text-secondary mb-2">
            <input type="checkbox" checked={s.eobi.enabled} onChange={setS('eobi.enabled')} /> Pension (EOBI)
          </label>
          {s.eobi.enabled && (
            <div className="grid grid-cols-2 gap-2">
              {field('Employee pays', <input type="number" value={s.eobi.employeeAmount} onChange={setS('eobi.employeeAmount')} className={inputCls} />)}
              {field('Company pays', <input type="number" value={s.eobi.employerAmount} onChange={setS('eobi.employerAmount')} className={inputCls} />)}
            </div>
          )}
        </div>
        <div>
          <label className="flex items-center gap-2 text-[12.5px] text-text-secondary mb-2">
            <input type="checkbox" checked={s.providentFund.enabled} onChange={setS('providentFund.enabled')} /> Provident fund
          </label>
          {s.providentFund.enabled && (
            <div className="grid grid-cols-2 gap-2">
              {field('Employee % of basic', <input type="number" value={s.providentFund.employeePctOfBasic} onChange={setS('providentFund.employeePctOfBasic')} className={inputCls} />)}
              {field('Company % of basic', <input type="number" value={s.providentFund.employerPctOfBasic} onChange={setS('providentFund.employerPctOfBasic')} className={inputCls} />)}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg text-[12.5px] text-text-muted hover:bg-glass-hover">Cancel</button>
        <button type="submit" disabled={isPending} className="btn-gradient inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12.5px] font-semibold disabled:opacity-50">
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save
        </button>
      </div>
    </form>
  )
}

export default function EmployeesPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null)
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['payroll', 'employees'],
    queryFn: () => payrollService.listEmployees().then(r => r.data?.data || []),
    staleTime: 60 * 1000,
  })
  const { data: departments = [] } = useQuery({
    queryKey: ['cost-centers'],
    queryFn: () => costCenterService.list().then(r => r.data?.data || []),
    staleTime: 5 * 60 * 1000,
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['payroll', 'employees'] })
  const save = useMutation({
    mutationFn: (data) => data._id ? payrollService.updateEmployee(data._id, data) : payrollService.createEmployee(data),
    onSuccess: () => { invalidate(); setEditing(null); toast.success('Employee saved') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const deptName = (id) => departments.find(d => d._id === id)?.name

  return (
    <div className="animate-fade-in pb-10 space-y-5 max-w-4xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan/15"><Users className="h-5 w-5 text-cyan" /></div>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Employees</h1>
            <p className="text-sm text-text-secondary mt-0.5">The people you pay each month and their salary setup.</p>
          </div>
        </div>
        {editing === null && (
          <button onClick={() => setEditing('new')} className="btn-gradient inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-semibold">
            <Plus className="h-4 w-4" /> Add employee
          </button>
        )}
      </div>

      {editing === 'new' && <Form departments={departments} onSave={save.mutate} onCancel={() => setEditing(null)} isPending={save.isPending} />}

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="premium-card h-14 animate-pulse" />)}</div>
      ) : employees.length === 0 && editing === null ? (
        <div className="premium-card p-6 text-center text-[13px] text-text-secondary">
          No employees yet. Add your first one to start running payroll.
        </div>
      ) : (
        <div className="space-y-2">
          {employees.map(emp => editing?._id === emp._id ? (
            <Form key={emp._id}
              initial={{ ...emp, department: emp.department || '', salaryStructure: emp.salaryStructure?.length ? emp.salaryStructure.slice(-1) : [blankStructure] }}
              departments={departments} onSave={save.mutate} onCancel={() => setEditing(null)} isPending={save.isPending} />
          ) : (
            <div key={emp._id} className="premium-card p-3.5 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-semibold text-text-primary">{emp.code}</span>
                  <span className="text-[13px] text-text-secondary">{emp.fullName}</span>
                  {emp.designation && <span className="text-[11.5px] text-text-muted">{emp.designation}</span>}
                  {emp.status !== 'active' && <span className="text-[10.5px] text-amber">inactive</span>}
                </div>
                {emp.department && <p className="text-[11.5px] text-text-muted mt-0.5">{deptName(emp.department) || '—'}</p>}
              </div>
              <button onClick={() => setEditing(emp)} className="p-2 rounded-lg text-text-muted hover:bg-glass-hover" title="Edit">
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
