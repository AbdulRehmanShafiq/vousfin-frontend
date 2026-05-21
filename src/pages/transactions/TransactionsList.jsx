import { useState, useMemo } from 'react'
import { Plus, ArrowUpRight, ArrowDownRight, Receipt } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { formatCurrency, formatDate } from '@/utils/formatters'

import Button from '@/components/ui/Button'
import KPICard from '@/components/ui/KPICard'
import DataTable from '@/components/tables/DataTable'
import Badge from '@/components/ui/Badge'
import TransactionFormModal from '@/components/forms/TransactionFormModal'

// Map backend transactionType values → filter group
const TYPE_FILTER_MAP = {
  income:           'Income',
  'cash sale':      'Income',
  'credit sale':    'AR/AP',
  expense:          'Expense',
  'cash purchase':  'Expense',
  'credit purchase':'AR/AP',
  'payment received':'AR/AP',
  'payment made':   'AR/AP',
  transfer:         'Transfer',
}

const FILTERS = ['All', 'Income', 'Expense', 'AR/AP', 'Transfer']

export default function TransactionsList() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const { data, isLoading } = useTransactions({ limit: 100 })
  const transactions = useMemo(() => {
    return Array.isArray(data?.docs) 
      ? data.docs 
      : Array.isArray(data?.transactions) 
        ? data.transactions 
        : Array.isArray(data) 
          ? data 
          : []
  }, [data])
  const currency = useBusinessStore((s) => s.currency)

  // Client-side filtering using the type-to-group map
  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'All') return transactions
    return transactions.filter((t) => {
      const group = TYPE_FILTER_MAP[(t.transactionType || '').toLowerCase()]
      return group === activeFilter
    })
  }, [transactions, activeFilter])

  // KPIs — sum all inflow/outflow types across real transaction types
  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        const type = (t.transactionType || '').toLowerCase()
        if (type === 'income' || type === 'cash sale' || type === 'credit sale' || type === 'payment received') {
          acc.inflow += t.amount || 0
        }
        if (type === 'expense' || type === 'cash purchase' || type === 'credit purchase' || type === 'payment made') {
          acc.outflow += t.amount || 0
        }
        return acc
      },
      { inflow: 0, outflow: 0 }
    )
  }, [transactions])

  const columns = [
    {
      key: 'transactionDate',
      header: 'Date',
      render: (row) => <span className="text-sm">{formatDate(row.transactionDate)}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      className: 'w-1/3',
      render: (row) => (
        <div>
          <p className="font-bold text-text-primary">{row.description}</p>
          <p className="text-xs text-text-muted mt-0.5">
            {row.debitAccountId?.accountName || 'Account'} → {row.creditAccountId?.accountName || 'Account'}
          </p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => {
        const type = (row.transactionType || '').toLowerCase()
        const variantMap = {
          'income':           'success',
          'cash sale':        'success',
          'expense':          'danger',
          'cash purchase':    'danger',
          'credit sale':      'info',
          'credit purchase':  'warning',
          'payment received': 'info',
          'payment made':     'warning',
          'transfer':         'default',
        }
        return (
          <Badge variant={variantMap[type] || 'default'}>
            {row.transactionType || 'Unknown'}
          </Badge>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        if (row.installmentPlanId) return <Badge variant="info">Installment</Badge>
        if (row.paymentStatus === 'unpaid') return <Badge variant="warning">Unpaid</Badge>
        if (row.paymentStatus === 'partial') return <Badge variant="warning">Partial</Badge>
        if (row.paymentStatus === 'paid') return <Badge variant="success">Paid</Badge>
        return <Badge variant="default">Posted</Badge>
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => {
        const type = (row.transactionType || '').toLowerCase()
        const isInflow = ['income', 'cash sale', 'credit sale', 'payment received'].includes(type)
        return (
          <span className={`font-bold tracking-tight ${isInflow ? 'text-emerald-400' : 'text-text-primary'}`}>
            {isInflow ? '+' : '−'}{formatCurrency(row.amount, currency)}
          </span>
        )
      },
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-text-primary tracking-tight">
            <Receipt className="h-6 w-6 text-cyan" />
            Transactions Ledger
          </h1>
          <p className="text-text-secondary mt-1">Record and review your double-entry accounting journal.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={Plus}>Record Transaction</Button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard
          title="Total Inflows"
          value={totals.inflow}
          loading={isLoading}
          currency={currency}
          icon={ArrowDownRight}
        />
        <KPICard
          title="Total Outflows"
          value={totals.outflow}
          loading={isLoading}
          currency={currency}
          icon={ArrowUpRight}
        />
        <KPICard
          title="Net Position"
          value={totals.inflow - totals.outflow}
          loading={isLoading}
          currency={currency}
          icon={Receipt}
          trend={totals.inflow - totals.outflow >= 0 ? 1 : -1}
        />
      </div>

      {/* Main Table Area */}
      <div className="premium-card">
        {/* Filters */}
        <div className="border-b border-glass p-4 sm:px-6">
          <div className="flex space-x-2 overflow-x-auto scrollbar-thin pb-2 sm:pb-0">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeFilter === f
                    ? 'bg-cyan text-navy shadow-glow-cyan'
                    : 'bg-glass-panel text-text-secondary hover:bg-glass-hover hover:text-text-primary border border-glass'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredTransactions}
          isLoading={isLoading}
          emptyMessage="No transactions found."
        />
      </div>

      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
