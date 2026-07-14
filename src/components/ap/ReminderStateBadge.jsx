/**
 * ReminderStateBadge — Phase 3.3
 *
 * Compact chip that shows a bill's reminder/urgency state.
 * Props: state — 'upcoming' | 'due_today' | 'overdue' | 'critical_overdue'
 */
import { Clock, AlertCircle, AlertTriangle, Bell } from 'lucide-react'

const STATE_CONFIG = {
  upcoming:         { label: 'Upcoming',          bg: 'bg-accent/15',   text: 'text-accent',   Icon: Bell         },
  due_today:        { label: 'Due Today',          bg: 'bg-highlight/20', text: 'text-highlight', Icon: AlertTriangle },
  overdue:          { label: 'Overdue',            bg: 'bg-highlight/20',text: 'text-highlight',Icon: AlertCircle  },
  critical_overdue: { label: 'Critical Overdue',   bg: 'bg-negative/20',   text: 'text-negative',   Icon: AlertCircle  },
}

export default function ReminderStateBadge({ state }) {
  if (!state) return null
  const cfg = STATE_CONFIG[state]
  if (!cfg) return null
  const { Icon } = cfg
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-small
                       font-medium ${cfg.bg} ${cfg.text}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  )
}
