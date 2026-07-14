import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/stores/useUIStore'

/**
 * useGlobalShortcuts — the Ledger keyboard spine (spec §6).
 *
 *   g then s/p/b/a/r/t/h  → go to Sales / Purchases / Banking / Accounting /
 *                           Reports / Transactions / Home
 *   c                     → open the universal Create modal
 *   ?                     → toggle the shortcut overlay
 *
 * ⌘K / "/" stay owned by useCommandBarHotkey. Never fires while typing.
 * Returns { overlayOpen, setOverlayOpen } for the layout to render the map.
 */

export const GO_TARGETS = [
  ['s', '/sales', 'Sales'],
  ['p', '/purchases', 'Purchases'],
  ['b', '/banking', 'Banking'],
  ['a', '/accounting', 'Accounting'],
  ['r', '/reports', 'Reports'],
  ['t', '/transactions', 'Transactions'],
  ['h', '/dashboard', 'Home'],
]

const isTyping = (e) =>
  e.target.closest?.('input, textarea, select, [contenteditable="true"], [role="combobox"]')

export function useGlobalShortcuts() {
  const navigate = useNavigate()
  const openTxModal = useUIStore((s) => s.openTxModal)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const pendingG = useRef(0)

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isTyping(e)) return

      // second key of a "g …" sequence (1.5s window)
      if (pendingG.current && Date.now() - pendingG.current < 1500) {
        const hit = GO_TARGETS.find(([k]) => k === e.key.toLowerCase())
        pendingG.current = 0
        if (hit) {
          e.preventDefault()
          navigate(hit[1])
          return
        }
      }

      if (e.key === 'g') { pendingG.current = Date.now(); return }
      if (e.key === 'c') { e.preventDefault(); openTxModal(); return }
      if (e.key === '?') { e.preventDefault(); setOverlayOpen((o) => !o); return }
      if (e.key === 'Escape') setOverlayOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, openTxModal])

  return { overlayOpen, setOverlayOpen }
}
