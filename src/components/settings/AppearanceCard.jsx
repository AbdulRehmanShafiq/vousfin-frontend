import { Check } from 'lucide-react'
import { THEMES } from '@/theme/themes'
import { useThemeStore } from '@/stores/useThemeStore'
import { cn } from '@/utils/cn'

/*
 * AppearanceCard — the theme switcher in Settings.
 * A radiogroup of live-preview tiles; clicking applies instantly and persists
 * (localStorage via useThemeStore). Each tile previews the theme's own colors.
 */
export default function AppearanceCard() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  return (
    <div className="premium-card p-5 sm:p-6">
      <h3 className="font-display text-lg font-semibold text-text-primary">Appearance</h3>
      <p className="mt-1 text-[13px] text-text-secondary">
        Pick a theme. It applies instantly and is saved on this device.
      </p>

      <div
        role="radiogroup"
        aria-label="Theme"
        className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5"
      >
        {THEMES.map((t) => {
          const active = t.key === theme
          const ink = t.group === 'light' ? '#1A1D26' : '#ECEDF1'
          const sub = t.group === 'light' ? '#5B6373' : '#9A9CA8'
          return (
            <button
              key={t.key}
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(t.key)}
              title={t.name}
              className={cn(
                'group relative rounded-2xl border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
                active ? 'border-glass-2 ring-2 ring-accent/70' : 'border-glass hover:border-glass-2',
              )}
              style={{ background: t.sw.bg }}
            >
              <div className="rounded-xl border p-3" style={{ background: t.sw.c, borderColor: t.group === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)' }}>
                <span aria-hidden="true" className="block h-px w-full mb-2.5 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${t.sw.a}, transparent)` }} />
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium num" style={{ color: t.sw.a }}>Rs 3.28M</span>
                  {active && <Check className="h-4 w-4" style={{ color: t.sw.a }} />}
                </div>
                <div className="mt-0.5 text-[11px]" style={{ color: sub }}>net profit</div>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="h-6 flex-1 rounded-lg" style={{ background: t.sw.a }} />
                  <span className="h-3 w-3 rounded-full" style={{ background: t.sw.p }} aria-hidden="true" />
                  <span className="h-3 w-3 rounded-full" style={{ background: t.sw.n }} aria-hidden="true" />
                  <span className="h-3 w-3 rounded-full" style={{ background: t.sw.h }} aria-hidden="true" />
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline justify-between gap-2 px-0.5">
                <span className="text-[13.5px] font-semibold truncate" style={{ color: ink }}>{t.name}</span>
                <span className="text-[11px] flex-shrink-0" style={{ color: sub }}>{t.tagline}</span>
              </div>
              <div className="px-0.5 text-[11px] uppercase tracking-wider" style={{ color: sub }}>{t.group}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
