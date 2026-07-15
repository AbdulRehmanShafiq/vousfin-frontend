/**
 * Inspector — the Work View's right-side peek panel (redesign spec §7.2).
 *
 * Kills the biggest click tax on list pages: click a row to PEEK at the
 * document (summary, lines, totals, quick actions) without leaving the list;
 * jump to the full editor only when you actually need to edit lines.
 *
 * Split-view contract: pages open it on ≥xl viewports and route-push on
 * smaller screens (see `wideEnoughForInspector()`), so list context is never
 * lost on desktop and phones keep their native full-screen flows.
 *
 * Non-modal by design — no backdrop, the list stays interactive, clicking
 * another row just swaps the content. Esc or ✕ closes.
 */
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { panelSlideRight } from '@/design-system/motion'
import { cn } from '@/utils/cn'

export default function Inspector({ open, onClose, title, subtitle, badge, footer, children, className }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.aside
          {...panelSlideRight}
          role="complementary"
          aria-label={typeof title === 'string' ? title : 'Details'}
          className={cn(
            'fixed inset-y-0 right-0 z-40 flex w-[400px] max-w-full flex-col',
            'border-l border-glass-2 bg-charcoal shadow-elevated',
            className,
          )}
        >
          <div className="flex items-start gap-3 border-b border-glass px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-md font-bold text-text-primary">{title}</h2>
                {badge}
              </div>
              {subtitle && <p className="mt-0.5 truncate text-sm text-text-secondary">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="rounded-control p-1.5 text-text-muted transition-colors hover:bg-glass-hover hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4">{children}</div>

          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-glass px-5 py-3">
              {footer}
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>,
    document.body,
  )
}
