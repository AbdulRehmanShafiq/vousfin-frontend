import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import Pagination from '@/components/common/Pagination'
import Button from '@/components/common/Button'
import emptyState from '@/assets/images/empty-state.svg'

const statusStyles = {
  posted: 'bg-emerald-100 text-emerald-800',
  reversed: 'bg-slate-100 text-slate-600',
}

export default function RecentTransactions({
  transactions = [],
  loading,
  pagination,
  onPageChange,
  onView,
  onReverse,
}) {
  const [expanded, setExpanded] = useState(null)
  const txId = (tx) => tx._id || tx.id

  if (loading) return <div className="h-64 animate-pulse rounded-xl bg-slate-100" />

  if (!transactions.length) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-8">
        <img src={emptyState} alt="" className="mb-4 h-32" />
        <p className="text-slate-600">No transactions yet</p>
        <Link to="/transactions/new" className="mt-4 text-sm font-medium text-brand-600">
          Create your first transaction
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h3 className="font-semibold text-slate-900">Recent Transactions</h3>
        <Link to="/transactions" className="text-sm text-brand-600 hover:underline">View all</Link>
      </div>
      <div className="divide-y">
        {transactions.map((tx) => {
          const id = txId(tx)
          return (
            <div key={id}>
              <button
                type="button"
                className="flex w-full items-center gap-4 px-5 py-3 text-left hover:bg-slate-50"
                onClick={() => setExpanded(expanded === id ? null : id)}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">{tx.description}</p>
                  <p className="text-xs text-slate-500">{formatDate(tx.transactionDate)}</p>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusStyles[tx.status] || statusStyles.posted)}>
                  {tx.status || 'posted'}
                </span>
                <span className="font-semibold text-slate-900">{formatCurrency(tx.amount)}</span>
              </button>
              {expanded === id && (
                <div className="flex gap-2 border-t bg-slate-50 px-5 py-2">
                  <Button variant="outline" onClick={() => onView?.(tx)}>Details</Button>
                  {tx.status !== 'reversed' && (
                    <Button variant="danger" onClick={() => onReverse?.(tx)}>Reverse</Button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {pagination && (
        <div className="px-5 pb-4">
          <Pagination {...pagination} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  )
}
