import { formatCurrency } from '@/utils/formatters'
import Spinner from '@/components/common/Spinner'

const GROUPS = ['operating', 'investing', 'financing']

export default function CashFlowTable({ data, loading }) {
  if (loading) return <Spinner size="lg" />
  if (!data) return null

  return (
    <div className="space-y-6">
      {GROUPS.map((group) => {
        const section = data[group] || data.sections?.[group]
        if (!section) return null
        const lines = section.lines || section.items || []
        return (
          <div key={group} className="rounded-xl border border-glass bg-navy-2 shadow-card">
            <h4 className="border-b bg-glass-panel px-4 py-3 font-semibold capitalize">{group} Activities</h4>
            <table className="w-full text-sm">
              <tbody>
                {lines.map((row, i) => (
                  <tr key={i} className="border-b border-glass">
                    <td className="px-4 py-2">{row.name || row.description}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(row.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-glass-panel font-semibold">
                  <td className="px-4 py-2">Net cash from {group}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(section.net || section.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      })}
      {(data.netChangeInCash !== undefined) && (
        <div className="rounded-xl bg-brand-50 px-4 py-3 font-bold">
          Net change in cash: {formatCurrency(data.netChangeInCash)}
        </div>
      )}
    </div>
  )
}
