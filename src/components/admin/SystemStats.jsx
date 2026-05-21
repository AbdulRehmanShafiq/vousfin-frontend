import { Users, Building2, Receipt, Activity } from 'lucide-react'
import { formatNumber } from '@/utils/formatters'

const icons = { users: Users, businesses: Building2, transactions: Receipt, activeUsers: Activity }

export default function SystemStats({ stats, loading }) {
  const cards = [
    { key: 'totalUsers', label: 'Total users', icon: 'users' },
    { key: 'totalBusinesses', label: 'Businesses', icon: 'businesses' },
    { key: 'totalTransactions', label: 'Transactions', icon: 'transactions' },
    { key: 'activeUsers', label: 'Active (30d)', icon: 'activeUsers' },
  ]

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />)}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ key, label, icon }) => {
        const Icon = icons[icon] || Activity
        return (
          <div key={key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{label}</p>
              <Icon className="h-5 w-5 text-brand-600" />
            </div>
            <p className="mt-2 text-2xl font-bold">{formatNumber(stats?.[key] ?? 0)}</p>
          </div>
        )
      })}
    </div>
  )
}
