import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Receipt, MessageSquare, FileText, Settings } from 'lucide-react'
import { cn } from '@/utils/cn'

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/transactions', icon: Receipt, label: 'Txns' },
  { to: '/ai/assistant', icon: MessageSquare, label: 'AI' },
  { to: '/reports/income-statement', icon: FileText, label: 'Reports' },
  { to: '/business/settings', icon: Settings, label: 'Settings' },
]

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-glass bg-charcoal/95 backdrop-blur-md lg:hidden">
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors',
              isActive ? 'text-cyan' : 'text-text-muted hover:text-text-secondary'
            )
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
