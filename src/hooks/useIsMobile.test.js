import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from './useIsMobile'

function mockMatchMedia(initialMatches) {
  let listener = null
  const mql = {
    matches: initialMatches,
    media: '(max-width: 767px)',
    addEventListener: vi.fn((event, cb) => { listener = cb }),
    removeEventListener: vi.fn(),
  }
  window.matchMedia = vi.fn().mockReturnValue(mql)
  return {
    mql,
    fire: (matches) => {
      mql.matches = matches
      act(() => listener({ matches }))
    },
  }
}

describe('useIsMobile', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true when the viewport starts under the mobile breakpoint', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('returns false when the viewport starts at desktop width', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('updates when the media query change fires', () => {
    const { fire } = mockMatchMedia(false)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
    fire(true)
    expect(result.current).toBe(true)
  })
})
