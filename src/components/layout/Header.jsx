import { Menu, Bell } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useLocation } from 'react-router-dom'

export default function Header({ toggleMobileDrawer }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  // Simple title generator based on route
  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('/dashboard')) return 'Dashboard'
    if (path.includes('/transactions')) return 'Transactions'
    if (path.includes('/customers')) return 'Customers'
    if (path.includes('/vendors')) return 'Vendors'
    if (path.includes('/reports')) return 'Reports'
    if (path.includes('/ai')) return 'AI Assistant'
    if (path.includes('/business')) return 'Business Settings'
    return 'vousFin'
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-glass bg-navy/80 px-4 backdrop-blur-md sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-text-muted hover:text-text-primary lg:hidden"
        onClick={toggleMobileDrawer}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-glass lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 items-center justify-between gap-x-4 lg:gap-x-6">
        <h1 className="text-lg font-bold text-text-primary tracking-tight">{getPageTitle()}</h1>
        
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" className="-m-2.5 p-2.5 text-text-muted hover:text-cyan transition-colors">
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-glass" aria-hidden="true" />

          {/* Profile dropdown stub */}
          <div className="flex items-center gap-x-3 text-sm font-medium text-text-primary">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-300 to-cyan flex items-center justify-center text-navy font-bold shadow-glow-cyan/20">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="hidden lg:block">{user?.fullName || 'User'}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
