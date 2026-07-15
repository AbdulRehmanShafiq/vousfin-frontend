/**
 * DocumentInspector — invoice/bill peek content for the Inspector split view.
 *
 * Read-only summary from the list row itself (documents are authoritative and
 * the list endpoint already carries snapshot + lines) — zero extra fetches.
 * Editing always goes through the full editor.
 */
import { ExternalLink, FileDown } from 'lucide-react'
import Inspector from '@/design-system/workflow/Inspector'
import InvoiceStatusBadge from '@/components/invoice/InvoiceStatusBadge'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/utils/formatters'

function Row({ label, children, className = '' }) {
  return (
    <div className={`flex items-baseline justify-between gap-3 py-1 ${className}`}>
      <span className="text-xs uppercase tracking-wider text-text-muted">{label}</span>
      <span className="text-right text-sm text-text-primary">{children}</span>
    </div>
  )
}

export default function DocumentInspector({ doc, kind = 'invoice', currency, onClose, onOpenFull, onDownloadPdf }) {
  if (!doc) return <Inspector open={false} onClose={onClose} />

  const isInvoice = kind === 'invoice'
  const number = isInvoice ? doc.invoiceNumber : doc.billNumber
  const party = isInvoice
    ? (doc.customerSnapshot?.businessName || doc.customerSnapshot?.fullName || '—')
    : (doc.vendorSnapshot?.vendorName || '—')
  const cur = doc.currencyCode || currency
  const total = doc.totalAmount || 0
  const balance = doc.remainingBalance ?? total - (doc.paidAmount || 0)
  const lines = Array.isArray(doc.lineItems) ? doc.lineItems : []
  const subtotal = doc.subtotal ?? lines.reduce((s, l) => s + (l.lineTotal ?? l.amount ?? (l.quantity || 0) * (l.unitPrice || 0)), 0)
  const tax = doc.taxAmount ?? doc.totalTax ?? Math.max(0, total - subtotal)

  return (
    <Inspector
      open
      onClose={onClose}
      title={number}
      subtitle={party}
      badge={<InvoiceStatusBadge state={doc.state} kind={isInvoice ? undefined : 'bill'} />}
      footer={
        <>
          {onDownloadPdf && (
            <Button variant="ghost" size="sm" icon={FileDown} onClick={() => onDownloadPdf(doc)}>
              PDF
            </Button>
          )}
          <Button size="sm" icon={ExternalLink} onClick={() => onOpenFull(doc)}>
            Open full {isInvoice ? 'invoice' : 'bill'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Row label="Issued">{formatDate(doc.issueDate)}</Row>
          <Row label="Due">{doc.dueDate ? formatDate(doc.dueDate) : '—'}</Row>
          {!isInvoice && doc.vendorReferenceNumber && (
            <Row label="Vendor ref"><span className="font-mono text-xs">{doc.vendorReferenceNumber}</span></Row>
          )}
        </div>

        {lines.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
              {lines.length} line{lines.length !== 1 ? 's' : ''}
            </p>
            <div className="divide-y divide-glass/60 rounded-card border border-glass bg-glass-panel px-3">
              {lines.map((l, i) => (
                <div key={i} className="flex items-baseline justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-text-primary">{l.description || l.itemName || '—'}</p>
                    <p className="text-xs text-text-muted num">
                      {l.quantity || 1} × {formatCurrency(l.unitPrice || 0, cur)}
                    </p>
                  </div>
                  <span className="num shrink-0 text-sm text-text-primary">
                    {formatCurrency(l.lineTotal ?? l.amount ?? (l.quantity || 0) * (l.unitPrice || 0), cur)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ledger-ruled totals — single rule above tax line, double above total */}
        <div>
          <Row label="Subtotal"><span className="num">{formatCurrency(subtotal, cur)}</span></Row>
          {tax > 0 && <Row label="Tax"><span className="num">{formatCurrency(tax, cur)}</span></Row>}
          <Row label="Total" className="rule-total mt-1 pt-1.5">
            <span className="num font-bold">{formatCurrency(total, cur)}</span>
          </Row>
          <Row label={balance > 0 ? 'Still unpaid' : 'Balance'}>
            <span className={`num font-semibold ${balance > 0 ? 'text-highlight' : 'text-positive'}`}>
              {formatCurrency(balance, cur)}
            </span>
          </Row>
        </div>
      </div>
    </Inspector>
  )
}
