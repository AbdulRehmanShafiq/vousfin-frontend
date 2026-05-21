import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const LABELS = {
  dashboard: 'Dashboard',
  transactions: 'Transactions',
  new: 'Create',
  reports: 'Reports',
  'income-statement': 'Income Statement',
  'balance-sheet': 'Balance Sheet',
  'cash-flow': 'Cash Flow',
  export: 'Export',
  ai: 'AI',
  assistant: 'Assistant',
  forecast: 'Forecast',
  anomalies: 'Anomalies',
  business: 'Business',
  setup: 'Setup',
  settings: 'Settings',
  admin: 'Admin',
  customers: 'Customers',
}

export default function Breadcrumbs() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  return (
    <nav className="mb-4 flex items-center gap-1 text-sm text-text-muted">
      <Link to="/dashboard" className="hover:text-cyan transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {segments.map((seg, i) => {
        const path = `/${segments.slice(0, i + 1).join('/')}`
        const isLast = i === segments.length - 1
        return (
          <span key={path} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="font-medium text-text-primary">{LABELS[seg] || seg}</span>
            ) : (
              <Link to={path} className="hover:text-cyan transition-colors">
                {LABELS[seg] || seg}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
