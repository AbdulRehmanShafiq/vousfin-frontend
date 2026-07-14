/**
 * ClosePage — the month-end Close Cockpit (Ledger spec §7.5).
 *
 * The accountant's recurring ritual as one surface: a checklist of everything
 * that must be clean before locking the period, each line deep-linking to the
 * surface that clears it. Read-only — it aggregates queues the app already
 * maintains and never mutates accounting itself.
 */
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle2, AlertTriangle, ChevronRight, ClipboardCheck, BrainCircuit,
  Landmark, Scale, FileBarChart2, ShieldAlert, Lock,
} from 'lucide-react'
import approvalService from '@/services/approval.service'
import classifierApi from '@/services/ai/classifierService'
import { useArApVerification } from '@/hooks/useArApIntegrity'
import PageHeader from '@/components/ui/PageHeader'
import { usePeriodStore } from '@/stores/usePeriodStore'
import { cn } from '@/utils/cn'

/* One checklist line: live status where the app already knows, guided link
   where a human check is the point. */
function CloseItem({ icon: Icon, label, desc, to, status, count }) {
  const ok = status === 'ok'
  const attention = status === 'attention'
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 px-4 py-3.5 rule-subtotal first:border-t-0 transition-colors hover:bg-glass-hover"
    >
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          ok ? 'bg-positive-muted text-positive' : attention ? 'bg-highlight/15 text-highlight-2' : 'bg-glass-panel text-text-muted',
        )}
        aria-hidden="true"
      >
        {ok ? <CheckCircle2 className="h-4 w-4" /> : attention ? <AlertTriangle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-text-primary">{label}</span>
        <span className="block text-xs text-text-muted mt-0.5">{desc}</span>
      </span>
      {count != null && count !== 0 && (
        <span className="num shrink-0 rounded-full bg-highlight/15 px-2 py-0.5 text-xs font-bold text-highlight-2">{count}</span>
      )}
      <ChevronRight className="h-4 w-4 shrink-0 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
    </Link>
  )
}

export default function ClosePage() {
  const range = usePeriodStore((s) => s.range)

  // Live signals the app already polls elsewhere (shared query keys → cheap)
  const { data: approvalsPending = 0 } = useQuery({
    queryKey: ['approvals-count'],
    queryFn: () => approvalService.count().then((r) => r.data.data?.pending ?? 0),
    staleTime: 30_000,
    retry: false,
  })
  const { data: drafts = [] } = useQuery({
    queryKey: ['ai-drafts', 1],
    queryFn: () => classifierApi.getDrafts({ page: 1, limit: 12 }).then((r) => r.data),
    staleTime: 30_000,
    retry: false,
  })
  const { data: integrity } = useArApVerification()

  const draftCount = Array.isArray(drafts) ? drafts.length : 0
  // Defensive: the verify payload's shape may evolve; look for a boolean-ish
  // consistency flag, else stay neutral rather than claiming a state.
  const integrityOk =
    integrity == null ? null
      : typeof integrity.ok === 'boolean' ? integrity.ok
      : typeof integrity.consistent === 'boolean' ? integrity.consistent
      : Array.isArray(integrity.issues) ? integrity.issues.length === 0
      : null

  const liveItems = [
    {
      icon: ClipboardCheck, label: 'Clear pending approvals', to: '/approvals',
      desc: 'Every journal waiting for sign-off is posted or rejected.',
      status: approvalsPending === 0 ? 'ok' : 'attention', count: approvalsPending,
    },
    {
      icon: BrainCircuit, label: 'Empty the AI review queue', to: '/ai/review-queue',
      desc: 'Confirm or fix every AI-classified transaction.',
      status: draftCount === 0 ? 'ok' : 'attention', count: draftCount === 12 ? '12+' : draftCount,
    },
    {
      icon: Scale, label: 'Customer & supplier balances agree with the books', to: '/financial-reports/aging',
      desc: 'The AR/AP sub-ledgers reconcile to their control accounts.',
      status: integrityOk === true ? 'ok' : integrityOk === false ? 'attention' : 'todo',
    },
  ]
  const guidedItems = [
    {
      icon: Landmark, label: 'Reconcile every bank account', to: '/reconciliation/bank',
      desc: 'Match the books against each bank statement for the period.', status: 'todo',
    },
    {
      icon: ShieldAlert, label: 'Sweep flagged anomalies', to: '/ai-analyst/anomalies',
      desc: 'Look at anything unusual the AI flagged before you close.', status: 'todo',
    },
    {
      icon: FileBarChart2, label: 'Review the draft statements', to: '/financial-reports/income-statement',
      desc: 'Read the P&L, balance sheet and cash flow for the period.', status: 'todo',
    },
    {
      icon: Lock, label: 'Lock the period', to: '/accounting/fiscal-years',
      desc: 'Close the fiscal period so history stays exactly as reported.', status: 'todo',
    },
  ]

  const clear = liveItems.filter((i) => i.status === 'ok').length

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <PageHeader
        title="Close the month"
        subtitle={
          <span>
            Everything that should be clean before you lock <span className="num">{range.startDate}</span> → <span className="num">{range.endDate}</span>.
            <span className="text-text-muted"> {clear} of {liveItems.length} live checks clear.</span>
          </span>
        }
      />

      <div className="premium-card overflow-hidden">
        <p className="px-4 pt-4 pb-1 text-label uppercase tracking-wider text-text-muted">Checked live from your books</p>
        {liveItems.map((i) => <CloseItem key={i.label} {...i} />)}
        <p className="px-4 pt-4 pb-1 text-label uppercase tracking-wider text-text-muted rule-subtotal">Walk through, in order</p>
        {guidedItems.map((i) => <CloseItem key={i.label} {...i} />)}
      </div>

      <p className="text-xs text-text-muted">
        Closing never edits history — corrections after a lock happen through new entries, exactly as the ledger rules require.
      </p>
    </div>
  )
}
