import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'
import {
  LayoutDashboard,
  Receipt,
  Users,
  Briefcase,
  LineChart,
  BrainCircuit,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  PieChart,
  Scale,
  MessageSquare,
  ShieldAlert,
  Download
} from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Accounts', href: '/accounts', icon: BookOpen },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Vendors', href: '/vendors', icon: Briefcase },
  { name: 'Income Statement', href: '/reports/income-statement', icon: LineChart },
  { name: 'Balance Sheet', href: '/reports/balance-sheet', icon: Scale },
  { name: 'Cash Flow', href: '/reports/cash-flow', icon: PieChart },
  { name: 'Trial Balance', href: '/reports/trial-balance', icon: BookOpen },
  { name: 'Export Reports', href: '/reports/export', icon: Download },
  { name: 'AI Forecast', href: '/ai/forecast', icon: BrainCircuit },
  { name: 'AI Assistant', href: '/ai/assistant', icon: MessageSquare },
  { name: 'Anomaly Detection', href: '/ai/anomaly', icon: ShieldAlert },
  { name: 'Settings', href: '/business/settings', icon: Settings },
]

export default function Sidebar({ isCollapsed, toggleCollapse, isMobile = false, closeMobile }) {
  const logout = useAuthStore((s) => s.logout)

  const SidebarContent = (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className={cn("flex items-center mb-8 px-4", isCollapsed && !isMobile ? "justify-center" : "justify-between")}>
          {(!isCollapsed || isMobile) && (
            <span className="text-2xl font-black tracking-tight text-text-primary">
              vous<span className="text-gradient">Fin</span>
            </span>
          )}
          {isCollapsed && !isMobile && (
            <span className="text-2xl font-black text-cyan">vF</span>
          )}
        </div>

        <nav className="space-y-1.5 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={isMobile ? closeMobile : undefined}
              className={({ isActive }) =>
                cn(
                  'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-premium',
                  isActive
                    ? 'bg-glass-panel text-cyan border border-glass shadow-glow-cyan/10'
                    : 'text-text-secondary hover:bg-glass-hover hover:text-text-primary',
                  isCollapsed && !isMobile && 'justify-center px-0'
                )
              }
              title={isCollapsed && !isMobile ? item.name : undefined}
            >
              <item.icon
                className={cn(
                  'flex-shrink-0 transition-colors',
                  isCollapsed && !isMobile ? 'h-5 w-5' : 'mr-3 h-5 w-5'
                )}
              />
              {(!isCollapsed || isMobile) && item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="px-2 pb-4 space-y-2">
        {!isMobile && (
          <button
            onClick={toggleCollapse}
            className={cn(
              "flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted hover:bg-glass-hover transition-premium",
              isCollapsed ? "justify-center" : ""
            )}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : (
              <>
                <ChevronLeft className="mr-3 h-5 w-5" /> Collapse
              </>
            )}
          </button>
        )}
        <button
          onClick={logout}
          className={cn(
            "flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-premium",
            isCollapsed && !isMobile && "justify-center"
          )}
          title={isCollapsed && !isMobile ? "Log out" : undefined}
        >
          <LogOut className={cn("flex-shrink-0", isCollapsed && !isMobile ? "h-5 w-5" : "mr-3 h-5 w-5")} />
          {(!isCollapsed || isMobile) && "Log out"}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {!isMobile && (
        <aside
          className={cn(
            'hidden lg:flex flex-col border-r border-glass bg-charcoal transition-all duration-300',
            isCollapsed ? 'w-20' : 'w-64'
          )}
        >
          <div className="flex-1 py-6">{SidebarContent}</div>
        </aside>
      )}
      {isMobile && (
        <div className="flex-1 py-6">{SidebarContent}</div>
      )}
    </>
  )
}