/**
 * TotalsPanel — Phase 2 — Live-computed invoice totals sidebar/panel.
 * Shows subtotal, line discounts, invoice discount, tax, shipping, rounding, grand total.
 */
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatters'

export default function TotalsPanel({
  subtotal = 0,
  totalLineDiscount = 0,
  invoiceDiscountType,
  invoiceDiscountValue = 0,
  invoiceDiscountAmount = 0,
  totalTax = 0,
  shippingCharges = 0,
  roundingAdjustment = 0,
  totalAmount = 0,
  paidAmount = 0,
  totalCredited = 0,
  currency = 'PKR',
  className,
}) {
  const fmt = (v) => formatCurrency(v, currency)
  const balanceDue = Math.max(0, totalAmount - paidAmount - totalCredited)

  return (
    <div className={cn('space-y-2 text-sm', className)}>
      <Row label="Items total" value={fmt(subtotal)} />
      {totalLineDiscount > 0 && (
        <Row label="Discounts" value={`- ${fmt(totalLineDiscount)}`} muted />
      )}
      {invoiceDiscountAmount > 0 && (
        <Row
          label={`Discount${invoiceDiscountType === 'percentage' ? ` (${invoiceDiscountValue}%)` : ''}`}
          value={`- ${fmt(invoiceDiscountAmount)}`}
          muted
        />
      )}
      {totalTax > 0 && (
        <Row label="Tax" value={fmt(totalTax)} />
      )}
      {shippingCharges > 0 && (
        <Row label="Shipping" value={fmt(shippingCharges)} />
      )}
      {roundingAdjustment !== 0 && (
        <Row label="Rounding" value={fmt(roundingAdjustment)} muted />
      )}

      {/* Grand total */}
      <div className="border-t border-cyan/20 pt-2 mt-2">
        <Row label="Total" value={fmt(totalAmount)} bold />
      </div>

      {paidAmount > 0 && (
        <Row label="Paid" value={`- ${fmt(paidAmount)}`} muted />
      )}
      {totalCredited > 0 && (
        <Row label="Credited" value={`- ${fmt(totalCredited)}`} muted />
      )}
      {(paidAmount > 0 || totalCredited > 0) && (
        <div className="border-t border-cyan/20 pt-2">
          <Row label="Still due" value={fmt(balanceDue)} bold accent />
        </div>
      )}
    </div>
  )
}

function Row({ label, value, bold = false, muted = false, accent = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={cn(
        'text-text-secondary',
        bold && 'font-semibold text-text-primary',
        muted && 'text-text-muted text-xs',
      )}>
        {label}
      </span>
      <span className={cn(
        'tabular-nums text-right',
        bold && 'font-bold text-base',
        accent && 'text-cyan',
        !bold && !muted && 'text-text-primary',
        muted && 'text-text-muted',
      )}>
        {value}
      </span>
    </div>
  )
}
