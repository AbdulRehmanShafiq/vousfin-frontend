/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { useAuthHydrated } from '@/hooks/useAuthHydrated'
import AuthLayout from '@/layouts/AuthLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import SkeletonLoader from '@/components/ui/SkeletonLoader'
import ErrorBoundary from '@/components/common/ErrorBoundary'

const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const BusinessSetup = lazy(() => import('@/pages/business/BusinessSetup'))
const BusinessSettings = lazy(() => import('@/pages/business/BusinessSettings'))
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'))
const AccountsPage = lazy(() => import('@/pages/accounts/AccountsPage'))
const TransactionsList = lazy(() => import('@/pages/transactions/TransactionsList'))
const CustomersList = lazy(() => import('@/pages/parties/CustomersList'))
const VendorsList = lazy(() => import('@/pages/parties/VendorsList'))
const IncomeStatementPage = lazy(() => import('@/pages/reports/IncomeStatementPage'))
const BalanceSheetPage = lazy(() => import('@/pages/reports/BalanceSheetPage'))
const CashFlowPage = lazy(() => import('@/pages/reports/CashFlowPage'))
const TrialBalancePage = lazy(() => import('@/pages/reports/TrialBalancePage'))
const AIForecastPage = lazy(() => import('@/pages/ai/AIForecastPage'))
const AIAssistantPage = lazy(() => import('@/pages/ai/AIAssistantPage'))
const AnomalyReviewPage = lazy(() => import('@/pages/ai/AnomalyReviewPage'))
const ExportPage = lazy(() => import('@/pages/reports/ExportPage'))

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-navy">
    <div className="w-64 max-w-sm space-y-4">
      <SkeletonLoader count={3} />
    </div>
  </div>
)

const withSuspense = (Component) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  </ErrorBoundary>
)

const hasBusiness = (user) => !!(user?.businessId?._id || user?.businessId)

/** Smart entry: / → login | setup | dashboard */
function RootRedirect() {
  const hydrated = useAuthHydrated()
  const { isAuthenticated, user } = useAuthStore()

  if (!hydrated) return <LoadingFallback />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!hasBusiness(user)) return <Navigate to="/business/setup" replace />
  return <Navigate to="/dashboard" replace />
}

/** Logged in but no business yet */
function RequireSetup() {
  const hydrated = useAuthHydrated()
  const { isAuthenticated, user } = useAuthStore()

  if (!hydrated) return <LoadingFallback />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (hasBusiness(user)) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

/** Logged in with business — dashboard area */
function RequireBusiness() {
  const hydrated = useAuthHydrated()
  const { isAuthenticated, user } = useAuthStore()

  if (!hydrated) return <LoadingFallback />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!hasBusiness(user)) return <Navigate to="/business/setup" replace />
  return <Outlet />
}

export const routes = [
  { path: '/', element: <RootRedirect /> },

  /* Public auth pages — always reachable (no auto-redirect away) */
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: withSuspense(Login) },
      { path: 'register', element: withSuspense(Register) },
      { path: 'forgot-password', element: withSuspense(ForgotPassword) },
    ],
  },

  /* Business setup — new users only */
  {
    element: <RequireSetup />,
    children: [
      { path: 'business/setup', element: withSuspense(BusinessSetup) },
    ],
  },

  /* App — existing users with a business */
  {
    element: <RequireBusiness />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: 'dashboard', element: withSuspense(Dashboard) },
          { path: 'accounts', element: withSuspense(AccountsPage) },
          { path: 'transactions', element: withSuspense(TransactionsList) },
          { path: 'customers', element: withSuspense(CustomersList) },
          { path: 'vendors', element: withSuspense(VendorsList) },
          { path: 'reports/income-statement', element: withSuspense(IncomeStatementPage) },
          { path: 'reports/balance-sheet', element: withSuspense(BalanceSheetPage) },
          { path: 'reports/cash-flow', element: withSuspense(CashFlowPage) },
          { path: 'reports/trial-balance', element: withSuspense(TrialBalancePage) },
          { path: 'ai/forecast', element: withSuspense(AIForecastPage) },
          { path: 'ai/assistant', element: withSuspense(AIAssistantPage) },
          { path: 'ai/anomaly', element: withSuspense(AnomalyReviewPage) },
          { path: 'reports/export', element: withSuspense(ExportPage) },
          { path: 'business/settings', element: withSuspense(BusinessSettings) },
        ],
      },
    ],
  },

  { path: '*', element: <RootRedirect /> },
]
