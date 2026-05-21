import { formatCurrency } from '@/utils/formatters'
import Spinner from '@/components/common/Spinner'

export default function IncomeStatementTable({ data, loading }) {
  if (loading) return <Spinner size="lg" />
  if (!data) return null

  const sections = data.sections || data.lineItems || []
  const rows = Array.isArray(sections) ? sections : []

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
      <table className="w-full text-sm">
        <thead className="border-b bg-slate-50">
          <tr><th className="px-4 py-3 text-left font-semibold">Account</th><th className="px-4 py-3 text-right font-semibold">Amount</th></tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row, i) => (
            <tr key={i} className={row.isTotal ? 'bg-slate-50 font-semibold' : ''}>
              <td className={`px-4 py-2 ${row.indent ? 'pl-8' : ''}`}>{row.name || row.label}</td>
              <td className="px-4 py-2 text-right">{formatCurrency(row.amount)}</td>
            </tr>
          ))}
          {(data.netIncome !== undefined || data.totals?.netIncome !== undefined) && (
            <tr className="border-t-2 bg-brand-50 font-bold">
              <td className="px-4 py-3">Net Income</td>
              <td className="px-4 py-3 text-right">{formatCurrency(data.netIncome ?? data.totals?.netIncome)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
