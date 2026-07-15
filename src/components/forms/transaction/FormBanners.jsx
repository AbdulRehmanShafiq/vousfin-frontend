/**
 * FormBanners — period-status + AI-prefill advisory banners shown above the
 * structured form. Pure display, no form state.
 * Extracted verbatim from TransactionFormModal (Ledger phase-6 decomposition).
 */
import { AlertTriangle, Sparkles, X } from 'lucide-react'
import { NLConfBadge } from './previews'

export default function FormBanners({
  periodStatus, currentPeriodName,
  nlAiBanner, onDismissAiBanner,
  initialValues, autoResolved, debitAccountId, creditAccountId,
}) {
  const aiReviewReasons = Array.isArray(initialValues?._reviewReasons) ? initialValues._reviewReasons : []
  return (
    <>
      {/* Phase 5.1 — Accounting Period Status Banner */}
      {periodStatus === 'locked' && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-negative/10 border border-negative/30 animate-fade-in">
          <AlertTriangle className="h-4 w-4 text-negative flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-negative">Period Locked</p>
            <p className="text-xs text-text-muted mt-0.5">
              The accounting period for this date is permanently locked. Transactions cannot be saved.
            </p>
          </div>
        </div>
      )}
      {periodStatus === 'closed' && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-highlight/10 border border-highlight/30 animate-fade-in">
          <AlertTriangle className="h-4 w-4 text-highlight flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-highlight">Period Closed — {currentPeriodName}</p>
            <p className="text-xs text-text-muted mt-0.5">
              This period is closed. Contact your administrator to reopen it before posting transactions.
            </p>
          </div>
        </div>
      )}

      {/* AI Prefill Banner — shown when NL parser populated the form */}
      {nlAiBanner && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/5 border border-accent/20 animate-fade-in">
          <Sparkles className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium text-text-primary">AI pre-filled from natural language</p>
              <NLConfBadge score={initialValues?._confidence} />
            </div>
            <p className="text-xs text-text-muted">Review all fields. Make changes before saving.</p>
            {initialValues?._rawText && (
              <p className="text-small text-text-muted italic truncate" title={initialValues._rawText}>
                Original: &quot;{initialValues._rawText}&quot;
              </p>
            )}
          </div>
          <button type="button" onClick={onDismissAiBanner} className="text-text-muted hover:text-text-primary flex-shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Inline review-reasons warning */}
      {nlAiBanner && aiReviewReasons.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-highlight/10 border border-highlight/25 animate-fade-in">
          <AlertTriangle className="h-4 w-4 text-highlight flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-highlight">AI flagged this for review</p>
            <ul className="mt-1 text-xs text-highlight/90 list-disc list-inside space-y-0.5">
              {aiReviewReasons.slice(0, 4).map((r, i) => (
                <li key={i} className="truncate" title={r}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Low-confidence warning */}
      {nlAiBanner && initialValues?._confidence != null && initialValues._confidence < 0.7 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-highlight/10 border border-highlight/25 animate-fade-in">
          <AlertTriangle className="h-4 w-4 text-highlight flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-highlight">Low confidence — verify accounts</p>
            <p className="text-xs text-highlight/80 mt-0.5">
              Account names were fuzzy-matched (confidence {Math.round((initialValues._confidence ?? 0) * 100)}%).
              Please verify the Debit and Credit accounts before saving.
            </p>
          </div>
        </div>
      )}

      {/* AI auto-resolution status — Phase 3.5 Step 1 ───────────────── */}
      {nlAiBanner && autoResolved.debit && debitAccountId && (
        <p className="text-xs text-positive px-1 -mt-2">
          ✓ AI auto-selected debit account &quot;{autoResolved.debit.name}&quot; (confidence {Math.round(autoResolved.debit.score * 100)}%) — change below if wrong.
        </p>
      )}
      {nlAiBanner && autoResolved.credit && creditAccountId && (
        <p className="text-xs text-positive px-1 -mt-2">
          ✓ AI auto-selected credit account &quot;{autoResolved.credit.name}&quot; (confidence {Math.round(autoResolved.credit.score * 100)}%) — change below if wrong.
        </p>
      )}
      {/* Manual-pick prompts — only shown when resolver could NOT pick automatically */}
      {nlAiBanner && initialValues?._aiDebitAccount && !debitAccountId && !autoResolved.debit && (
        <p className="text-xs text-highlight px-1 -mt-2">
          AI suggested debit account &quot;{initialValues._aiDebitAccount}&quot; but match was ambiguous — pick the closest below.
        </p>
      )}
      {nlAiBanner && initialValues?._aiCreditAccount && !creditAccountId && !autoResolved.credit && (
        <p className="text-xs text-highlight px-1 -mt-2">
          AI suggested credit account &quot;{initialValues._aiCreditAccount}&quot; but match was ambiguous — pick the closest below.
        </p>
      )}
    </>
  )
}
