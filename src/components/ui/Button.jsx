import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

/*
 * Button — single canonical button for the app.
 *
 * Variant vocabulary unifies the two legacy sets:
 *   gradient | primary   → solid accent (the one loud element on a screen)
 *   outline  | secondary → neutral hairline
 *   ghost                → borderless quiet action
 *   amber                → caution
 *   danger               → destructive
 */
const variants = {
  gradient: 'btn-gradient border border-transparent',
  primary: 'btn-gradient border border-transparent',
  outline: 'btn-outline',
  secondary: 'btn-outline',
  ghost: 'bg-transparent text-text-secondary border border-transparent hover:bg-glass-hover hover:text-text-primary',
  amber: 'bg-amber/10 text-amber-2 border border-amber/20 hover:bg-amber/20 hover:border-amber/40',
  danger: 'bg-negative-muted text-negative border border-negative/20 hover:bg-negative/20 hover:border-negative/40',
}

// Real size scale — retires ad-hoc `!px !py !text` overrides scattered across pages.
const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-5 py-3 text-base gap-2',
}

export const Button = forwardRef(({
  children,
  variant = 'gradient',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  type = 'button',
  ...props
}, ref) => {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold transition-premium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]',
        sizes[size] || sizes.md,
        variants[variant] || variants.gradient,
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && Icon && iconPosition === 'left' && <Icon className="h-4 w-4" />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className="h-4 w-4" />}
    </button>
  )
})
Button.displayName = 'Button'
export default Button
