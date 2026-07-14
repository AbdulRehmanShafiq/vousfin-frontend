import { useState } from 'react'
import { Check, FlaskConical, ChevronDown } from 'lucide-react'
import { PRIMARY_THEMES, LABS_THEMES, THEMES } from '@/theme/themes'
import { useThemeStore } from '@/stores/useThemeStore'
import { cn } from '@/utils/cn'

/*
 * AppearanceCard — the theme switcher in Settings.
 * Ledger 2026-07: two first-class modes (Ledger Dark / Ledger Light) lead;
 * the old experimental themes live behind a "Labs" disclosure — kept working,
 * excluded from QA guarantees. Clicking applies instantly and persists.
 */

function ThemeTile({ t, active, onSelect }) {
  const ink = t.group === 'light' ? '#1C1917' : '#ECEDF1'
  const sub = t.group === 'light' ? '#5C544A' : '#9A9CA8'
  return (
    <button
      role="radio"
      aria-checked={active}
      onClick={() => onSelect(t.key)}
      title={t.name}
      className={cn(
        'group relative rounded-xl border p-3 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
        active ? 'border-glass-2 ring-2 ring-accent/70' : 'border-glass hover:border-glass-2',
      )}
      style={{ background: t.sw.bg }}
    >
      <div className="rounded-lg border p-3" style={{ background: t.sw.c, borderColor: t.group === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)' }}>
        <span aria-hidden="true" className="block h-px w-full mb-2.5 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${t.sw.a}, transparent)` }} />
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium num" style={{ color: t.sw.a }}>Rs 3.28M</span>
          {active && <Check className="h-4 w-4" style={{ color: t.sw.a }} />}
        </div>
        <div className="mt-0.5 text-xs" style={{ color: sub }}>net profit</div>
        <div className="mt-3 flex items-center gap-1.5">
          <span className="h-6 flex-1 rounded-md" style={{ background: t.sw.a }} />
          <span className="h-3 w-3 rounded-full" style={{ background: t.sw.p }} aria-hidden="true" />
          <span className="h-3 w-3 rounded-full" style={{ background: t.sw.n }} aria-hidden="true" />
          <span className="h-3 w-3 rounded-full" style={{ background: t.sw.h }} aria-hidden="true" />
        </div>
      </div>
      <div className="mt-2.5 flex items-baseline justify-between gap-2 px-0.5">
        <span className="text-sm font-semibold truncate" style={{ color: ink }}>{t.name}</span>
        <span className="text-xs flex-shrink-0" style={{ color: sub }}>{t.tagline}</span>
      </div>
    </button>
  )
}

export default function AppearanceCard() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  // Auto-open Labs when the active theme lives there, so it's never hidden.
  const activeIsLabs = THEMES.find((t) => t.key === theme)?.labs === true
  const [labsOpen, setLabsOpen] = useState(activeIsLabs)

  return (
    <div className="premium-card p-5 sm:p-6">
      <h3 className="font-display text-lg font-semibold text-text-primary">Appearance</h3>
      <p className="mt-1 text-sm text-text-secondary">
        Pick dark or light. It applies instantly and is saved on this device.
      </p>

      <div role="radiogroup" aria-label="Theme" className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {PRIMARY_THEMES.map((t) => (
          <ThemeTile key={t.key} t={t} active={t.key === theme} onSelect={setTheme} />
        ))}
      </div>

      {/* Labs — experimental themes, kept but not guaranteed */}
      <button
        type="button"
        onClick={() => setLabsOpen((o) => !o)}
        aria-expanded={labsOpen}
        className="mt-5 flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-secondary transition-colors"
      >
        <FlaskConical className="h-4 w-4" aria-hidden="true" />
        Labs themes
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', labsOpen && 'rotate-180')} aria-hidden="true" />
      </button>
      {labsOpen && (
        <div className="mt-3">
          <p className="text-xs text-text-muted mb-3">
            Experiments. They work, but new features are designed and checked against Ledger Dark and Ledger Light first.
          </p>
          <div role="radiogroup" aria-label="Labs themes" className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {LABS_THEMES.map((t) => (
              <ThemeTile key={t.key} t={t} active={t.key === theme} onSelect={setTheme} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
