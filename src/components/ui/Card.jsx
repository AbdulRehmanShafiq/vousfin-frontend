import { cn } from '@/utils/cn'

export default function Card({ children, className, noPadding = false, ...props }) {
  return (
    <div
      className={cn(
        'premium-card',
        !noPadding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
