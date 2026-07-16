/**
 * GoodsReceiptsPage — Phase 3.1
 * List view for Goods Receipt Notes (GRNs).
 */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Search, CheckCircle, AlertTriangle, Trash2, PackageCheck, Package } from 'lucide-react'
import { useGoodsReceipts, useConfirmGRN, useArchiveGRN } from '@/hooks/useProcurement'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { formatCurrency, formatDate } from '@/utils/formatters'
import Input from '@/components/ui/Input'
import DataTable from '@/design-system/data/SmartTable'

const STATE_FILTERS = [
  { value: '',                      label: 'All' },
  { value: 'draft',                 label: 'Draft' },
  { value: 'confirmed',             label: 'Confirmed' },
  { value: 'discrepancy_reported',  label: 'Discrepancy' },
  { value: 'reconciled',            label: 'Reconciled' },
  { value: 'cancelled',             label: 'Cancelled' },
]

const STATE_COLOR = {
  draft:                'text-text-muted',
  confirmed:            'text-accent',
  discrepancy_reported: 'text-highlight',
  reconciled:           'text-positive',
  cancelled:            'text-negative',
}

function GRNStateBadge({ state }) {
  const label = STATE_FILTERS.find(f => f.value === state)?.label || state
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border border-current/30 ${STATE_COLOR[state] || 'text-text-muted'}`}>
      {label}
    </span>
  )
}

export default function GoodsReceiptsPage() {
  const navigate = useNavigate()
  const currency = useBusinessStore(s => s.currency)
  const [query, setQuery] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [discrepancyFilter, setDiscrepancyFilter] = useState('')

  const { data, isLoading } = useGoodsReceipts({
    search: query || undefined,
    state:  stateFilter || undefined,
    hasDiscrepancies: discrepancyFilter === 'yes' ? true
                    : discrepancyFilter === 'no'  ? false
                    : undefined,
    limit:  100,
  })

  const confirmGRN = useConfirmGRN()
  const archiveGRN = useArchiveGRN()

  const receipts = useMemo(() => {
    const arr = Array.isArray(data?.data) ? data.data
              : Array.isArray(data)       ? data : []
    return arr
  }, [data])

  // Column model doubles as the phone card model (SmartTable renders ListCards
  // below lg). The PO link, received date, discrepancy and stock columns hide
  // on the card; PO jump moves to a row action so it stays reachable.
  const columns = [
    {
      key: 'grnNumber',
      header: 'GRN #',
      mobile: 'title',
      render: (r) => (
        <span className="font-mono text-sm text-accent font-semibold">{r.grnNumber}</span>
      ),
    },
    {
      key: 'po',
      header: 'PO',
      mobile: 'hide',
      render: (r) => (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); r.purchaseOrderId?._id && navigate(`/procurement/purchase-orders/${r.purchaseOrderId._id}/edit`) }}
          className="font-mono text-xs text-text-secondary hover:text-accent"
        >
          {r.purchaseOrderId?.poNumber || '—'}
        </button>
      ),
    },
    {
      key: 'vendor',
      header: 'Vendor',
      mobile: 'subtitle',
      render: (r) => (
        <span className="text-sm text-text-primary truncate max-w-[150px]">
          {r.vendorId?.vendorName || '—'}
        </span>
      ),
    },
    {
      key: 'receivedDate',
      header: 'Received',
      mobile: 'hide',
      render: (r) => <span className="text-xs text-text-secondary">{formatDate(r.receivedDate)}</span>,
    },
    {
      key: 'discrepancies',
      header: 'Issues',
      mobile: 'hide',
      render: (r) => r.hasDiscrepancies ? (
        <span className="flex items-center gap-1 text-xs text-highlight">
          <AlertTriangle className="h-3.5 w-3.5" />
          {r.discrepancies?.length || ''}
        </span>
      ) : <span className="text-xs text-positive">—</span>,
    },
    {
      key: 'total',
      header: 'Value',
      type: 'money',
      mobile: 'trailing',
      render: (r) => (
        <span className="font-mono text-sm font-semibold text-text-primary">
          {formatCurrency(r.totalReceivedValue || 0, currency)}
        </span>
      ),
    },
    {
      key: 'state',
      header: 'Status',
      mobile: 'trailingSub',
      render: (r) => <GRNStateBadge state={r.state} />,
    },
    {
      key: 'inventory',
      header: 'In Stock',
      mobile: 'hide',
      render: (r) => r.inventoryApplied ? (
        <span className="flex items-center gap-1 text-xs text-positive" title="Items added to inventory at landed cost">
          <PackageCheck className="h-3.5 w-3.5" /> Added
        </span>
      ) : r.state === 'draft' ? (
        <span className="flex items-center gap-1 text-xs text-text-muted" title="Confirm the receipt to add items to inventory">
          <Package className="h-3.5 w-3.5" /> Pending
        </span>
      ) : <span className="text-xs text-text-muted">—</span>,
    },
  ]

  // Hover actions on desktop, swipe / overflow sheet on mobile; labels are the
  // accessible names.
  const rowActions = (r) => {
    const acts = []
    if (r.state === 'draft') {
      acts.push({
        label: 'Confirm receipt', icon: CheckCircle,
        onClick: (row) => {
          if (confirm(`Confirm receipt of ${row.grnNumber}?\n\nReceived items will be added to inventory at their landed cost and the purchase order's received quantities updated.`)) {
            confirmGRN.mutate({ id: row._id })
          }
        },
      })
    }
    if (r.purchaseOrderId?._id) {
      acts.push({ label: 'View PO', icon: Package, onClick: (row) => navigate(`/procurement/purchase-orders/${row.purchaseOrderId._id}/edit`) })
    }
    acts.push({
      label: 'Archive', icon: Trash2, tone: 'danger',
      onClick: (row) => { if (confirm(`Archive GRN ${row.grnNumber}?`)) archiveGRN.mutate({ id: row._id }) },
    })
    return acts
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-text-primary tracking-tight">
            <Truck className="h-6 w-6 text-accent" />
            Goods Receipts
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            Record what was physically received against purchase orders. Confirming a
            receipt adds the accepted items to inventory at their landed cost.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
          <Input
            placeholder="Search by GRN number..."
            aria-label="Search goods receipts by number"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          aria-label="Filter by status"
          className="rounded-lg border border-glass bg-glass-panel px-3 py-2.5 text-sm text-text-secondary"
          value={stateFilter}
          onChange={e => setStateFilter(e.target.value)}
        >
          {STATE_FILTERS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <select
          aria-label="Filter by discrepancies"
          className="rounded-lg border border-glass bg-glass-panel px-3 py-2.5 text-sm text-text-secondary"
          value={discrepancyFilter}
          onChange={e => setDiscrepancyFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="yes">Has Discrepancies</option>
          <option value="no">No Discrepancies</option>
        </select>
      </div>

      {/* Table on desktop, ListCards on phones — one column model (SmartTable) */}
      <div className="premium-card sm:overflow-x-auto">
        <DataTable
          columns={columns}
          data={receipts}
          isLoading={isLoading}
          rowActions={rowActions}
          emptyMessage="No goods receipts yet. GRNs are created when you receive goods against a PO."
        />
      </div>
    </div>
  )
}
