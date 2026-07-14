import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Info, ArrowRight } from 'lucide-react'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { cn } from '@/utils/cn'

/**
 * Explain — the "how was this number calculated?" affordance (Ledger §11).
 *
 * An ⓘ next to a hero figure opens a small popover showing the derivation
 * (source figures) and a link to the surface that proves it. Trust through
 * explainability: no number is a dead end.
 *
 *   <Explain
 *     title="Cash on hand"
 *     rows={[{ label: 'Cash + bank balances', value: 'Rs 71.5M' }]}
 *     note="The current balance of every cash and bank account in your books."
 *     to="/accounts" toLabel="See the accounts"
 *   />
 */
export default function Explain({ title, rows = [], note, to, toLabel = 'See where this comes from', className }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useOnClickOutside(ref, () => setOpen(false))

  return (
    <span className={cn('relative inline-flex', className)} ref={ref}>
      <button
        type="button"
        aria-label={`How ${title} is calculated`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="rounded-full p-1 text-text-muted hover:text-text-secondary hover:bg-glass-hover transition-colors"
      >
        <Info className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      {open && (
        <span
          role="dialog"
          aria-label={`${title} explanation`}
          className="absolute left-0 top-full z-40 mt-1.5 w-64 rounded-card border border-glass-2 bg-charcoal p-3.5 text-left shadow-elevated animate-fade-in"
        >
          <span className="block text-label uppercase tracking-wider text-text-muted">How this is calculated</span>
          {rows.length > 0 && (
            <span className="mt-2 block space-y-1.5">
              {rows.map((r) => (
                <span key={r.label} className="flex items-baseline justify-between gap-3">
                  <span className="text-xs text-text-secondary">{r.label}</span>
                  <span className="num text-xs font-semibold text-text-primary whitespace-nowrap">{r.value}</span>
                </span>
              ))}
            </span>
          )}
          {note && <span className="mt-2 block text-xs leading-relaxed text-text-muted">{note}</span>}
          {to && (
            <Link
              to={to}
              onClick={() => setOpen(false)}
              className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              {toLabel} <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          )}
        </span>
      )}
    </span>
  )
}
