/**
 * EditorActionBar — Phase 2.2 — Always-visible top action bar for
 * Invoice/Bill editors. Replaces the buried right-sidebar buttons with
 * something the user sees immediately on page load.
 *
 * Shows:
 *   - Document name + number + state badge
 *   - State-appropriate action buttons inline
 *   - "Submit / Save Draft" for draft state
 *   - "Approve / Cancel / Send / Schedule / PDF" for non-draft states
 */
import {
  Save, Send, FileDown, CheckCircle2, XCircle, CalendarCheck, MoreVertical,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import InvoiceStatusBadge from './InvoiceStatusBadge'

/**
 * @param {Object} props
 * @param {'invoice'|'bill'} props.kind
 * @param {Object} props.doc — invoice or bill object
 * @param {boolean} props.isReadOnly
 * @param {boolean} props.canSave — true when form is valid for draft save
 * @param {boolean} props.canSubmit — true when form valid for submit
 * @param {boolean} props.saving
 * @param {Function} props.onSaveDraft
 * @param {Function} props.onSubmit
 * @param {Function} props.onApprove
 * @param {Function} props.onSend           — invoice only
 * @param {Function} props.onSchedule       — bill only
 * @param {Function} props.onCancel
 * @param {Function} props.onDownloadPdf    — invoice only
 */
export default function EditorActionBar({
  kind = 'invoice',
  doc,
  isReadOnly,
  canSave,
  canSubmit,
  saving,
  onSaveDraft,
  onSubmit,
  onApprove,
  onSend,
  onSchedule,
  onCancel,
  onDownloadPdf,
}) {
  const isBill = kind === 'bill'
  const docNumber = doc?.[isBill ? 'billNumber' : 'invoiceNumber']
  const state = doc?.state || (doc ? 'draft' : null)
  const id = doc?._id

  const isPendingApproval = state === 'pending_approval' || state === 'awaiting_approval'
  const isApproved = state === 'approved'
  const isCancellable = ['pending_approval', 'awaiting_approval', 'approved', 'sent', 'scheduled'].includes(state)

  return (
    <div className="rounded-xl border border-glass bg-glass-panel/60 backdrop-blur p-4 shadow-md">
      {/* Mobile-First Redesign, pass 2 — the primary draft actions also live in
          a thumb-zone sticky bar (below), so on phones they're hidden here to
          avoid duplication. Everything else (title, read-only actions) stays. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* ── Left: Title + state ───────────────────────────────── */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] uppercase tracking-widest text-text-muted font-bold">
                {isBill ? 'Bill' : 'Invoice'}
              </span>
              {docNumber && (
                <span className="font-mono text-sm font-bold text-text-primary">{docNumber}</span>
              )}
              {state && <InvoiceStatusBadge state={state} kind={kind} />}
            </div>
            {isReadOnly && (
              <p className="text-[12.5px] text-text-muted mt-0.5">
                Read-only — use the buttons here to change status.
              </p>
            )}
          </div>
        </div>

        {/* ── Right: Action buttons ──────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          {!isReadOnly && (
            <>
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={saving || !canSave}
                className="btn-outline hidden md:flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-40"
              >
                <Save className="h-3.5 w-3.5" />
                Save Draft
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={saving || !canSubmit}
                className="btn-gradient hidden md:flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
                Submit for Approval
              </button>
            </>
          )}

          {isReadOnly && (
            <>
              {id && onDownloadPdf && (
                <button
                  type="button"
                  onClick={() => onDownloadPdf(id)}
                  className="btn-outline flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  PDF
                </button>
              )}
              {isPendingApproval && onApprove && (
                <button
                  type="button"
                  onClick={() => onApprove(id)}
                  disabled={saving}
                  className="btn-gradient flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-40"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Approve
                </button>
              )}
              {isApproved && !isBill && onSend && (
                <button
                  type="button"
                  onClick={() => onSend(id)}
                  disabled={saving}
                  className="btn-gradient flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" />
                  Send to Customer
                </button>
              )}
              {isApproved && isBill && onSchedule && (
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0]
                    const payDate = window.prompt('Schedule payment for date (YYYY-MM-DD):', today)
                    if (payDate) onSchedule(id, payDate)
                  }}
                  disabled={saving}
                  className="btn-gradient flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-40"
                >
                  <CalendarCheck className="h-3.5 w-3.5" />
                  Schedule Payment
                </button>
              )}
              {isCancellable && onCancel && (
                <button
                  type="button"
                  onClick={() => {
                    const reason = window.prompt(`Cancellation reason (optional):`)
                    if (reason !== null) onCancel(id, reason)
                  }}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-lg border border-negative/40 px-3 py-2 text-xs font-semibold text-negative hover:bg-negative/10 transition-colors disabled:opacity-40"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Cancel
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Mobile: sticky thumb-zone primary actions (draft only) ──────────
          Fixed just above the global MobileNav (which is fixed bottom-0,
          ~58px tall). Hidden ≥ md, where the inline buttons above show. */}
      {!isReadOnly && (
        <div
          className="fixed inset-x-0 z-30 flex gap-2 border-t border-glass bg-charcoal/96 px-4 py-3 backdrop-blur-md md:hidden"
          style={{ bottom: 'calc(58px + env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={saving || !canSave}
            className="btn-outline flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold disabled:opacity-40"
          >
            <Save className="h-4 w-4" />
            Save draft
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={saving || !canSubmit}
            className="btn-gradient flex flex-[1.4] items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
            Submit
          </button>
        </div>
      )}
    </div>
  )
}
