import { cn } from '@/utils/cn'

/*
 * SectionHeader — a quiet section divider: a small uppercase label with a
 * hairline running to the right, plus optional trailing content (a link, a
 * count). Replaces boxed section panels in the Calm redesign.
 */
export default function SectionHeader({ label, trailing, className }) {
  return (
    <div className={cn('mb-3 flex items-center gap-3', className)}>
      <span className="text-label font-bold uppercase tracking-widest text-text-muted">{label}</span>
      <div className="h-px flex-1 bg-glass" />
      {trailing}
    </div>
  )
}
