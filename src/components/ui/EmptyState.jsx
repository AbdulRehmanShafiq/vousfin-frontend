import { Inbox } from 'lucide-react'
import Button from './Button'

export default function EmptyState({ 
  title = 'No records found', 
  description = "Get started by creating a new record.", 
  actionLabel, 
  onAction,
  icon: Icon = Inbox
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-glass p-12 text-center bg-glass-panel">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-glass-hover mb-4">
        <Icon className="h-8 w-8 text-cyan" />
      </div>
      <h3 className="text-lg font-bold text-text-primary">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-text-muted">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
