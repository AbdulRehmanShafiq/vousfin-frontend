import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Sheet — full-height native-feel bottom sheet.
 * Drag handle + sticky title/close header, scrollable body, optional
 * sticky footer pinned in the thumb zone. Safe-area aware.
 */
export default function Sheet({ isOpen, onClose, title, children, footer, className, preventOutsideClick = false }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !preventOutsideClick) onClose?.()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end bg-navy/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : undefined}
    >
      <div
        className={cn(
          'flex max-h-[92vh] w-full flex-col rounded-t-2xl border border-b-0 border-glass bg-charcoal shadow-2xl animate-slide-up-sheet',
          className,
        )}
      >
        <div className="flex-shrink-0 pt-3 pb-0">
          <div className="mx-auto h-1 w-10 rounded-full bg-glass-panel" />
          {title && (
            <div className="flex items-center justify-between px-5 pb-3 pt-2">
              <h2 className="text-base font-bold text-text-primary truncate">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="tap-target -mr-2 flex items-center justify-center rounded-full text-text-muted transition-colors hover:bg-glass-hover hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 pb-4">
          {children}
        </div>

        {footer && (
          <div className="flex-shrink-0 border-t border-glass px-5 pt-3 pb-safe" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
