import { useState, useMemo } from 'react'
import { CheckCircle, XCircle, Scale } from 'lucide-react'
import { useTrialBalance } from '@/hooks/useReports'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { formatCurrency } from '@/utils/formatters'
import ExportButton from '@/components/ui/ExportButton'
import DataTable from '@/components/tables/DataTable'
import Input from '@/components/ui/Input'

export default function TrialBalancePage() {
  const [dateRange, setDateRange] = useState({
    endDate: new Date().toISOString().split('T')[0]
  })

  const { data, isLoading } = useTrialBalance(dateRange)
  const currency = useBusinessStore((s) => s.currency)

  const rows = useMemo(() => {
    // Backend returns { rows: [...], totalDebits, totalCredits }
    return Array.isArray(data?.rows)
      ? data.rows
      : Array.isArray(data?.accounts)
        ? data.accounts
        : Array.isArray(data?.docs)
          ? data.docs
          : Array.isArray(data)
            ? data
            : []
  }, [data])
  // Backend uses totalDebits/totalCredits; fall back to summing rows
  const totalDebit = typeof data?.totalDebits === 'number' ? data.totalDebits : typeof data?.totalDebit === 'number' ? data.totalDebit : rows.reduce((sum, r) => sum + (r.debit || 0), 0)
  const totalCredit = typeof data?.totalCredits === 'number' ? data.totalCredits : typeof data?.totalCredit === 'number' ? data.totalCredit : rows.reduce((sum, r) => sum + (r.credit || 0), 0)

  // Accounting validation: debits must equal credits (within 0.01 rounding tolerance)
  const isBalanced = !isLoading && rows.length > 0 && Math.abs(totalDebit - totalCredit) < 0.01

  const columns = [
    { key: 'accountName', header: 'Account Name', className: 'w-1/2' },
    { 
      key: 'debit', 
      header: 'Debit', 
      className: 'text-right', 
      cellClassName: 'text-right font-medium',
      render: (row) => row.debit > 0 ? formatCurrency(row.debit, currency) : '-' 
    },
    { 
      key: 'credit', 
      header: 'Credit', 
      className: 'text-right', 
      cellClassName: 'text-right font-medium',
      render: (row) => row.credit > 0 ? formatCurrency(row.credit, currency) : '-' 
    },
  ]

  const exportData = useMemo(() => {
    const arr = rows.map(r => ({
      Account: r.accountName,
      Debit: r.debit || 0,
      Credit: r.credit || 0
    }))
    arr.push({ Account: 'TOTAL', Debit: totalDebit, Credit: totalCredit })
    return arr
  }, [rows, totalDebit, totalCredit])

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-text-primary tracking-tight">
            <Scale className="h-6 w-6 text-cyan" />
            Trial Balance
          </h1>
          <p className="text-text-secondary mt-1">Verify that total debits equal total credits.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-text-muted text-sm">As of</span>
          <Input
            type="date"
            value={dateRange.endDate}
            onChange={e => setDateRange({ endDate: e.target.value })}
            className="w-36"
          />
          <ExportButton
            data={exportData}
            filename={`trial-balance-${dateRange.endDate}.csv`}
          />
        </div>
      </div>

      {/* Accounting Integrity Badge */}
      {!isLoading && rows.length > 0 && (
        <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${
          isBalanced
            ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400'
            : 'bg-red-400/10 border-red-400/30 text-red-400'
        }`}>
          {isBalanced
            ? <CheckCircle className="h-5 w-5 flex-shrink-0" />
            : <XCircle className="h-5 w-5 flex-shrink-0" />
          }
          <div>
            <p className="font-bold text-sm">
              {isBalanced ? 'Books are Balanced' : 'Books are Out of Balance'}
            </p>
            <p className="text-xs opacity-80">
              {isBalanced
                ? `Debits equal Credits — ${formatCurrency(totalDebit, currency)}`
                : `Difference: ${formatCurrency(Math.abs(totalDebit - totalCredit), currency)} — investigate journal entries`
              }
            </p>
          </div>
        </div>
      )}

      <div className="premium-card">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          emptyMessage="No account balances found. Record transactions to generate a trial balance."
        />

        {/* Footer Totals */}
        {!isLoading && rows.length > 0 && (
          <div className="flex border-t-2 border-glass bg-glass-hover p-4 px-6">
            <div className="w-1/2 font-black text-text-primary text-lg">TOTAL</div>
            <div className="w-1/4 text-right font-black text-text-primary text-lg">
              {formatCurrency(totalDebit, currency)}
            </div>
            <div className={`w-1/4 text-right font-black text-lg ${isBalanced ? 'text-text-primary' : 'text-red-400'}`}>
              {formatCurrency(totalCredit, currency)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
