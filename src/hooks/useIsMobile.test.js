import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from './useIsMobile'

/** The one line between phone-native and desktop. Tailwind's `lg`. */
const MOBILE_QUERY = '(max-width: 1023px)'

function mockMatchMedia(initialMatches) {
  let listener = null
  const mql = {
    matches: initialMatches,
    media: MOBILE_QUERY,
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

const src = (p) => readFileSync(resolve(process.cwd(), p), 'utf8')

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

  it('asks for the lg breakpoint specifically', () => {
    // The tests above mock matchMedia wholesale, so they pass at ANY
    // breakpoint — they cannot see drift. This one can.
    mockMatchMedia(false)
    renderHook(() => useIsMobile())
    expect(window.matchMedia).toHaveBeenCalledWith(MOBILE_QUERY)
  })

  /*
   * The drift guard.
   *
   * Three things decide "phone or desktop", and they MUST agree:
   *   useIsMobile  — picks MobileHome vs the desktop Dashboard   (JS)
   *   MobileNav    — the bottom bar                              (CSS)
   *   RailPanel    — the desktop rail                            (CSS)
   *
   * They silently disagreed once: this hook said 767 while both classes said
   * lg (1024), which opened a 768–1023 band rendering the desktop page under
   * the mobile bar with no rail. Nothing failed, because CSS and JS drift
   * without ever throwing. Hence: assert it.
   */
  describe('agrees with the layout classes that decide the same thing', () => {
    it('hides the bottom bar exactly where this hook turns off', () => {
      expect(MOBILE_QUERY).toBe('(max-width: 1023px)') // i.e. lg
      expect(src('src/components/layout/MobileNav.jsx')).toContain('lg:hidden')
    })

    it('shows the rail exactly where this hook turns off', () => {
      expect(src('src/components/layout/RailPanel.jsx')).toContain('hidden lg:flex')
    })

    it("keeps the header's create button off the phone, where the ⊕ owns creating", () => {
      // `hidden sm:inline-flex` put a second "+ New" beside the ⊕ from 640px up.
      const header = src('src/components/layout/Header.jsx')
      expect(header).toContain('hidden lg:inline-flex')
      expect(header).not.toContain('hidden sm:inline-flex')
    })
  })
})
