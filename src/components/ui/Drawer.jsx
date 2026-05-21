import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'left',
  className,
}) {
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
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const slideAnim = position === 'left' ? '-translate-x-full' : 'translate-x-full'

  const drawerContent = (
    <div
      className="fixed inset-0 z-50 bg-navy/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={cn(
          'fixed bottom-0 top-0 w-80 bg-charcoal border-glass shadow-2xl transition-transform duration-300 ease-in-out',
          position === 'left' ? 'left-0 border-r' : 'right-0 border-l',
          isOpen ? 'translate-x-0' : slideAnim,
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-glass px-6 py-4">
          <h2 className="text-lg font-bold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-text-muted transition-colors hover:bg-glass-hover hover:text-cyan focus:outline-none focus:ring-2 focus:ring-cyan"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="h-full overflow-y-auto scrollbar-thin p-6 pb-20">
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(drawerContent, document.body)
}
