/**
 * BillsListPage — Phase 2 — Landing page for the Bill (AP) domain.
 */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, FileText, Edit, Trash2 } from 'lucide-react'
import { useBills, useArchiveBill } from '@/hooks/useInvoices'
import { useListViewState } from '@/hooks/useListViewState'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { useIsMobile } from '@/hooks/useIsMobile'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import DataTable from '@/design-system/data/SmartTable'
import { wideEnoughForInspector } from '@/design-system/workflow/splitView'
import DocumentInspector from '@/components/invoice/DocumentInspector'
import InvoiceStatusBadge from '@/components/invoice/InvoiceStatusBadge'
import ApprovalChip from '@/components/invoice/ApprovalChip'
import MobileBills from './MobileBills'

export default function BillsListPage() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const currency = useBusinessStore(s => s.currency)
  // Saved view — search + status filter survive leaving and returning (wave 2)
  const [view, setView] = useListViewState('bills', { query: '', state: '' })
  const { query, state: stateFilter } = view
  const setQuery = (q) => setView({ query: q })
  const setStateFilter = (s) => setView({ state: s })

  const { data, isLoading, refetch } = useBills({
    search: query || undefined,
    state:  stateFilter || undefined,
    limit:  100,
  })
  const archiveBill = useArchiveBill()
  // Inspector split view (spec §7.2) — peek at a row without leaving the list
  const [peek, setPeek] = useState(null)

  const bills = useMemo(() => {
    const arr = Array.isArray(data?.data) ? data.data
              : Array.isArray(data)       ? data : []
    return arr
  }, [data])

  const handleArchive = (r) => {
    if (confirm(`Archive bill ${r.billNumber}?`)) archiveBill.mutate({ id: r._id })
  }

  // Mobile-First Redesign, pass 2 — card list instead of the table.
  if (isMobile) {
    return (
      <MobileBills
        rows={bills}
        currency={currency}
        isLoading={isLoading}
        query={query}
        onQuery={setQuery}
        stateFilter={stateFilter}
        onStateFilter={setStateFilter}
        onRefresh={async () => { await refetch() }}
        onNew={() => navigate('/purchases/bills/new')}
        onOpen={(id) => navigate(`/purchases/bills/${id}/edit`)}
        onArchive={handleArchive}
      />
    )
  }

  const columns = [
    {
      key: 'billNumber',
      header: 'Bill #',
      render: (r) => (
        <button
          type="button"
          onClick={() => navigate(`/purchases/bills/${r._id}/edit`)}
          className="font-mono text-sm text-accent hover:underline font-semibold"
        >
          {r.billNumber}
        </button>
      ),
    },
    {
      key: 'vendor',
      header: 'Vendor',
      render: (r) => (
        <div className="text-sm text-text-primary truncate max-w-[200px]">
          {r.vendorSnapshot?.vendorName || '—'}
        </div>
      ),
    },
    {
      key: 'vendorRef',
      header: 'Vendor Ref',
      render: (r) => <span className="text-xs text-text-muted font-mono">{r.vendorReferenceNumber || '—'}</span>,
    },
    {
      key: 'issueDate',
      header: 'Issued',
      render: (r) => <span className="text-xs text-text-secondary">{formatDate(r.issueDate)}</span>,
    },
    {
      key: 'dueDate',
      header: 'Due',
      render: (r) => <span className="text-xs text-text-secondary">{r.dueDate ? formatDate(r.dueDate) : '—'}</span>,
    },
    {
      key: 'total',
      header: 'Total',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (r) => (
        <span className="font-mono font-semibold text-sm text-text-primary">
          {formatCurrency(r.totalAmount || 0, r.currencyCode || currency)}
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'Balance',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (r) => {
        const balance = r.remainingBalance ?? (r.totalAmount || 0) - (r.paidAmount || 0)
        return (
          <span className={`font-mono text-sm ${balance > 0 ? 'text-highlight' : 'text-positive'}`}>
            {formatCurrency(balance, r.currencyCode || currency)}
          </span>
        )
      },
    },
    {
      key: 'state',
      header: 'Status',
      render: (r) => (
        <div className="flex flex-wrap gap-1 items-center">
          <InvoiceStatusBadge state={r.state} kind="bill" />
          {r.approvalStatus && r.approvalStatus !== 'not_required' && (
            <ApprovalChip status={r.approvalStatus} compact />
          )}
        </div>
      ),
    },
  ]

  /* Wave 2: hover-revealed row actions (swipe/⋯ on mobile via SmartTable) */
  const rowActions = (r) => [
    ...(r.state === 'draft'
      ? [{ label: 'Edit', icon: Edit, onClick: (row) => navigate(`/purchases/bills/${row._id}/edit`) }]
      : []),
    { label: 'Archive', icon: Trash2, tone: 'danger', onClick: handleArchive },
  ]

  const STATE_FILTERS = [
    { value: '',                   label: 'All' },
    { value: 'draft',              label: 'Draft' },
    { value: 'awaiting_approval',  label: 'Awaiting Approval' },
    { value: 'approved',           label: 'Approved' },
    { value: 'scheduled',          label: 'Scheduled' },
    { value: 'partially_paid',     label: 'Partially Paid' },
    { value: 'paid',               label: 'Paid' },
    { value: 'overdue',            label: 'Overdue' },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-text-primary tracking-tight">
            <FileText className="h-6 w-6 text-accent" />
            Bills
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            What your suppliers charge you.
          </p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/purchases/bills/new')}>
          New bill
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
          <Input
            placeholder="Search by bill number..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="rounded-lg border border-glass bg-glass-panel px-3 py-2 text-sm text-text-secondary"
          value={stateFilter}
          onChange={e => setStateFilter(e.target.value)}
        >
          {STATE_FILTERS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      <div className="premium-card overflow-x-auto">
        <DataTable
          columns={columns}
          data={bills}
          isLoading={isLoading}
          onRowClick={(r) => {
            // ≥xl: peek in the Inspector (list context kept); smaller: route push
            if (wideEnoughForInspector()) setPeek(r)
            else navigate(`/purchases/bills/${r._id}/edit`)
          }}
          rowActions={rowActions}
          emptyMessage={query ? 'No bills match your search.' : 'No bills yet. Tap "New bill" to record your first one.'}
        />
      </div>

      {peek && (
        <DocumentInspector
          doc={peek}
          kind="bill"
          currency={currency}
          onClose={() => setPeek(null)}
          onOpenFull={(d) => navigate(`/purchases/bills/${d._id}/edit`)}
        />
      )}
    </div>
  )
}
