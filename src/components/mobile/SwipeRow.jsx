import { useRef, useState } from 'react'
import { MoreVertical } from 'lucide-react'
import { cn } from '@/utils/cn'
import Sheet from './Sheet'

const ACTION_WIDTH = 76
const TONE_CLASS = {
  default: 'bg-glass-panel text-text-secondary',
  accent: 'bg-cyan/15 text-cyan',
  danger: 'bg-negative/15 text-negative',
}

/**
 * SwipeRow — wraps a ListCard (or any row) with up to 2 contextual actions.
 * Touch users swipe left to reveal them. Everyone else (and every test) can
 * reach the same actions through the always-present "more" button, which
 * opens a small action sheet — actions are never gesture-only.
 */
export default function SwipeRow({ children, actions = [], className }) {
  const [offset, setOffset] = useState(0)
  const [moreOpen, setMoreOpen] = useState(false)
  const startX = useRef(null)
  const dragging = useRef(false)
  const maxReveal = actions.length * ACTION_WIDTH

  const onTouchStart = (e) => {
    if (!actions.length) return
    startX.current = e.touches[0].clientX
    dragging.current = true
  }
  const onTouchMove = (e) => {
    if (!dragging.current || startX.current == null) return
    const dx = e.touches[0].clientX - startX.current
    if (dx < 0) setOffset(Math.max(dx, -maxReveal))
    else setOffset(0)
  }
  const onTouchEnd = () => {
    dragging.current = false
    setOffset((o) => (o < -maxReveal / 2 ? -maxReveal : 0))
  }

  const runAction = (fn) => {
    setOffset(0)
    setMoreOpen(false)
    fn?.()
  }

  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)}>
      {actions.length > 0 && (
        <div className="absolute inset-y-0 right-0 flex items-stretch" aria-hidden="true">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => runAction(a.onClick)}
              tabIndex={-1}
              style={{ width: ACTION_WIDTH }}
              className={cn('tap-target flex flex-col items-center justify-center gap-1 text-[12px] font-semibold', TONE_CLASS[a.tone] || TONE_CLASS.default)}
            >
              {a.icon && <a.icon className="h-4 w-4" />}
              {a.label}
            </button>
          ))}
        </div>
      )}

      <div
        className="relative flex items-center bg-charcoal transition-transform duration-150 ease-out"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="min-w-0 flex-1">{children}</div>

        {actions.length > 0 && (
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-label="More actions"
            className="tap-target flex flex-shrink-0 items-center justify-center text-text-muted hover:text-text-primary"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        )}
      </div>

      <Sheet isOpen={moreOpen} onClose={() => setMoreOpen(false)} title="Actions">
        <div className="space-y-1 pb-2">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => runAction(a.onClick)}
              className={cn(
                'tap-target flex w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold',
                a.tone === 'danger' ? 'text-negative hover:bg-negative/10' : 'text-text-primary hover:bg-glass-hover',
              )}
            >
              {a.icon && <a.icon className="h-4 w-4" />}
              {a.label}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  )
}
