import { ChevronRight, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Sheet from '@/components/mobile/Sheet'

/**
 * QuickActionsSheet — the ⊕'s menu when a page offers more than one action.
 *
 * Same lane styling as the Capture sheet (one visual language for "the ⊕ just
 * opened something"). Each row is a labelled action, so there is never an
 * invisible create-vs-navigate mode switch — you see what each choice does
 * before you tap it.
 */
export default function QuickActionsSheet({ open, onClose, title, actions, onPick }) {
  const { t } = useTranslation()

  return (
    <Sheet isOpen={open} onClose={onClose} title={title || t('fab.quickActions')}>
      <div className="space-y-2.5 pb-2">
        {actions.map((a) => {
          const Icon = a.icon || Plus
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => { onClose(); onPick(a) }}
              className="tap-target flex w-full items-center gap-3.5 rounded-card border border-glass bg-glass-panel px-4 py-3.5 text-left transition-colors active:scale-[0.98] hover:bg-glass-hover"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent" aria-hidden="true">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1 text-base font-semibold text-text-primary">
                {a.label || t(a.labelKey)}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
            </button>
          )
        })}
      </div>
    </Sheet>
  )
}
