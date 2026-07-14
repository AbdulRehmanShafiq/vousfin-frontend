/**
 * FinancialReportsPage — Unified reports hub
 *
 * Mount-once / hide strategy: each tab stays mounted after first visit so
 * fetched data survives tab switches (no re-fetch or loading flash).
 *
 * URL: /financial-reports/:tab
 */
import { lazy, Suspense, useState, useCallback } from 'react'
import { useParams, useNavigate, Navigate, useSearchParams } from 'react-router-dom'
import { useIsMobile } from '@/hooks/useIsMobile'
import MobileReportCards from './MobileReportCards'
import {
  LineChart, Scale, PieChart, BookOpen, Download,
  Clock, Receipt, BarChart2, Building2, Layers, Printer,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import SkeletonLoader from '@/components/ui/SkeletonLoader'
import AINarrativePanel from '@/components/reports/AINarrativePanel'
import { usePeriodStore, PERIOD_PRESETS } from '@/stores/usePeriodStore'

const IncomeStatementPage   = lazy(() => import('./IncomeStatementPage'))
const BalanceSheetPage      = lazy(() => import('./BalanceSheetPage'))
const CashFlowPage          = lazy(() => import('./CashFlowPage'))
const TrialBalancePage      = lazy(() => import('./TrialBalancePage'))
const GeneralLedgerPage     = lazy(() => import('./GeneralLedgerPage'))
const AgingReportPage       = lazy(() => import('./AgingReportPage'))
const TaxReportPage         = lazy(() => import('./TaxReportPage'))
const ComparativeReportPage = lazy(() => import('./ComparativeReportPage'))
const ExportPage            = lazy(() => import('./ExportPage'))
const EquityStatementPage   = lazy(() => import('./EquityStatementPage'))

const TABS = [
  { key: 'income-statement',  label: 'Income Statement',  short: 'P&L',        icon: LineChart,  Component: IncomeStatementPage   },
  { key: 'balance-sheet',     label: 'Balance Sheet',     short: 'Balance',    icon: Scale,      Component: BalanceSheetPage      },
  { key: 'cash-flow',         label: 'Cash Flow',         short: 'Cash',       icon: PieChart,   Component: CashFlowPage          },
  { key: 'trial-balance',     label: 'Trial Balance',     short: 'Trial',      icon: BookOpen,   Component: TrialBalancePage      },
  { key: 'general-ledger',    label: 'General Ledger',    short: 'Ledger',     icon: Building2,  Component: GeneralLedgerPage     },
  { key: 'aging',             label: 'Aging',             short: 'Aging',      icon: Clock,      Component: AgingReportPage       },
  { key: 'tax',               label: 'Tax Report',        short: 'Tax',        icon: Receipt,    Component: TaxReportPage         },
  { key: 'comparative',       label: 'Comparative',       short: 'Compare',    icon: BarChart2,  Component: ComparativeReportPage },
  { key: 'equity',            label: 'Equity Statement',  short: 'Equity',     icon: Layers,     Component: EquityStatementPage   },
  { key: 'export',            label: 'Export',            short: 'Export',     icon: Download,   Component: ExportPage            },
]

const TabFallback = () => (
  <div className="w-full space-y-4 pt-2">
    <SkeletonLoader count={6} />
  </div>
)

export default function FinancialReportsPage() {
  const { tab }  = useParams()
  const navigate = useNavigate()
  const { preset, range, setPreset } = usePeriodStore()
  const isMobile = useIsMobile()
  const [searchParams] = useSearchParams()

  const validTab = TABS.find(t => t.key === tab)

  // Lazy mount-once (Ledger spec §10.4): only the visited tabs mount, so
  // entering Reports fires ONE fetch tree instead of ten. A visited tab stays
  // mounted, keeping the instant tab switches and shared caches.
  const [mountedTabs, setMountedTabs] = useState(() => (validTab ? { [validTab.key]: true } : {}))
  if (validTab && !mountedTabs[validTab.key]) {
    setMountedTabs((m) => ({ ...m, [validTab.key]: true }))
  }

  const handleTabChange = useCallback((key) => {
    navigate(`/financial-reports/${key}`, { replace: true })
  }, [navigate])

  // Mobile Easy §4.6 — phones read statements as answer cards first;
  // ?full=1 renders the complete desktop hub (linked from each card).
  // After every hook, so hook order never varies between renders.
  if (isMobile && searchParams.get('full') !== '1') {
    return <MobileReportCards />
  }

  if (!validTab) return <Navigate to="/financial-reports/income-statement" replace />

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Toolbar — sticky so the tabs + print stay reachable while scrolling.
          vf-no-print: the toolbar itself is excluded from the printed report. */}
      <div className="vf-no-print sticky top-0 z-20 -mx-1 px-1 pt-1 pb-2 bg-navy/85 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {/* One horizontal-scrolling row (never wraps into a tall grid on
              phones). scroll-px keeps the active chip from clipping at edges. */}
          <div className="flex flex-1 flex-nowrap gap-1 p-1 rounded-xl bg-glass-panel border border-glass overflow-x-auto scrollbar-none scroll-px-1">
            {TABS.map(t => {
              const isActive = t.key === tab
              return (
                <button
                  key={t.key}
                  onClick={() => handleTabChange(t.key)}
                  className={cn(
                    'flex flex-shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-lg text-small font-semibold',
                    'transition-all whitespace-nowrap',
                    isActive
                      ? 'bg-accent text-ink-on-accent shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-glass-hover'
                  )}
                >
                  <t.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden lg:inline">{t.label}</span>
                  <span className="lg:hidden">{t.short}</span>
                </button>
              )
            })}
          </div>
          <button
            onClick={() => window.print()}
            aria-label="Print or save as PDF"
            className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-glass px-3 py-2 text-sm font-medium text-text-secondary hover:bg-glass-hover hover:text-text-primary transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>

        {/* Global period — set once, applies to every statement tab (Ledger §10.4) */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5" role="group" aria-label="Report period">
          <span className="text-label uppercase tracking-wider text-text-muted mr-1">Period</span>
          {PERIOD_PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPreset(p.key)}
              aria-pressed={preset === p.key}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                preset === p.key
                  ? 'border-accent/40 bg-accent-soft text-accent'
                  : 'border-glass text-text-secondary hover:bg-glass-hover hover:text-text-primary',
              )}
            >
              {p.label}
            </button>
          ))}
          <span className={cn('text-xs num ml-1', preset === 'custom' ? 'text-accent' : 'text-text-muted')}>
            {range.startDate} → {range.endDate}
          </span>
        </div>
      </div>

      {/* FR-02.2 — CFO briefing (English/Urdu), grounded in the live GL */}
      {(tab === 'income-statement' || tab === 'balance-sheet') && <AINarrativePanel />}

      {/* Tab panels — mount-once, hide non-active */}
      {TABS.map(t => (
        <div key={t.key} className={t.key === tab ? '' : 'hidden'}>
          {mountedTabs[t.key] && (
            <Suspense fallback={<TabFallback />}>
              <t.Component />
            </Suspense>
          )}
        </div>
      ))}
    </div>
  )
}
