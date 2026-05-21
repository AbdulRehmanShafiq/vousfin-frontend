import { useState, Fragment } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import Pagination from '@/components/common/Pagination'
import Spinner from '@/components/common/Spinner'

const SortHeader = ({ field, children, sortBy, sortOrder, onSort }) => (
  <button type="button" className="flex items-center gap-1 font-medium" onClick={() => onSort?.(field)}>
    {children}
    {sortBy === field && (sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
  </button>
)

export default function TransactionTable({
  transactions,
  loading,
  pagination,
  onPageChange,
  onLimitChange,
  onSort,
  sortBy,
  sortOrder,
  onRowClick,
  onReverse,
}) {
  const [expanded, setExpanded] = useState(null)

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3"><SortHeader field="transactionDate" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>Date</SortHeader></th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3"><SortHeader field="transactionType" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>Type</SortHeader></th>
              <th className="px-4 py-3 text-right"><SortHeader field="amount" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>Amount</SortHeader></th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map((tx) => {
              const id = tx._id || tx.id
              return (
                <Fragment key={id}>
                  <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => onRowClick?.(tx)}>
                    <td className="px-4 py-3">{formatDate(tx.transactionDate)}</td>
                    <td className="px-4 py-3 font-medium">{tx.description}</td>
                    <td className="px-4 py-3">{tx.transactionType}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(tx.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs', tx.status === 'reversed' ? 'bg-slate-100' : 'bg-emerald-100 text-emerald-800')}>
                        {tx.status || 'posted'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={(e) => { e.stopPropagation(); setExpanded(expanded === id ? null : id) }}>
                        {expanded === id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </td>
                  </tr>
                  {expanded === id && (
                    <tr key={`${id}-exp`}>
                      <td colSpan={6} className="bg-slate-50 px-4 py-3 text-xs text-slate-600">
                        Debit: {tx.debitAccount?.name || tx.debitAccountId} ? Credit: {tx.creditAccount?.name || tx.creditAccountId}
                        {tx.status !== 'reversed' && (
                          <button type="button" className="ml-4 text-red-600" onClick={() => onReverse?.(tx)}>Reverse</button>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="border-t px-4 py-3">
          <Pagination {...pagination} onPageChange={onPageChange} onLimitChange={onLimitChange} />
        </div>
      )}
    </div>
  )
}
