import { X } from 'lucide-react'
import { GO_TARGETS } from '@/hooks/useGlobalShortcuts'

const Kbd = ({ children }) => (
  <kbd className="inline-flex min-w-[22px] items-center justify-center rounded border border-glass-2 bg-glass-panel px-1.5 py-0.5 text-xs font-semibold text-text-primary">
    {children}
  </kbd>
)

/** ShortcutOverlay — the "?" cheat sheet. Discoverability for the keyboard spine. */
export default function ShortcutOverlay({ open, onClose }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-overlay border border-glass-2 bg-charcoal p-6 shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-heading font-semibold text-text-primary">Keyboard shortcuts</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-control p-1.5 text-text-muted hover:bg-glass-hover hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm">
          <div>
            <p className="text-label uppercase tracking-wider text-text-muted mb-2">Anywhere</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><span className="text-text-secondary">Search or ask AI</span><span className="space-x-1"><Kbd>⌘</Kbd><Kbd>K</Kbd></span></div>
              <div className="flex items-center justify-between"><span className="text-text-secondary">Record something</span><Kbd>c</Kbd></div>
              <div className="flex items-center justify-between"><span className="text-text-secondary">This cheat sheet</span><Kbd>?</Kbd></div>
            </div>
          </div>
          <div>
            <p className="text-label uppercase tracking-wider text-text-muted mb-2">Go to — press <Kbd>g</Kbd> then…</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {GO_TARGETS.map(([k, , label]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-text-secondary">{label}</span><Kbd>{k}</Kbd>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-label uppercase tracking-wider text-text-muted mb-2">In lists</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><span className="text-text-secondary">Move down / up</span><span className="space-x-1"><Kbd>j</Kbd><Kbd>k</Kbd></span></div>
              <div className="flex items-center justify-between"><span className="text-text-secondary">Open row</span><Kbd>↵</Kbd></div>
              <div className="flex items-center justify-between"><span className="text-text-secondary">Select row</span><Kbd>x</Kbd></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
