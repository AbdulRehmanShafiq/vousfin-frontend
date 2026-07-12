import { useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/utils/cn'

const THRESHOLD = 64

/**
 * PullToRefresh — touch-only pull-down gesture at scrollTop 0 that calls
 * onRefresh() (may return a promise). No-op for mouse/keyboard users —
 * they simply don't see the gesture; nothing they need is gesture-only.
 */
export default function PullToRefresh({ onRefresh, children, className }) {
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const containerRef = useRef(null)
  const startY = useRef(null)
  const active = useRef(false)

  const onTouchStart = (e) => {
    if (refreshing) return
    if ((containerRef.current?.scrollTop ?? 0) > 0) return
    startY.current = e.touches[0].clientY
    active.current = true
  }
  const onTouchMove = (e) => {
    if (!active.current || startY.current == null) return
    const dy = e.touches[0].clientY - startY.current
    if (dy > 0) setPull(Math.min(dy * 0.5, THRESHOLD * 1.5))
  }
  const onTouchEnd = async () => {
    active.current = false
    if (pull >= THRESHOLD && !refreshing) {
      setRefreshing(true)
      setPull(THRESHOLD)
      try { await onRefresh?.() } finally {
        setRefreshing(false)
        setPull(0)
      }
    } else {
      setPull(0)
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-y-auto', className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-150"
        style={{ height: pull }}
        aria-hidden="true"
      >
        <RefreshCw className={cn('h-4 w-4 text-text-muted', refreshing && 'animate-spin')} />
      </div>
      {children}
    </div>
  )
}
