import { Camera, MessageSquareText, LayoutList, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Sheet from '@/components/mobile/Sheet'
import { useUIStore } from '@/stores/useUIStore'
import { vibrate } from '@/design-system/haptics'

/**
 * CaptureSheet — the heart of Mobile Easy (spec §4.2).
 *
 * The ⊕ tab lands here: three lanes, each deep-linking into the SAME
 * universal transaction modal (one accounting path, three doors):
 *   📷 Snap a receipt   → NL tab, which owns the shipped photo→AI flow
 *   Say it or type it   → NL tab's plain-sentence line
 *   Pick a simple choice → structured form (simple chips are its default)
 */
const LANES = [
  { lane: 'photo',  icon: Camera,            titleKey: 'capture.photo.title',  descKey: 'capture.photo.desc' },
  { lane: 'nl',     icon: MessageSquareText, titleKey: 'capture.nl.title',     descKey: 'capture.nl.desc' },
  { lane: 'simple', icon: LayoutList,        titleKey: 'capture.simple.title', descKey: 'capture.simple.desc' },
]

export default function CaptureSheet() {
  const { t } = useTranslation()
  const isOpen = useUIStore((s) => s.captureOpen)
  const closeCapture = useUIStore((s) => s.closeCapture)
  const openTxModal = useUIStore((s) => s.openTxModal)

  const go = (lane) => {
    vibrate()
    closeCapture()
    openTxModal({ lane })
  }

  return (
    <Sheet isOpen={isOpen} onClose={closeCapture} title={t('capture.title')}>
      <div className="space-y-2.5 pb-2">
        {LANES.map(({ lane, icon: Icon, titleKey, descKey }) => (
          <button
            key={lane}
            type="button"
            onClick={() => go(lane)}
            className="tap-target flex w-full items-center gap-3.5 rounded-card border border-glass bg-glass-panel px-4 py-3.5 text-left transition-colors active:scale-[0.98] hover:bg-glass-hover"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent" aria-hidden="true">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold text-text-primary">{t(titleKey)}</span>
              <span className="mt-0.5 block text-small text-text-muted">{t(descKey)}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
          </button>
        ))}
        <p className="px-1 pt-1 text-xs text-text-muted">
          {t('capture.footnote')}
        </p>
      </div>
    </Sheet>
  )
}
