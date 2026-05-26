import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Plus,
} from 'lucide-react'

import { useBusinessStore } from '@/stores/useBusinessStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useTransactions } from '@/hooks/useTransactions'
import { useDashboardAll } from '@/hooks/useReports'
import { formatCurrency, formatDate } from '@/utils/formatters'

import KPICard from '@/components/ui/KPICard'
import Badge from '@/components/ui/Badge'
import SkeletonLoader from '@/components/ui/SkeletonLoader'
import RevenueExpensesChart from '@/components/dashboard/RevenueExpensesChart'
import CashFlowTrendChart from '@/components/dashboard/CashFlowTrendChart'

const INFLOW_TYPES = new Set(['income', 'cash sale', 'credit sale', 'payment received'])

export default function Dashboard() {
  const { user } = useAuthStore()
  const { currency, activeBusiness } = useBusinessStore()
  const businessName = activeBusiness?.businessName

  // YTD date range
  const dateRange = useMemo(() => ({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  }), [])

  const { data: dashboardData, isLoading: isLoadingDash } = useDashboardAll(dateRange)
  const { data: txData, isLoading: isLoadingTx } = useTransactions({ limit: 5 })

  const recentTransactions = Array.isArray(txData?.docs)
    ? txData.docs
    : Array.isArray(txData?.transactions)
      ? txData.transactions
      : Array.isArray(txData)
        ? txData
        : []

  // KPI values from dashboard API
  const kpis = dashboardData?.kpis || {}
  const revenue = kpis.revenue ?? 0
  const expenses = kpis.expenses ?? 0
  const netProfit = kpis.netProfit ?? 0
  const cashBalance = kpis.cashBalance ?? 0
  const profitMargin = kpis.profitMargin ?? 0
  const accountsReceivable = kpis.accountsReceivable ?? 0
  const accountsPayable = kpis.accountsPayable ?? 0

  // Chart data
  const revenueVsExpenses = dashboardData?.revenueVsExpenses ?? []
  const cashFlowTrend = dashboardData?.cashFlowTrend ?? []

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-2xl font-black text-text-primary tracking-tight">
          <LayoutDashboard className="h-6 w-6 text-cyan" />
          Dashboard Overview
        </h1>
        <p className="text-text-secondary">
          Welcome back, {user?.fullName || user?.name || 'User'}.
          {' '}Here&apos;s your YTD snapshot for{' '}
          <span className="text-text-primary font-medium">{businessName || 'your business'}</span>.
        </p>
      </div>

      {/* KPI Grid — 7 metrics (FR-15) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <KPICard
          title="Revenue"
          value={revenue}
          loading={isLoadingDash}
          currency={currency}
          icon={TrendingUp}
          trend={revenue > 0 ? 1 : 0}
        />
        <KPICard
          title="Expenses"
          value={expenses}
          loading={isLoadingDash}
          currency={currency}
          icon={TrendingDown}
        />
        <KPICard
          title="Net Profit"
          value={netProfit}
          loading={isLoadingDash}
          currency={currency}
          icon={DollarSign}
          trend={netProfit > 0 ? 1 : netProfit < 0 ? -1 : 0}
        />
        <KPICard
          title="Cash Balance"
          value={cashBalance}
          loading={isLoadingDash}
          currency={currency}
          icon={Wallet}
          trend={cashBalance > 0 ? 1 : 0}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Profit Margin"
          value={profitMargin}
          format="percent"
          loading={isLoadingDash}
          icon={Percent}
          trend={profitMargin > 0 ? 1 : profitMargin < 0 ? -1 : 0}
        />
        <KPICard
          title="Accounts Receivable"
          value={accountsReceivable}
          loading={isLoadingDash}
          currency={currency}
          icon={ArrowDownRight}
        />
        <KPICard
          title="Accounts Payable"
          value={accountsPayable}
          loading={isLoadingDash}
          currency={currency}
          icon={ArrowUpRight}
        />
      </div>

      {/* Charts Row — FR-16 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <RevenueExpensesChart
          data={revenueVsExpenses}
          loading={isLoadingDash}
          currency={currency}
        />
        <CashFlowTrendChart
          data={cashFlowTrend}
          loading={isLoadingDash}
          currency={currency}
        />
      </div>

      {/* Bottom Row: Recent Transactions + System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <div className="premium-card p-6">
            <div className="flex items-center justify-between border-b border-glass pb-3 mb-4">
              <h2 className="text-lg font-bold text-text-primary">Recent Transactions</h2>
              <Link to="/transactions" className="text-xs text-cyan hover:underline font-medium">View All</Link>
            </div>

            {isLoadingTx ? (
              <SkeletonLoader count={4} />
            ) : recentTransactions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-text-muted mb-3">No transactions yet.</p>
                <Link
                  to="/transactions"
                  className="inline-flex items-center gap-2 text-sm text-cyan font-medium hover:underline"
                >
                  <Plus className="h-4 w-4" />
                  Record your first transaction
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((tx) => {
                  const isInflow = INFLOW_TYPES.has((tx.transactionType || '').toLowerCase())
                  return (
                    <div
                      key={tx._id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-glass-hover border border-transparent hover:border-glass transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${isInflow ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
                          {isInflow
                            ? <ArrowDownRight className="h-4 w-4" />
                            : <ArrowUpRight className="h-4 w-4" />
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-text-primary truncate max-w-[180px] text-sm">{tx.description}</p>
                          <p className="text-xs text-text-muted">{formatDate(tx.transactionDate)} · {tx.transactionType || 'Transaction'}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className={`font-bold text-sm ${isInflow ? 'text-emerald-400' : 'text-text-primary'}`}>
                          {isInflow ? '+' : '−'}{formatCurrency(tx.amount, currency)}
                        </p>
                        <Badge
                          variant={tx.paymentStatus === 'unpaid' ? 'warning' : tx.paymentStatus === 'partial' ? 'warning' : 'default'}
                          className="text-[10px] mt-1"
                        >
                          {tx.paymentStatus === 'unpaid' ? 'Unpaid' : tx.paymentStatus === 'partial' ? 'Partial' : 'Posted'}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="lg:col-span-1">
          <div className="premium-card p-6 bg-gradient-to-br from-glass-panel to-cyan/5 border-cyan/20 h-full">
            <h2 className="text-lg font-bold text-text-primary mb-6">System Status</h2>
            <div className="space-y-5">
              {[
                { label: 'AI Forecasting Engine', status: 'Online' },
                { label: 'Auto-Reconciliation', status: 'Online' },
                { label: 'Double-Entry Ledger', status: 'Online' },
                { label: 'Report Engine', status: 'Online' },
              ].map(({ label, status }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{label}</span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                    {status}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-glass">
                <span className="text-sm text-text-secondary">Last Sync</span>
                <span className="text-xs text-text-muted">Just now</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
