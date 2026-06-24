import { MODULES } from '@/components/layout/nav.config'
import { useModulesStore } from '@/stores/useModulesStore'
import { cn } from '@/utils/cn'

/*
 * ModulesCard — turn optional navigation modules on/off.
 *
 * Always-on modules (Home, Sales, Purchases, Banking, Accounting, Reports) and
 * Settings can't be hidden. Optional ones (Payroll, Planning, Tax & Compliance)
 * default to on; hide the ones this business doesn't use to keep the rail tidy.
 */
export default function ModulesCard() {
  const disabled = useModulesStore((s) => s.disabled)
  const toggle = useModulesStore((s) => s.toggle)
  const optional = MODULES.filter((m) => !m.alwaysOn && !m.pinBottom)

  return (
    <div className="premium-card p-5 sm:p-6 space-y-4">
      <div>
        <h3 className="font-display text-lg font-semibold text-text-primary">Navigation modules</h3>
        <p className="mt-1 text-[13px] text-text-secondary">
          Show only the parts of VousFin you use. Core modules always stay visible.
        </p>
      </div>

      <div className="space-y-2.5">
        {optional.map((m) => {
          const on = !disabled.includes(m.key)
          return (
            <div key={m.key} className="flex items-center justify-between gap-3 rounded-xl border border-glass bg-glass-panel px-3.5 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `rgb(${m.accent} / 0.12)`, boxShadow: `inset 0 0 0 1px rgb(${m.accent} / 0.28)` }}
                >
                  <m.icon className="h-[18px] w-[18px]" style={{ color: `rgb(${m.accent})` }} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary leading-tight">{m.name}</p>
                  <p className="truncate text-xs text-text-muted">{m.subtitle}</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`${on ? 'Hide' : 'Show'} ${m.name}`}
                onClick={() => toggle(m.key)}
                className={cn(
                  'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
                  on ? 'bg-accent' : 'bg-glass-hover border border-glass-2',
                )}
              >
                <span
                  className={cn(
                    'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
                    on ? 'translate-x-5' : 'translate-x-0',
                  )}
                />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
