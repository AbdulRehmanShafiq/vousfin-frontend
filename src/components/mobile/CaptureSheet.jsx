import { Camera, MessageSquareText, LayoutList, ChevronRight } from 'lucide-react'
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
  {
    lane: 'photo',
    icon: Camera,
    title: 'Snap a receipt',
    desc: 'Take a photo — the AI reads the amount and what it was',
  },
  {
    lane: 'nl',
    icon: MessageSquareText,
    title: 'Say it or type it',
    desc: '“sold 3 phones 45,000 cash” — we fill in the books',
  },
  {
    lane: 'simple',
    icon: LayoutList,
    title: 'Pick a simple choice',
    desc: 'I got paid · I paid · I sold stock · I bought stock…',
  },
]

export default function CaptureSheet() {
  const isOpen = useUIStore((s) => s.captureOpen)
  const closeCapture = useUIStore((s) => s.closeCapture)
  const openTxModal = useUIStore((s) => s.openTxModal)

  const go = (lane) => {
    vibrate()
    closeCapture()
    openTxModal({ lane })
  }

  return (
    <Sheet isOpen={isOpen} onClose={closeCapture} title="Record something">
      <div className="space-y-2.5 pb-2">
        {LANES.map(({ lane, icon: Icon, title, desc }) => (
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
              <span className="block text-base font-semibold text-text-primary">{title}</span>
              <span className="mt-0.5 block text-small text-text-muted">{desc}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
          </button>
        ))}
        <p className="px-1 pt-1 text-xs text-text-muted">
          All three end in the same place — you check it, then it goes in your books.
        </p>
      </div>
    </Sheet>
  )
}
