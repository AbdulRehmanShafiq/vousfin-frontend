import { cn } from '@/utils/cn'

const variants = {
  default: 'bg-glass-panel text-text-secondary border-glass',
  success: 'bg-emerald/10 text-emerald-300 border-emerald/20',
  warning: 'bg-amber/10 text-amber-2 border-amber/20',
  danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-cyan/10 text-cyan border-cyan/20',
}

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wide',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
