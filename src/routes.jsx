/* eslint-disable react-refresh/only-export-components */
import { lazy as reactLazy, Suspense } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

/**
 * lazy() with stale-chunk recovery. After a new deploy, Vite gives chunk files
 * fresh content hashes, so a tab still running the old build requests a chunk
 * filename that no longer exists → "Failed to fetch dynamically imported module".
 * On that failure we force ONE reload (which pulls the new index.html + chunk map);
 * if it still fails after reloading, it's a real error and we surface it.
 */
const CHUNK_RELOAD_KEY = 'vf-chunk-reloaded'
function lazy(importFn) {
  return reactLazy(async () => {
    try {
      const mod = await importFn()
      sessionStorage.removeItem(CHUNK_RELOAD_KEY) // success → reset the one-shot guard
      return mod
    } catch (err) {
      if (!sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
        window.location.reload()
        return new Promise(() => {}) // halt rendering; the page is reloading
      }
      throw err
    }
  })
}
import { useAuthStore } from '@/stores/useAuthStore'
import { useAuthHydrated } from '@/hooks/useAuthHydrated'
import AuthLayout from '@/layouts/AuthLayout'
import AdminLayout from '@/layouts/AdminLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import SkeletonLoader from '@/components/ui/SkeletonLoader'
import ErrorBoundary from '@/components/common/ErrorBoundary'

const LandingPage = lazy(() => import('@/pages/landing/LandingPage'))
const DocsPage = lazy(() => import('@/pages/public/DocsPage'))
const PublicContentPage = lazy(() => import('@/pages/public/PublicContentPage'))
const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'))
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail'))
const GoogleSuccess = lazy(() => import('@/pages/auth/GoogleSuccess'))
const BusinessSetup = lazy(() => import('@/pages/business/BusinessSetup'))
const BusinessSettings = lazy(() => import('@/pages/business/BusinessSettings'))
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'))
const ModuleCommandCenter = lazy(() => import('@/pages/hub/ModuleCommandCenter'))
const AccountsPage = lazy(() => import('@/pages/accounts/AccountsPage'))
const TransactionsList = lazy(() => import('@/pages/transactions/TransactionsList'))
const CustomersList   = lazy(() => import('@/pages/parties/CustomersList'))
const VendorsList     = lazy(() => import('@/pages/parties/VendorsList'))
const CustomerDetail  = lazy(() => import('@/pages/parties/CustomerDetail'))
const VendorDetail    = lazy(() => import('@/pages/parties/VendorDetail'))
const ReceivablesPage   = lazy(() => import('@/pages/parties/ReceivablesPage'))
const PayablesPage      = lazy(() => import('@/pages/parties/PayablesPage'))
/* Phase 2 — Invoice & Bill editors */
const InvoicesListPage  = lazy(() => import('@/pages/parties/InvoicesListPage'))
const InvoiceEditorPage = lazy(() => import('@/pages/parties/InvoiceEditorPage'))
const BillsListPage     = lazy(() => import('@/pages/parties/BillsListPage'))
const BillEditorPage    = lazy(() => import('@/pages/parties/BillEditorPage'))
const AIAssistantPage = lazy(() => import('@/pages/ai/AIAssistantPage'))
const IntelligencePage = lazy(() => import('@/pages/ai/IntelligencePage')) // Intelligence Roadmap — AI brain surfaces

/* ── New unified hub pages ── */
const FinancialReportsPage = lazy(() => import('@/pages/reports/FinancialReportsPage'))
const AIAnalystPage        = lazy(() => import('@/pages/ai/AIAnalystPage'))
const FiscalYearPage       = lazy(() => import('@/pages/accounting/FiscalYearPage'))
const ClosePage            = lazy(() => import('@/pages/accounting/ClosePage'))      // Ledger §7.5 — Close Cockpit
const CurrencyRatesPage    = lazy(() => import('@/pages/settings/CurrencyRatesPage'))
const TaxConfigPage        = lazy(() => import('@/pages/settings/TaxConfigPage'))    // Phase 5.4.8
const TaxAutopilotPage     = lazy(() => import('@/pages/tax/TaxAutopilotPage'))      // FR-04.1
const CommandCenterPage    = lazy(() => import('@/pages/autonomy/CommandCenterPage')) // Autonomy Phase 0
const AppearancePage       = lazy(() => import('@/pages/settings/AppearancePage'))
const SecurityPage         = lazy(() => import('@/pages/settings/SecurityPage'))       // Phase 9 NFR-SEC-01
const CostCentersPage      = lazy(() => import('@/pages/settings/CostCentersPage'))   // SRS FR-07.1
const TeamPage             = lazy(() => import('@/pages/settings/TeamPage'))           // Phase 6A — team & RBAC
const SodMatrixPage        = lazy(() => import('@/pages/settings/SodMatrixPage'))      // Phase 6B — segregation of duties
const AcceptInvitePage     = lazy(() => import('@/pages/AcceptInvitePage'))            // Phase 6A — accept invite
const EmployeesPage        = lazy(() => import('@/pages/payroll/EmployeesPage'))      // SRS FR-08
const PayrollRunPage       = lazy(() => import('@/pages/payroll/PayrollRunPage'))     // SRS FR-08
const PayslipsPage         = lazy(() => import('@/pages/payroll/PayslipsPage'))       // SRS FR-08
const BudgetEditorPage      = lazy(() => import('@/pages/budget/BudgetEditorPage'))      // SRS FR-04.1
const VarianceDashboardPage = lazy(() => import('@/pages/budget/VarianceDashboardPage')) // SRS FR-04.2
const JobCostingPage        = lazy(() => import('@/pages/cost/JobCostingPage'))          // SRS FR-07.2
const ProfitabilityPage     = lazy(() => import('@/pages/cost/ProfitabilityPage'))       // SRS FR-07.3
const BreakEvenPage         = lazy(() => import('@/pages/cost/BreakEvenPage'))           // SRS FR-07.4
const InventoryPage        = lazy(() => import('@/pages/inventory/InventoryPage'))    // Phase 5.5 Step 4
const InventoryReportsPage = lazy(() => import('@/pages/inventory/InventoryReportsPage')) // inventory engine phase 10
const StockOpsPage         = lazy(() => import('@/pages/inventory/StockOpsPage'))         // inventory engine phases 5 + 9
/* Phase 3.1 — Procurement */
const PurchaseOrdersPage     = lazy(() => import('@/pages/procurement/PurchaseOrdersPage'))
const PurchaseOrderEditorPage = lazy(() => import('@/pages/procurement/PurchaseOrderEditorPage'))
const GoodsReceiptsPage      = lazy(() => import('@/pages/procurement/GoodsReceiptsPage'))
/* Phase 3.3 — Vendor Portal & AP Automation */
const VendorPortal         = lazy(() => import('@/pages/vendor/VendorPortal'))
const APWorkflowBoard      = lazy(() => import('@/pages/ap/APWorkflowBoard'))
/* Phase 3.4 — Procurement Dashboard */
const ProcurementDashboard = lazy(() => import('@/pages/ap/ProcurementDashboard'))
/* ERP Step 9 — Unified cross-module audit / activity trail */
const ActivityTimelinePage = lazy(() => import('@/pages/audit/ActivityTimelinePage'))
/* Phase 6C — Internal audit workspace */
const InternalAuditPage = lazy(() => import('@/pages/audit/InternalAuditPage'))
const FixedAssetsPage = lazy(() => import('@/pages/assets/FixedAssetsPage')) // Fixed Asset Register
/* Phase 8 — Benchmarking (FR-09.3) + 13-Week Cash (FR-06.3) */
const BenchmarkingPage    = lazy(() => import('@/pages/analysis/BenchmarkingPage'))
const ThirteenWeekPage    = lazy(() => import('@/pages/cash/ThirteenWeekPage'))
/* Phase 7 — Compliance (FR-10) */
const ComplianceCalendarPage = lazy(() => import('@/pages/compliance/CalendarPage'))
const LeasesPage             = lazy(() => import('@/pages/compliance/LeasesPage'))
const AmlPage                = lazy(() => import('@/pages/compliance/AmlPage'))
/* FR-01 — Autonomous Transaction Engine */
const TransactionReviewQueuePage      = lazy(() => import('@/pages/ai/TransactionReviewQueuePage'))
const ReconciliationExceptionQueuePage= lazy(() => import('@/pages/reconciliation/ReconciliationExceptionQueuePage'))
/* #5 Recurring/Templates + #6 Approval workflow + #7 Bank reconciliation */
const TemplatesPage        = lazy(() => import('@/pages/transactions/TemplatesPage'))
const ApprovalsQueuePage   = lazy(() => import('@/pages/approvals/ApprovalsQueuePage'))
const BankReconciliationPage = lazy(() => import('@/pages/reconciliation/BankReconciliationPage'))
const ReportBuilderPage      = lazy(() => import('@/pages/reports/ReportBuilderPage'))        // FR-02.5
const SupportPage            = lazy(() => import('@/pages/support/SupportPage'))
const AdminPage              = lazy(() => import('@/pages/admin/AdminPage'))                  // Admin panel
const DesignCatalogPage      = lazy(() => import('@/pages/design/DesignCatalogPage'))         // Ledger catalog (dev only)
const MobileMoneyPage        = lazy(() => import('@/pages/money/MobileMoneyPage'))            // Mobile Easy — Money tab
const MobileInboxPage        = lazy(() => import('@/pages/inbox/MobileInboxPage'))            // Mobile Easy — Inbox

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

const hasBusiness = (user) => !!user?.businessId
const isAdmin = (user) => user?.role === 'admin'

/** Smart entry: / → landing | /admin | setup | dashboard */
function RootRedirect() {
  const hydrated = useAuthHydrated()
  const { isAuthenticated, user } = useAuthStore()

  if (!hydrated) return <LoadingFallback />
  if (!isAuthenticated) return withSuspense(LandingPage)
  if (isAdmin(user)) return <Navigate to="/admin" replace />
  if (!hasBusiness(user)) return <Navigate to="/business/setup" replace />
  return <Navigate to="/dashboard" replace />
}

/** Logged in with role=admin — admin panel area */
function RequireAdmin() {
  const hydrated = useAuthHydrated()
  const { isAuthenticated, user } = useAuthStore()

  if (!hydrated) return <LoadingFallback />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin(user)) return <Navigate to="/dashboard" replace />
  return <Outlet />
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

  /* Public marketing / legal / docs pages — reachable without auth */
  { path: 'docs', element: withSuspense(DocsPage) },
  { path: 'about', element: withSuspense(() => <PublicContentPage doc="about" />) },
  { path: 'contact', element: withSuspense(() => <PublicContentPage doc="contact" />) },
  { path: 'careers', element: withSuspense(() => <PublicContentPage doc="careers" />) },
  { path: 'blog', element: withSuspense(() => <PublicContentPage doc="blog" />) },
  { path: 'privacy', element: withSuspense(() => <PublicContentPage doc="privacy" />) },
  { path: 'terms', element: withSuspense(() => <PublicContentPage doc="terms" />) },
  { path: 'security', element: withSuspense(() => <PublicContentPage doc="security" />) },
  { path: 'gdpr', element: withSuspense(() => <PublicContentPage doc="gdpr" />) },

  /* Public auth pages — always reachable (no auto-redirect away) */
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: withSuspense(Login) },
      { path: 'register', element: withSuspense(Register) },
      { path: 'forgot-password', element: withSuspense(ForgotPassword) },
      { path: 'reset-password', element: withSuspense(ResetPassword) },
      { path: 'verify-email', element: withSuspense(VerifyEmail) },
      { path: 'auth/google/success', element: withSuspense(GoogleSuccess) }, // Google OAuth callback
      { path: 'accept-invite', element: withSuspense(AcceptInvitePage) }, // Phase 6A — reachable with or without a business
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
          { path: 'dashboard',         element: withSuspense(Dashboard)         },
          /* ── Module command centers (rail module → its dashboard) ── */
          { path: 'sales',           element: withSuspense(ModuleCommandCenter) },
          { path: 'purchases',       element: withSuspense(ModuleCommandCenter) },
          { path: 'banking',         element: withSuspense(ModuleCommandCenter) },
          { path: 'accounting',      element: withSuspense(ModuleCommandCenter) },
          { path: 'reports',         element: withSuspense(ModuleCommandCenter) },
          { path: 'planning',        element: withSuspense(ModuleCommandCenter) },
          { path: 'payroll',         element: withSuspense(ModuleCommandCenter) },
          { path: 'tax-compliance',  element: withSuspense(ModuleCommandCenter) },
          { path: 'settings',        element: withSuspense(ModuleCommandCenter) },
          /* Legacy hub URLs → render the same command center (module derived from path) */
          { path: 'hub/:sectionKey', element: withSuspense(ModuleCommandCenter) },
          { path: 'accounts',          element: withSuspense(AccountsPage)      },
          { path: 'transactions',      element: withSuspense(TransactionsList)  },
          { path: 'transactions/templates', element: withSuspense(TemplatesPage)      }, // #5
          { path: 'approvals',              element: withSuspense(ApprovalsQueuePage) }, // #6
          /* ── Sales (Customers + AR) ───────────────────────────────────── */
          { path: 'customers',              element: withSuspense(CustomersList)   },
          { path: 'customers/:id',          element: withSuspense(CustomerDetail)  },
          { path: 'sales/receivables',      element: withSuspense(ReceivablesPage) },
          /* Phase 2 — Invoice generator */
          { path: 'sales/invoices',          element: withSuspense(InvoicesListPage)  },
          { path: 'sales/invoices/new',      element: withSuspense(InvoiceEditorPage) },
          { path: 'sales/invoices/:id/edit', element: withSuspense(InvoiceEditorPage) },
          { path: 'sales/customers',        element: <Navigate to="/customers" replace /> },

          /* ── Purchases (Vendors + AP) ─────────────────────────────────── */
          { path: 'vendors',                element: withSuspense(VendorsList)    },
          { path: 'vendors/:id',            element: withSuspense(VendorDetail)   },
          { path: 'purchases/payables',     element: withSuspense(PayablesPage)   },
          /* Phase 2 — Bill generator */
          { path: 'purchases/bills',          element: withSuspense(BillsListPage)   },
          { path: 'purchases/bills/new',      element: withSuspense(BillEditorPage)  },
          { path: 'purchases/bills/:id/edit', element: withSuspense(BillEditorPage)  },
          { path: 'purchases/vendors',      element: <Navigate to="/vendors" replace /> },
          /* Phase 3.1 — Procurement */
          { path: 'procurement/purchase-orders',          element: withSuspense(PurchaseOrdersPage)      },
          { path: 'procurement/purchase-orders/new',      element: withSuspense(PurchaseOrderEditorPage) },
          { path: 'procurement/purchase-orders/:id/edit', element: withSuspense(PurchaseOrderEditorPage) },
          { path: 'procurement/goods-receipts',           element: withSuspense(GoodsReceiptsPage)       },
          { path: 'procurement', element: <Navigate to="/procurement/purchase-orders" replace /> },
          /* Phase 3.3 — Vendor Portal + AP Workflow */
          { path: 'vendors/:id/portal', element: withSuspense(VendorPortal) },
          { path: 'purchases/ap-workflow', element: withSuspense(APWorkflowBoard) },
          /* Phase 3.4 — Procurement Dashboard */
          { path: 'purchases/procurement-dashboard', element: withSuspense(ProcurementDashboard) },
          { path: 'business/settings', element: withSuspense(BusinessSettings)  },
          { path: 'accounting/fiscal-years',    element: withSuspense(FiscalYearPage)     },
          { path: 'accounting/close',           element: withSuspense(ClosePage)          }, // Close Cockpit
          { path: 'settings/exchange-rates',    element: withSuspense(CurrencyRatesPage)  },
          { path: 'settings/tax',               element: withSuspense(TaxConfigPage)      }, // Phase 5.4.8
          { path: 'settings/appearance',        element: withSuspense(AppearancePage)     },
          { path: 'settings/security',          element: withSuspense(SecurityPage)       }, // Phase 9 NFR-SEC-01
          { path: 'settings/cost-centers',      element: withSuspense(CostCentersPage)    }, // SRS FR-07.1
          { path: 'settings/team',              element: withSuspense(TeamPage)           }, // Phase 6A — team & RBAC
          { path: 'settings/duties',            element: withSuspense(SodMatrixPage)      }, // Phase 6B — segregation of duties
          { path: 'payroll/employees',          element: withSuspense(EmployeesPage)      }, // SRS FR-08
          { path: 'payroll/run',                element: withSuspense(PayrollRunPage)     }, // SRS FR-08
          { path: 'payroll/payslips',           element: withSuspense(PayslipsPage)       }, // SRS FR-08
          { path: 'budgets/editor',             element: withSuspense(BudgetEditorPage)      }, // SRS FR-04.1
          { path: 'budgets/variance',           element: withSuspense(VarianceDashboardPage) }, // SRS FR-04.2
          { path: 'cost/jobs',                  element: withSuspense(JobCostingPage)     }, // SRS FR-07.2
          { path: 'cost/profitability',         element: withSuspense(ProfitabilityPage)  }, // SRS FR-07.3
          { path: 'cost/break-even',            element: withSuspense(BreakEvenPage)      }, // SRS FR-07.4
          { path: 'inventory',                  element: withSuspense(InventoryPage)      }, // Phase 5.5 Step 4
          { path: 'inventory/reports',          element: withSuspense(InventoryReportsPage) },
          { path: 'inventory/stock-jobs',       element: withSuspense(StockOpsPage)       },
          { path: 'activity',                   element: withSuspense(ActivityTimelinePage) }, // ERP Step 9
          { path: 'audit/internal',             element: withSuspense(InternalAuditPage)    }, // Phase 6C
          { path: 'assets',                     element: withSuspense(FixedAssetsPage)      }, // Fixed Asset Register
          { path: 'analysis/benchmarking',      element: withSuspense(BenchmarkingPage)      }, // Phase 8 FR-09.3
          { path: 'cash/thirteen-week',         element: withSuspense(ThirteenWeekPage)      }, // Phase 8 FR-06.3
          { path: 'compliance/calendar',        element: withSuspense(ComplianceCalendarPage) }, // FR-10.1
          { path: 'compliance/leases',          element: withSuspense(LeasesPage)             }, // FR-10.2
          { path: 'compliance/aml',             element: withSuspense(AmlPage)                }, // FR-10.3
          { path: 'ai/review-queue',            element: withSuspense(TransactionReviewQueuePage) }, // FR-01.2
          { path: 'reconciliation/exceptions',  element: withSuspense(ReconciliationExceptionQueuePage) }, // FR-01.3
          { path: 'reconciliation/bank',        element: withSuspense(BankReconciliationPage) }, // #7
          { path: 'tax',                        element: withSuspense(TaxAutopilotPage)       }, // FR-04.1 Tax Autopilot
          { path: 'command-center',             element: withSuspense(CommandCenterPage)      }, // Autonomy Phase 0

          /* ── Financial Reports hub ─────────────────────────────────────── */
          /* /financial-reports  → default tab */
          { path: 'financial-reports',         element: <Navigate to="/financial-reports/income-statement" replace /> },
          { path: 'financial-reports/builder', element: withSuspense(ReportBuilderPage) },  // FR-02.5
          { path: 'financial-reports/:tab',    element: withSuspense(FinancialReportsPage) },

          /* Backward-compat redirects for old /reports/* bookmarks */
          { path: 'reports/income-statement', element: <Navigate to="/financial-reports/income-statement" replace /> },
          { path: 'reports/balance-sheet',    element: <Navigate to="/financial-reports/balance-sheet"    replace /> },
          { path: 'reports/cash-flow',        element: <Navigate to="/financial-reports/cash-flow"        replace /> },
          { path: 'reports/trial-balance',    element: <Navigate to="/financial-reports/trial-balance"    replace /> },
          { path: 'reports/export',           element: <Navigate to="/financial-reports/export"           replace /> },
          { path: 'reports/equity',           element: <Navigate to="/financial-reports/equity"           replace /> },
          { path: 'reports/builder',          element: <Navigate to="/financial-reports/builder"          replace /> },

          /* ── AI Analyst hub ────────────────────────────────────────────── */
          /* /ai-analyst  → default tab */
          { path: 'ai-analyst',      element: <Navigate to="/ai-analyst/forecast" replace /> },
          { path: 'ai-analyst/:tab', element: withSuspense(AIAnalystPage) },

          /* Backward-compat redirects for old /ai/* bookmarks */
          { path: 'ai/forecast',   element: <Navigate to="/ai-analyst/forecast"  replace /> },
          { path: 'ai/anomaly',    element: <Navigate to="/ai-analyst/anomalies" replace /> },

          /* ai/assistant stays accessible directly (also exposed in AI Analyst → Insights tab) */
          { path: 'ai/assistant', element: withSuspense(AIAssistantPage) },
          { path: 'ai/intelligence', element: withSuspense(IntelligencePage) }, // Intelligence Roadmap

          { path: 'support', element: withSuspense(SupportPage) },

          /* Mobile Easy — phone-first surfaces (desktop visits redirect) */
          { path: 'money', element: withSuspense(MobileMoneyPage) },
          { path: 'inbox', element: withSuspense(MobileInboxPage) },

          /* Ledger design catalog — the living component gallery (dev only) */
          ...(import.meta.env.DEV ? [{ path: 'design', element: withSuspense(DesignCatalogPage) }] : []),
        ],
      },
    ],
  },

  /* Admin panel — role=admin only, no business required */
  {
    element: <RequireAdmin />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: 'admin', element: withSuspense(AdminPage) },
        ],
      },
    ],
  },

  { path: '*', element: <RootRedirect /> },
]
