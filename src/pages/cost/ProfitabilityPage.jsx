/**
 * ProfitabilityPage — SRS FR-07.3
 *
 * See which customers, products, or departments make money. Each row shows
 * revenue, variable (direct) cost, gross margin and margin %, with loss-makers
 * flagged. Export to CSV for Excel/Sheets.
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Loader2, Download } from 'lucide-react'
import costService from '@/services/cost.service'
import { downloadBlob } from '@/utils/exportHelpers'

const money = (n) => Number(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })
const pct = (p) => (p == null ? '—' : `${(p * 100).toFixed(1)}%`)
const DIMS = [
  { value: 'customer', label: 'Customers' },
  { value: 'product', label: 'Products' },
  { value: 'cost_center', label: 'Departments' },
]
const startOfYear = () => `${new Date().getFullYear()}-01-01`
const today = () => new Date().toISOString().slice(0, 10)

export default function ProfitabilityPage() {
  const [dim, setDim] = useState('customer')
  const [from, setFrom] = useState(startOfYear())
  const [to, setTo] = useState(today())

  const { data, isLoading } = useQuery({
    queryKey: ['cost', 'profitability', dim, from, to],
    queryFn: () => costService.profitability(dim, from, to).then((r) => r.data?.data),
    staleTime: 30 * 1000,
  })
  const segments = data?.segments || []
  const totals = data?.totals || {}

  const exportCsv = () => {
    const header = ['Name', 'Revenue', 'Variable cost', 'Gross margin', 'Gross margin %', 'Loss-maker']
    const rows = segments.map((s) => [
      `"${(s.name || '').replace(/"/g, '""')}"`, s.revenue, s.variableCost, s.grossMargin,
      s.grossMarginPct == null ? '' : (s.grossMarginPct * 100).toFixed(1), s.lossMaker ? 'yes' : 'no',
    ])
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `profitability-${dim}.csv`)
  }

  return (
    <div className="animate-fade-in pb-10 space-y-5 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-highlight/15"><TrendingUp className="h-5 w-5 text-highlight" /></div>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Profitability</h1>
          <p className="text-sm text-text-secondary mt-0.5">Who and what actually makes you money.</p>
        </div>
      </div>

      <div className="premium-card p-4 flex items-end gap-3 flex-wrap">
        <label className="flex flex-col gap-1">
          <span className="text-label text-text-muted">View by</span>
          <select value={dim} onChange={(e) => setDim(e.target.value)}
            className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none">
            {DIMS.map((d) => <option key={d.value} value={d.value} className="bg-charcoal">{d.label}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1"><span className="text-label text-text-muted">From</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none" /></label>
        <label className="flex flex-col gap-1"><span className="text-label text-text-muted">To</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary focus:outline-none" /></label>
        <button onClick={exportCsv} disabled={segments.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-small text-accent hover:bg-glass-hover disabled:opacity-40">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {isLoading && <div className="premium-card p-6 text-text-secondary text-small"><Loader2 className="h-4 w-4 animate-spin inline mr-2" />Working out the numbers…</div>}

      {!isLoading && segments.length > 0 && (
        <div className="premium-card p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-small">
              <thead>
                <tr className="text-text-muted text-left border-b border-glass">
                  <th className="py-2 pr-3 font-medium">Name</th>
                  <th className="py-2 px-3 font-medium text-right">Revenue</th>
                  <th className="py-2 px-3 font-medium text-right">Variable cost</th>
                  <th className="py-2 px-3 font-medium text-right">Gross margin</th>
                  <th className="py-2 px-3 font-medium text-right">GM %</th>
                  <th className="py-2 pl-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {segments.map((s) => (
                  <tr key={s.id || s.name} className="border-b border-glass/50">
                    <td className="py-2 pr-3 text-text-primary">{s.name}</td>
                    <td className="py-2 px-3 text-right text-text-secondary">{money(s.revenue)}</td>
                    <td className="py-2 px-3 text-right text-text-secondary">{money(s.variableCost)}</td>
                    <td className={`py-2 px-3 text-right ${s.lossMaker ? 'text-negative' : 'text-positive'}`}>{money(s.grossMargin)}</td>
                    <td className="py-2 px-3 text-right text-text-secondary">{pct(s.grossMarginPct)}</td>
                    <td className="py-2 pl-3">{s.lossMaker && <span className="text-label uppercase tracking-wider text-negative">Loss</span>}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold text-text-primary">
                  <td className="py-2 pr-3">Total</td>
                  <td className="py-2 px-3 text-right">{money(totals.revenue)}</td>
                  <td className="py-2 px-3 text-right">{money(totals.variableCost)}</td>
                  <td className="py-2 px-3 text-right">{money(totals.grossMargin)}</td>
                  <td className="py-2 px-3" /><td className="py-2 pl-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {!isLoading && segments.length === 0 && (
        <div className="premium-card p-6 text-center text-small text-text-secondary">No revenue or direct costs in this period yet.</div>
      )}
    </div>
  )
}
