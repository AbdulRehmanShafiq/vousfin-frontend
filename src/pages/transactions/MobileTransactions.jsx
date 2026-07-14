/**
 * MobileTransactions — the phone-native transactions list (Mobile-First
 * Redesign, pass 1). Purely presentational: TransactionsList.jsx owns all
 * data-fetching/mutation state and passes it down, so there is exactly one
 * source of truth for the ledger regardless of which screen renders it.
 */
import { Plus, Eye, RotateCcw, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { formatCompactCurrency } from '@/utils/formatters'
import MobilePage from '@/components/mobile/MobilePage'
import ListCard from '@/components/mobile/ListCard'
import SwipeRow from '@/components/mobile/SwipeRow'
import PullToRefresh from '@/components/mobile/PullToRefresh'
import { isInflow } from '@/utils/transactionFlow'

export default function MobileTransactions({
  rows,
  currency,
  isLoading,
  totals,
  hasNextPage,
  onRefresh,
  canReverse,
  onReverse,
  onViewDetails,
  onCreate,
  sentinelRef,
}) {
  return (
    <MobilePage
      title="Transactions"
      subtitle="Everything you've recorded"
      cta={
        <button
          type="button"
          onClick={onCreate}
          className="tap-target flex w-full items-center justify-center gap-2 rounded-2xl btn-gradient text-md font-semibold"
        >
          <Plus className="h-5 w-5" />
          Record something
        </button>
      }
    >
      <PullToRefresh onRefresh={onRefresh} className="h-full">
        <div className="space-y-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-glass-panel p-3.5">
              <p className="text-xs text-text-muted">Money in</p>
              <p className="num mt-1 text-lg font-semibold text-positive">
                {formatCompactCurrency(totals?.inflow ?? 0, currency)}
              </p>
            </div>
            <div className="rounded-2xl bg-glass-panel p-3.5">
              <p className="text-xs text-text-muted">Money out</p>
              <p className="num mt-1 text-lg font-semibold text-text-primary">
                {formatCompactCurrency(totals?.outflow ?? 0, currency)}
              </p>
            </div>
          </div>

          {isLoading && !rows.length ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-glass-panel" />)}
            </div>
          ) : rows.length === 0 ? (
            <p className="rounded-xl bg-glass-panel p-6 text-center text-sm text-text-muted">
              Nothing recorded yet.
            </p>
          ) : (
            <div className="space-y-1.5">
              {rows.map((row) => {
                const inflow = isInflow(row.transactionType)
                const reversed = row.status === 'reversed'
                const actions = [
                  { label: 'Details', icon: Eye, onClick: () => onViewDetails(row) },
                  ...(canReverse(row) ? [{ label: 'Reverse', icon: RotateCcw, tone: 'danger', onClick: () => onReverse(row) }] : []),
                ]
                return (
                  <SwipeRow key={row._id} actions={actions}>
                    <ListCard
                      onClick={() => onViewDetails(row)}
                      leading={
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${reversed ? 'bg-glass-panel text-text-muted' : inflow ? 'bg-positive-muted text-positive' : 'bg-negative-muted text-negative'}`}>
                          {inflow ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                      }
                      title={row.description}
                      subtitle={new Date(row.transactionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + (reversed ? ' · Reversed' : '')}
                      trailing={`${inflow ? '+' : '−'}${formatCompactCurrency(row.amount, currency)}`}
                      className={reversed ? 'opacity-55' : ''}
                    />
                  </SwipeRow>
                )
              })}
            </div>
          )}

          {hasNextPage && (
            <div ref={sentinelRef} className="py-3 text-center text-small text-text-muted">
              Loading more…
            </div>
          )}
          {!hasNextPage && rows.length > 0 && (
            <p className="py-2 text-center text-small text-text-muted">All transactions loaded</p>
          )}
        </div>
      </PullToRefresh>
    </MobilePage>
  )
}
