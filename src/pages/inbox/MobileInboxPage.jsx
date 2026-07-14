import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { CheckCircle2, XCircle, ChevronRight, ShieldAlert, ClipboardCheck, BrainCircuit } from 'lucide-react'
import approvalService from '@/services/approval.service'
import classifierApi from '@/services/ai/classifierService'
import { postDraft, draftIsResolvable } from '@/features/inbox/postDraft'
import { getErrorMessage } from '@/utils/errorHandler'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { useBusinessStore } from '@/stores/useBusinessStore'
import { useIsMobile } from '@/hooks/useIsMobile'
import { vibrate } from '@/design-system/haptics'
import MobilePage from '@/components/mobile/MobilePage'
import PullToRefresh from '@/components/mobile/PullToRefresh'
import { cn } from '@/utils/cn'

/**
 * Mobile Inbox — approve and confirm on the go (Mobile Easy §4.5).
 *
 * One list, two live sources (journal approvals + AI drafts), each item a
 * decision card: a plain sentence, the facts that matter, two thumb buttons.
 * Confirm posts through the SAME guarded paths as desktop (approve mutation /
 * postDraft util) — unresolved drafts refuse and point to the full queue.
 * Desktop visitors get the full approvals work view instead.
 */

function DecisionCard({ tone, icon: Icon, sentence, facts, busy, onYes, yesLabel, onNo, noLabel, noTo }) {
  return (
    <div className="rounded-card border border-glass bg-glass-panel p-4 space-y-3">
      <div className="flex items-start gap-2.5">
        <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
          tone === 'ai' ? 'bg-accent-soft text-accent' : 'bg-highlight/15 text-highlight-2')} aria-hidden="true">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <p className="min-w-0 flex-1 text-sm leading-relaxed text-text-primary">{sentence}</p>
      </div>
      {facts?.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 pl-9">
          {facts.map((f) => (
            <span key={f.label} className="text-xs text-text-muted">
              {f.label}: <span className="num font-semibold text-text-secondary">{f.value}</span>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2 pl-9">
        <button
          type="button"
          disabled={busy}
          onClick={onYes}
          className="tap-target flex flex-1 items-center justify-center gap-1.5 rounded-control btn-gradient px-3 py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {yesLabel}
        </button>
        {noTo ? (
          <Link to={noTo} className="tap-target flex flex-1 items-center justify-center gap-1.5 rounded-control btn-outline px-3 py-2.5 text-sm font-semibold">
            <XCircle className="h-4 w-4" aria-hidden="true" /> {noLabel}
          </Link>
        ) : (
          <button type="button" disabled={busy} onClick={onNo}
            className="tap-target flex flex-1 items-center justify-center gap-1.5 rounded-control btn-outline px-3 py-2.5 text-sm font-semibold disabled:opacity-50">
            <XCircle className="h-4 w-4" aria-hidden="true" /> {noLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export default function MobileInboxPage() {
  const isMobile = useIsMobile()
  const qc = useQueryClient()
  const currency = useBusinessStore((s) => s.currency)
  const [busyId, setBusyId] = useState(null)
  const [done, setDone] = useState(0)

  const { data: approvals = [] } = useQuery({
    queryKey: ['approvals-pending-list'],
    queryFn: () => approvalService.list({ status: 'pending', limit: 20 }).then((r) => {
      const d = r.data?.data
      return Array.isArray(d?.docs) ? d.docs : Array.isArray(d) ? d : []
    }),
    staleTime: 30_000,
    retry: false,
  })
  const { data: drafts = [] } = useQuery({
    queryKey: ['ai-drafts', 1],
    queryFn: () => classifierApi.getDrafts({ page: 1, limit: 12 }).then((r) => r.data),
    staleTime: 20_000,
    retry: false,
  })

  const refresh = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['approvals-pending-list'] }),
      qc.invalidateQueries({ queryKey: ['approvals-count'] }),
      qc.invalidateQueries({ queryKey: ['ai-drafts'] }),
    ])
  }

  if (!isMobile) return <Navigate to="/approvals" replace />

  const act = async (id, fn, okMsg) => {
    setBusyId(id)
    try {
      await fn()
      vibrate()
      setDone((n) => n + 1)
      toast.success(okMsg)
      await refresh()
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  const total = approvals.length + drafts.length

  return (
    <MobilePage
      title="Inbox"
      subtitle={total === 0 ? 'All clear — nothing needs you' : `${total} thing${total === 1 ? '' : 's'} need${total === 1 ? 's' : ''} you${done ? ` · ${done} done` : ''}`}
    >
      <PullToRefresh onRefresh={refresh} className="h-full">
        <div className="space-y-3 pb-4 pt-1">
          {approvals.map((a) => (
            <DecisionCard
              key={a._id}
              tone="approval"
              icon={ClipboardCheck}
              sentence={<>Waiting for your sign-off: <span className="font-semibold">{a.description || a.entityType || 'a journal entry'}</span></>}
              facts={[
                a.amount != null && { label: 'Amount', value: formatCurrency(a.amount, currency) },
                a.createdAt && { label: 'From', value: formatDate(a.createdAt, 'MMM d') },
              ].filter(Boolean)}
              busy={busyId === a._id}
              yesLabel="Approve"
              onYes={() => act(a._id, () => approvalService.approve(a._id), 'Approved')}
              noLabel="Reject"
              onNo={() => act(a._id, () => approvalService.reject(a._id, 'Rejected from mobile inbox'), 'Rejected')}
            />
          ))}

          {drafts.map((d) => (
            <DecisionCard
              key={d.draft_id}
              tone="ai"
              icon={BrainCircuit}
              sentence={<>The AI read <span className="font-semibold">{(d.narration_raw || d.payee_raw || 'a transaction').slice(0, 60)}</span>. Look right?</>}
              facts={[
                { label: 'Amount', value: formatCurrency(Number(d.amount) || 0, currency) },
                d.tx_date && { label: 'Date', value: formatDate(d.tx_date, 'MMM d') },
                d.confidence != null && { label: 'Sure', value: `${Math.round(d.confidence * 100)}%` },
              ].filter(Boolean)}
              busy={busyId === d.draft_id}
              yesLabel="Confirm"
              onYes={() =>
                draftIsResolvable(d)
                  ? act(d.draft_id, () => postDraft(d), 'Posted to your books')
                  : toast('This one needs accounts picked — open the full queue', { icon: 'ℹ️' })
              }
              noLabel="Open"
              noTo="/ai/review-queue"
            />
          ))}

          {total === 0 && (
            <p className="py-16 text-center text-sm text-text-muted">Nothing to decide. Enjoy it.</p>
          )}

          <Link
            to="/reconciliation/exceptions"
            className="tap-target flex items-center gap-2.5 rounded-card border border-glass px-4 py-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-glass-hover"
          >
            <ShieldAlert className="h-4 w-4 text-text-muted" aria-hidden="true" />
            <span className="flex-1">Bank matching exceptions</span>
            <ChevronRight className="h-4 w-4 text-text-muted" aria-hidden="true" />
          </Link>
        </div>
      </PullToRefresh>
    </MobilePage>
  )
}
