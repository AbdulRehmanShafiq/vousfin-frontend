import { useEffect } from 'react'

/**
 * useEditorKeys — the editor half of the Ledger keyboard spine (spec §10.2).
 *
 *   ⌘/Ctrl+Enter → save (fires from anywhere in the editor, including
 *                  while focus sits in an input — that's the point)
 *
 * Pass enabled=false for read-only views.
 */
export function useEditorKeys({ onSave, enabled = true }) {
  useEffect(() => {
    if (!enabled) return undefined
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        onSave?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onSave, enabled])
}

/**
 * useUnsavedGuard — warns before the tab closes while an editor has unsaved
 * work. (In-app route guards need a data router; this covers the hard exit.)
 */
export function useUnsavedGuard(dirty) {
  useEffect(() => {
    if (!dirty) return undefined
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])
}
