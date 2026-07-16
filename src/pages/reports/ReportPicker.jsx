import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Check } from 'lucide-react'
import Sheet from '@/components/mobile/Sheet'
import { REPORT_TABS, reportTab, reportPath } from './reportTabs'
import { cn } from '@/utils/cn'

/**
 * Pick a report, on a phone.
 *
 * The desktop hub shows all ten as a scrolling chip row. That row was leaking
 * onto phones, where ten chips in a 375px strip is a smear you have to swipe
 * through to read — and it sat above the statement you actually opened. One
 * button naming the current report, opening a list, says the same thing in a
 * tenth of the space and reads at a glance.
 *
 * Same list as the hub (reportTabs), so the two can never drift on what reports
 * exist.
 */
/**
 * @param {string}  [current]  the open report — names the button, ticks the list
 * @param {string}  [label]    override the button text (the overview has no
 *                             current report, so it asks "All reports" instead)
 */
export default function ReportPicker({ current, label, className }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const active = reportTab(current)
  const Icon = label ? null : active?.icon

  const go = (key) => {
    setOpen(false)
    navigate(reportPath(key))
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          'tap-target flex w-full items-center justify-between gap-2 rounded-card',
          'border border-glass bg-glass-panel px-3 py-2.5 text-left',
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {Icon && <Icon className="h-4 w-4 flex-shrink-0 text-accent" aria-hidden="true" />}
          <span className="truncate text-sm font-semibold text-text-primary">
            {label || active?.label || 'Choose a report'}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 flex-shrink-0 text-text-muted" aria-hidden="true" />
      </button>

      <Sheet isOpen={open} onClose={() => setOpen(false)} title="Reports">
        <ul className="pb-2" role="list">
          {REPORT_TABS.map((t) => {
            const isActive = t.key === current
            return (
              <li key={t.key}>
                <button
                  type="button"
                  onClick={() => go(t.key)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'tap-target flex w-full items-center gap-3 rounded-card px-3 py-3 text-left',
                    isActive ? 'bg-glass-hover' : 'hover:bg-glass-hover',
                  )}
                >
                  <t.icon className={cn('h-5 w-5 flex-shrink-0', isActive ? 'text-accent' : 'text-text-muted')} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-text-primary">{t.label}</span>
                    {/* The plain line is the point: an owner picks by what they
                        want to know, not by the accountant's name for it. */}
                    <span className="block truncate text-xs text-text-muted">{t.plain}</span>
                  </span>
                  {isActive && <Check className="h-4 w-4 flex-shrink-0 text-accent" aria-hidden="true" />}
                </button>
              </li>
            )
          })}
        </ul>
      </Sheet>
    </>
  )
}
