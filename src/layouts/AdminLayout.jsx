import { Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Shield } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'

/**
 * AdminLayout — minimal top-bar layout for the admin panel.
 * Does NOT use DashboardLayout because admin users have no business.
 */
export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Top bar */}
      <header className="border-b border-glass bg-charcoal px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <Shield className="h-5 w-5 text-accent" />
          <span className="font-display text-base font-semibold text-text-primary tracking-tight">
            vous<span className="text-gradient">Fin</span>
            <span className="ml-2 text-text-muted text-small font-normal">Admin</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-small text-text-secondary">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-small text-negative/80 hover:text-negative transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
