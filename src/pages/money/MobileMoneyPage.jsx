import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { FileBarChart2, ChevronRight } from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { EmbeddedContext } from '@/components/mobile/MobilePage'
import { cn } from '@/utils/cn'
import ReceivablesPage from '@/pages/parties/ReceivablesPage'
import PayablesPage from '@/pages/parties/PayablesPage'
import TransactionsList from '@/pages/transactions/TransactionsList'

/**
 * Money tab — Mobile Easy §4.3. The phone's second job: who owes me,
 * what do I owe, what happened. One screen, three segments, each the
 * EXISTING purpose-built mobile surface embedded (EmbeddedContext drops
 * their inner large titles so headers never stack). Zero new data paths.
 *
 * Desktop visitors are sent to the full Receivables work view.
 */
const SEGMENTS = [
  { key: 'in', label: 'Owed to me', Component: ReceivablesPage },
  { key: 'out', label: 'I owe', Component: PayablesPage },
  { key: 'activity', label: 'Activity', Component: TransactionsList },
]

export default function MobileMoneyPage() {
  const isMobile = useIsMobile()
  const [seg, setSeg] = useState('in')

  if (!isMobile) return <Navigate to="/sales/receivables" replace />

  const Active = SEGMENTS.find((s) => s.key === seg)?.Component || ReceivablesPage

  return (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0 px-5" style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}>
        <h1 className="py-3 text-[26px] font-bold leading-tight tracking-tight text-text-primary">Money</h1>
        <div role="tablist" aria-label="Money views" className="flex gap-1 rounded-xl border border-glass bg-glass-panel p-1">
          {SEGMENTS.map((s) => (
            <button
              key={s.key}
              role="tab"
              aria-selected={seg === s.key}
              onClick={() => setSeg(s.key)}
              className={cn(
                'tap-target flex-1 rounded-lg px-2 py-2 text-sm font-semibold transition-colors',
                seg === s.key ? 'bg-accent text-ink-on-accent' : 'text-text-secondary hover:text-text-primary',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <EmbeddedContext.Provider value={true}>
          <div className="h-full px-5 pt-3">
            <Active />
          </div>
        </EmbeddedContext.Provider>
      </div>

      {/* Statements live one tap deeper — Money answers, Reports prove */}
      <Link
        to="/financial-reports/income-statement"
        className="tap-target mx-5 mb-2 flex flex-shrink-0 items-center gap-2.5 rounded-card border border-glass px-4 py-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-glass-hover hover:text-text-primary"
      >
        <FileBarChart2 className="h-4 w-4 text-text-muted" aria-hidden="true" />
        <span className="flex-1">Reports & statements</span>
        <ChevronRight className="h-4 w-4 text-text-muted" aria-hidden="true" />
      </Link>
    </div>
  )
}
