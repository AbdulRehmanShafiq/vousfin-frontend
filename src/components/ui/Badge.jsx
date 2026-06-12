import { cn } from '@/utils/cn'

const variants = {
  default: 'bg-glass-panel text-text-secondary border-glass',
  success: 'bg-positive-muted text-positive border-emerald/20',
  warning: 'bg-amber/10 text-amber-2 border-amber/20',
  danger: 'bg-negative-muted text-negative border-negative/20',
  info: 'bg-accent-soft text-accent border-accent/20',
}

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
