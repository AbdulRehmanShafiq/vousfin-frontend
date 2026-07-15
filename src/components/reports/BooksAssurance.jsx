import { CheckCircle2, AlertTriangle, HelpCircle, RefreshCw } from 'lucide-react'
import { useBooksAssurance } from '@/hooks/useReports'
import { cn } from '@/utils/cn'

/**
 * "Your books add up — checked just now."
 *
 * The four invariants, re-derived from the accounting records every time this
 * renders. Deliberately shows a TIME, because the claim is only worth anything
 * if it's current — a cached verdict is the thing this exists to disprove.
 *
 * Three states, and the third matters: correct, broken, and couldn't-verify.
 * Collapsing "we couldn't check" into a green tick would be the exact
 * fail-open this whole programme was about.
 */

const timeOf = (iso) => {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  } catch { return null }
}

function Row({ check }) {
  const Icon = !check.verified ? HelpCircle : check.ok ? CheckCircle2 : AlertTriangle
  return (
    <li className="flex items-start gap-2 py-1.5">
      <Icon
        className={cn('mt-0.5 h-4 w-4 flex-shrink-0',
          !check.verified ? 'text-text-muted' : check.ok ? 'text-positive' : 'text-highlight')}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-primary">{check.title}</p>
        <p className="text-xs text-text-muted">{check.detail}</p>
      </div>
    </li>
  )
}

export default function BooksAssurance({ className }) {
  const { data, isLoading, isFetching, refetch, isError } = useBooksAssurance()

  if (isLoading) {
    return (
      <div className={cn('premium-card p-4', className)}>
        <div className="h-4 w-40 animate-pulse rounded bg-glass-panel" />
        <div className="mt-3 h-3 w-64 animate-pulse rounded bg-glass-panel" />
      </div>
    )
  }

  // A failed request is "we couldn't check", never "all clear".
  if (isError || !data) {
    return (
      <div className={cn('premium-card p-4', className)}>
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-text-muted" aria-hidden="true" />
          <p className="text-sm font-semibold text-text-primary">We couldn’t check your books just now</p>
        </div>
        <button type="button" onClick={() => refetch()}
          className="mt-2 text-xs font-medium text-highlight hover:underline">
          Try again
        </button>
      </div>
    )
  }

  const { correct, verified, verifiedAt, checks = [], breaks = [] } = data
  const Icon = !verified ? HelpCircle : correct ? CheckCircle2 : AlertTriangle
  const at = timeOf(verifiedAt)

  return (
    <div className={cn('premium-card p-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Icon
            className={cn('h-5 w-5 flex-shrink-0',
              !verified ? 'text-text-muted' : correct ? 'text-positive' : 'text-highlight')}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary">
              {correct ? 'Your books add up' : data.summary}
            </p>
            {at && (
              <p className="text-xs text-text-muted">
                Checked at {at}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Check again"
          className="rounded p-1.5 text-text-muted hover:text-text-primary disabled:opacity-50"
        >
          <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} aria-hidden="true" />
        </button>
      </div>

      {/* When everything holds, the four checks are noise — the headline IS the
          answer. Show them only when there is something to look at. */}
      {(breaks.length > 0 || !verified) && (
        <ul className="mt-3 border-t border-glass-border pt-2" role="list">
          {checks.map((c) => <Row key={c.key} check={c} />)}
        </ul>
      )}
    </div>
  )
}
