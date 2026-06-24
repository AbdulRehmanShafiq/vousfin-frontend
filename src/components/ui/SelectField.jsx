/**
 * SelectField — Themed native <select> wrapper.
 *
 * Use for small inline dropdowns where the full portal-based Select component
 * is overkill (filter bars, small form fields, etc.).
 *
 * Props:
 *  label      — optional label above the select
 *  error      — optional error message shown below
 *  className  — extra classes on the <select> element
 *  All other props are forwarded to <select>.
 */
import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export const SelectField = forwardRef(({
  label,
  error,
  className,
  children,
  id,
  name,
  ...props
}, ref) => {
  const fieldId = id || name

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={fieldId} className="mb-1.5 block text-[11px] text-text-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={fieldId}
        name={name}
        className={cn(
          'w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary',
          'focus:outline-none focus:border-cyan/40 transition-colors',
          error ? 'border-negative/50' : '',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-negative">{error}</p>}
    </div>
  )
})

SelectField.displayName = 'SelectField'
export default SelectField
