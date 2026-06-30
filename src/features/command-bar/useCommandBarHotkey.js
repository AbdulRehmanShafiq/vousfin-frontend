import { useEffect } from 'react'
import { useCommandBar } from './useCommandBar'

function isTypingTarget(el) {
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable
}

/**
 * Binds the global open shortcuts: Cmd/Ctrl+K always opens; a bare "/" opens
 * only when the user is not typing in an input/textarea/contenteditable.
 */
export function useCommandBarHotkey() {
  const openBar = useCommandBar((s) => s.openBar)
  useEffect(() => {
    const onKey = (e) => {
      const cmdK = (e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')
      const slash = e.key === '/' && !isTypingTarget(document.activeElement)
      if (cmdK || slash) {
        e.preventDefault()
        openBar()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openBar])
}
