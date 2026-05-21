import { cn } from '@/utils/cn'

const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }

export default function Spinner({ size = 'md', className }) {
  return (
    <span
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-brand-200 border-t-brand-600',
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  )
}
