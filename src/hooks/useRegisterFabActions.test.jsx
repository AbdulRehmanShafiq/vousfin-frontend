import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { useFabActions } from '@/stores/useFabActions'
import { useRegisterFabActions } from './useRegisterFabActions'

function Page({ actions }) {
  useRegisterFabActions(actions)
  return null
}

describe('useRegisterFabActions', () => {
  beforeEach(() => {
    useFabActions.setState({ actions: null })
  })

  it('publishes a page\'s actions to the store while mounted', () => {
    const run = () => {}
    render(<Page actions={[{ id: 'a', labelKey: 'x', run }]} />)
    expect(useFabActions.getState().actions).toEqual([{ id: 'a', labelKey: 'x', run }])
  })

  it('clears the store when the page unmounts (⊕ reverts to defaults)', () => {
    const { unmount } = render(<Page actions={[{ id: 'a', labelKey: 'x', run: () => {} }]} />)
    expect(useFabActions.getState().actions).not.toBeNull()
    unmount()
    expect(useFabActions.getState().actions).toBeNull()
  })

  it('treats an empty action list as nothing registered', () => {
    render(<Page actions={[]} />)
    expect(useFabActions.getState().actions).toBeNull()
  })

  it('the last page to mount owns the ⊕', () => {
    const { unmount: unmountA } = render(<Page actions={[{ id: 'a', labelKey: 'a', run: () => {} }]} />)
    render(<Page actions={[{ id: 'b', labelKey: 'b', run: () => {} }]} />)
    expect(useFabActions.getState().actions[0].id).toBe('b')
    // Unmounting one page clears; matches real navigation where the old page
    // unmounts and the store falls back until the new page's effect runs.
    unmountA()
    expect(useFabActions.getState().actions).toBeNull()
  })
})
