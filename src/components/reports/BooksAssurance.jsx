import { useState } from 'react'
import { CheckCircle2, AlertTriangle, HelpCircle, RefreshCw, X } from 'lucide-react'
import { useBooksAssurance } from '@/hooks/useReports'
import { cn } from '@/utils/cn'

/**
 * "Your books add up" — as a chip, not a billboard.
 *
 * This is a trust signal, not a report. It first shipped as a full-width card
 * above the statements and immediately earned the obvious complaint: it was
 * taking the space of the thing you came to read. So it collapses to one line
 * that answers the question, and opens only when you ask.
 *
 * What survives from the first version, because it is the actual point:
 *   • It shows a TIME. The claim is worthless unless current, so staleTime is 0.
 *   • Three states, never two. "We couldn't check" is never rendered as a green
 *     tick — collapsing it would be the same fail-open this all came from.
 */

const timeOf = (iso) => {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  } catch { return null }
}

/** correct | broken | unknown — the three states, decided once. */
function toneOf(data, isError) {
  if (isError || !data || !data.verified) return 'unknown'
  return data.correct ? 'ok' : 'broken'
}

const ICONS = { ok: CheckCircle2, broken: AlertTriangle, unknown: HelpCircle }
const COLORS = { ok: 'text-positive', broken: 'text-highlight', unknown: 'text-text-muted' }

function CheckRow({ check }) {
  const tone = !check.verified ? 'unknown' : check.ok ? 'ok' : 'broken'
  const Icon = ICONS[tone]
  return (
    <li className="flex items-start gap-2 py-1.5">
      <Icon className={cn('mt-0.5 h-4 w-4 flex-shrink-0', COLORS[tone])} aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-primary">{check.title}</p>
        <p className="text-xs text-text-muted">{check.detail}</p>
      </div>
    </li>
  )
}

export default function BooksAssurance({ className }) {
  const [open, setOpen] = useState(false)
  const { data, isLoading, isFetching, refetch, isError } = useBooksAssurance()

  if (isLoading) {
    return <div className={cn('h-8 w-44 animate-pulse rounded-full bg-glass-panel', className)} />
  }

  const tone = toneOf(data, isError)
  const Icon = ICONS[tone]
  const at = timeOf(data?.verifiedAt)
  const label = tone === 'unknown'
    ? 'Couldn’t check'
    : data.correct ? 'Books add up' : data.summary

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={at ? `Checked at ${at}` : undefined}
        className={cn(
          'flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold',
          'transition-colors whitespace-nowrap',
          tone === 'ok'      && 'border-positive/30 bg-positive/10 text-positive hover:bg-positive/15',
          tone === 'broken'  && 'border-highlight/30 bg-highlight/10 text-highlight hover:bg-highlight/15',
          tone === 'unknown' && 'border-glass bg-glass-panel text-text-muted hover:bg-glass-hover',
        )}
      >
        <Icon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        {label}
      </button>

      {open && (
        <>
          {/* Click-away. Sits under the panel, over everything else. */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="dialog"
            aria-label="Do your books add up?"
            className={cn(
              // Anchors to whichever edge the chip is on. On a phone it sits at
              // the left, so right-anchoring pushed the panel off-screen and
              // clipped the headline; on desktop it rides at the right of the
              // toolbar, where left-anchoring would do the same.
              'absolute left-0 sm:left-auto sm:right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))]',
              'rounded-card border border-glass bg-navy p-3 shadow-xl',
            )}
          >
            <div className="flex items-start justify-between gap-2 pb-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">
                  {tone === 'unknown' ? 'We couldn’t check just now' : data.correct ? 'Your books add up' : data.summary}
                </p>
                {at && <p className="text-xs text-text-muted">Checked at {at}</p>}
              </div>
              <div className="flex flex-shrink-0 items-center gap-1">
                <button type="button" onClick={() => refetch()} disabled={isFetching}
                  aria-label="Check again"
                  className="rounded p-1 text-text-muted hover:text-text-primary disabled:opacity-50">
                  <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} aria-hidden="true" />
                </button>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close"
                  className="rounded p-1 text-text-muted hover:text-text-primary">
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {data?.checks?.length > 0 && (
              <ul className="border-t border-glass pt-1" role="list">
                {data.checks.map((c) => <CheckRow key={c.key} check={c} />)}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
