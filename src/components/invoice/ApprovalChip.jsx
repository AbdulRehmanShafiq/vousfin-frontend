/**
 * ApprovalChip — Phase 1 — small badge that summarises the approval workflow
 * status of an invoice or bill.  Shown alongside the state badge.
 */
import { ShieldCheck, ShieldAlert, ShieldQuestion, ShieldOff } from 'lucide-react'
import { cn } from '@/utils/cn'

const VARIANTS = {
  not_required: { label: 'No approval needed', cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20', Icon: ShieldOff },
  pending:      { label: 'Awaiting approval',  cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30', Icon: ShieldQuestion },
  approved:     { label: 'Approved',           cls: 'bg-emerald/15 text-emerald-300 border-emerald/30',   Icon: ShieldCheck },
  rejected:     { label: 'Rejected',           cls: 'bg-red-500/15 text-red-400 border-red-500/30',       Icon: ShieldAlert },
}

export default function ApprovalChip({ status, compact = false, className }) {
  if (!status) return null
  const cfg = VARIANTS[status] || VARIANTS.not_required
  const { Icon } = cfg
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-semibold',
      compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]',
      cfg.cls,
      className,
    )}>
      <Icon className="h-3 w-3" />
      {!compact && cfg.label}
    </span>
  )
}
