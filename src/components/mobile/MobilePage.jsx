import { createContext, useContext } from 'react'
import { cn } from '@/utils/cn'

/**
 * MobilePage — screen scaffold for purpose-built mobile pages. Large-title
 * header, generous horizontal padding, safe-area top inset, and an optional
 * sticky bottom call-to-action pinned in the thumb zone.
 *
 * EmbeddedContext (Mobile Easy M2): when a host surface (the Money tab)
 * embeds an existing mobile screen under its own header + segmented control,
 * the inner MobilePage drops its large title so headers never stack.
 */
export const EmbeddedContext = createContext(false)

export default function MobilePage({ title, subtitle, right, children, cta, className }) {
  const embedded = useContext(EmbeddedContext)
  return (
    <div className="flex h-full flex-col">
      {!embedded && (
        <div className="flex-shrink-0 px-5 pt-safe" style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}>
          <div className="flex items-start justify-between gap-3 py-3">
            <div className="min-w-0">
              <h1 className="text-[26px] font-bold leading-tight text-text-primary tracking-tight truncate">{title}</h1>
              {subtitle && <p className="mt-0.5 text-sm text-text-secondary">{subtitle}</p>}
            </div>
            {right && <div className="flex-shrink-0">{right}</div>}
          </div>
        </div>
      )}

      <div className={cn('flex-1 overflow-y-auto scrollbar-thin px-5 pb-4', embedded && 'px-0', className)}>
        {children}
      </div>

      {cta && (
        <div
          className="flex-shrink-0 border-t border-glass bg-charcoal/95 backdrop-blur px-5 pt-3"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
        >
          {cta}
        </div>
      )}
    </div>
  )
}
