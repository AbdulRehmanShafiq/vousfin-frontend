import { useState, useCallback } from 'react'
import { getJSON, setJSON } from '@/utils/localStorage'

export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => getJSON(key, initialValue))

  const setValue = useCallback(
    (value) => {
      const next = value instanceof Function ? value(stored) : value
      setStored(next)
      setJSON(key, next)
    },
    [key, stored]
  )

  return [stored, setValue]
}
