/**
 * MobileInvoices — phone-native Invoices list (Mobile-First Redesign, pass 2).
 * Purely presentational: InvoicesListPage owns all data + mutations and passes
 * them down, so there is one source of truth regardless of which screen renders.
 */
import { Plus, FileText, FileDown, Edit, Trash2, Search } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/formatters'
import MobilePage from '@/components/mobile/MobilePage'
import ListCard from '@/components/mobile/ListCard'
import SwipeRow from '@/components/mobile/SwipeRow'
import PullToRefresh from '@/components/mobile/PullToRefresh'
import InvoiceStatusBadge from '@/components/invoice/InvoiceStatusBadge'

const STATE_FILTERS = [
  { value: '',                 label: 'All' },
  { value: 'draft',            label: 'Draft' },
  { value: 'sent',             label: 'Sent' },
  { value: 'partially_paid',   label: 'Part-paid' },
  { value: 'paid',             label: 'Paid' },
  { value: 'overdue',          label: 'Overdue' },
]

export default function MobileInvoices({
  rows, currency, isLoading, query, onQuery, stateFilter, onStateFilter,
  onRefresh, onNew, onOpen, onDownloadPdf, onArchive,
}) {
  return (
    <MobilePage
      title="Invoices"
      subtitle="The bills you send to customers"
      cta={
        <button
          type="button"
          onClick={onNew}
          className="tap-target flex w-full items-center justify-center gap-2 rounded-2xl btn-gradient text-md font-semibold"
        >
          <Plus className="h-5 w-5" />
          New invoice
        </button>
      }
    >
      <PullToRefresh onRefresh={onRefresh} className="h-full">
        <div className="space-y-3 pb-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search invoices…"
              className="w-full rounded-xl bg-glass-panel border border-glass py-2.5 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
          </div>

          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-none">
            {STATE_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => onStateFilter(f.value)}
                className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-small font-semibold transition-colors ${
                  stateFilter === f.value ? 'bg-accent text-ink-on-accent' : 'bg-glass-panel text-text-secondary'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isLoading && !rows.length ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-glass-panel" />)}
            </div>
          ) : rows.length === 0 ? (
            <p className="rounded-xl bg-glass-panel p-6 text-center text-sm text-text-muted">
              {query ? 'No invoices match your search.' : 'No invoices yet. Tap "New invoice" to send your first one.'}
            </p>
          ) : (
            <div className="space-y-1.5">
              {rows.map((r) => {
                const balance = r.remainingBalance ?? (r.totalAmount || 0) - (r.paidAmount || 0)
                const actions = [
                  { label: 'PDF', icon: FileDown, onClick: () => onDownloadPdf(r._id) },
                  ...(r.state === 'draft' ? [{ label: 'Edit', icon: Edit, tone: 'accent', onClick: () => onOpen(r._id) }] : []),
                  { label: 'Archive', icon: Trash2, tone: 'danger', onClick: () => onArchive(r) },
                ]
                return (
                  <SwipeRow key={r._id} actions={actions}>
                    <ListCard
                      onClick={() => onOpen(r._id)}
                      leading={
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/12 text-accent">
                          <FileText className="h-4 w-4" />
                        </div>
                      }
                      title={r.customerSnapshot?.businessName || r.customerSnapshot?.fullName || 'Customer'}
                      subtitle={`${r.invoiceNumber} · ${formatDate(r.issueDate)}`}
                      trailing={formatCurrency(r.totalAmount || 0, r.currencyCode || currency)}
                      trailingSub={balance > 0 ? `${formatCurrency(balance, r.currencyCode || currency)} due` : 'Paid'}
                    />
                    <div className="px-3 pb-2 -mt-1">
                      <InvoiceStatusBadge state={r.state} kind="invoice" size="sm" />
                    </div>
                  </SwipeRow>
                )
              })}
            </div>
          )}
        </div>
      </PullToRefresh>
    </MobilePage>
  )
}
