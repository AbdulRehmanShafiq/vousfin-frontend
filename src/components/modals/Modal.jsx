import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useWindowSize } from '@/hooks/useWindowSize'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  preventOutsideClick = false,
}) {
  const { width } = useWindowSize()
  const isMobile = width < 768

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !preventOutsideClick) {
      onClose()
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy/80 backdrop-blur-sm sm:items-center"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={cn(
          isMobile ? 'mobile-bottom-sheet w-full animate-slide-up' : 'premium-card w-full max-w-lg animate-fade-in relative',
          className
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-text-muted transition-colors hover:bg-glass-hover hover:text-cyan focus:outline-none focus:ring-2 focus:ring-cyan"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[calc(100vh-160px)] overflow-y-auto scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
