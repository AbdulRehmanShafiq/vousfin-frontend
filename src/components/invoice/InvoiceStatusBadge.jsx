/**
 * InvoiceStatusBadge — Phase 1 enterprise-grade status pill for the
 * new Invoice + Bill state machines.
 *
 * Maps lifecycle state → label + variant + icon.  Designed to feel
 * comparable to QuickBooks / Xero status chips: clear, dense, scannable.
 */
import {
  FileEdit, ClipboardCheck, CheckCircle2, Send, Banknote, Trophy,
  AlertTriangle, XCircle, AlertOctagon, Slash, Clock4, CalendarClock,
} from 'lucide-react'
import { cn } from '@/utils/cn'

const INVOICE_VARIANTS = {
  draft:            { label: 'Draft',        cls: 'bg-glass-panel text-text-muted border-glass-2',     Icon: FileEdit },
  pending_approval: { label: 'Pending',      cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30',     Icon: ClipboardCheck },
  approved:         { label: 'Approved',     cls: 'bg-cyan/15 text-cyan border-cyan/30',                    Icon: CheckCircle2 },
  sent:             { label: 'Sent',         cls: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',  Icon: Send },
  partially_paid:   { label: 'Partial',      cls: 'bg-blue-500/15 text-blue-300 border-blue-500/30',        Icon: Banknote },
  paid:             { label: 'Paid',         cls: 'bg-emerald/15 text-emerald-300 border-emerald/30',       Icon: Trophy },
  overdue:          { label: 'Overdue',      cls: 'bg-red-500/15 text-red-400 border-red-500/30',           Icon: AlertTriangle },
  cancelled:        { label: 'Cancelled',    cls: 'bg-glass-panel text-text-muted border-glass-2',        Icon: XCircle },
  disputed:         { label: 'Disputed',     cls: 'bg-orange-500/15 text-orange-300 border-orange-500/30',  Icon: AlertOctagon },
  written_off:      { label: 'Written Off',  cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30',        Icon: Slash },
  rejected:         { label: 'Rejected',     cls: 'bg-red-500/15 text-red-300 border-red-500/30',           Icon: XCircle },
}

const BILL_VARIANTS = {
  draft:              INVOICE_VARIANTS.draft,
  awaiting_approval:  { label: 'Awaiting',     cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30',   Icon: Clock4 },
  approved:           INVOICE_VARIANTS.approved,
  scheduled:          { label: 'Scheduled',    cls: 'bg-purple-500/15 text-purple-300 border-purple-500/30', Icon: CalendarClock },
  partially_paid:     INVOICE_VARIANTS.partially_paid,
  paid:               INVOICE_VARIANTS.paid,
  overdue:            INVOICE_VARIANTS.overdue,
  cancelled:          INVOICE_VARIANTS.cancelled,
  rejected:           INVOICE_VARIANTS.rejected,
}

const FALLBACK = { label: 'Unknown', cls: 'bg-glass-panel text-text-muted border-glass', Icon: FileEdit }

export default function InvoiceStatusBadge({
  state,
  kind = 'invoice',  // 'invoice' or 'bill'
  size = 'md',       // 'sm' | 'md'
  showIcon = true,
  className,
}) {
  const map = kind === 'bill' ? BILL_VARIANTS : INVOICE_VARIANTS
  const cfg = map[state] || FALLBACK
  const { Icon } = cfg

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-bold tracking-wide',
      size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs',
      cfg.cls,
      className,
    )}>
      {showIcon && <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />}
      {cfg.label}
    </span>
  )
}

export { INVOICE_VARIANTS, BILL_VARIANTS }
