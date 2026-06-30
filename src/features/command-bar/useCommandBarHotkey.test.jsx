import { describe, it, expect, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { useCommandBar } from './useCommandBar'
import { useCommandBarHotkey } from './useCommandBarHotkey'

function Harness() { useCommandBarHotkey(); return <input data-testid="field" /> }

describe('useCommandBarHotkey', () => {
  beforeEach(() => useCommandBar.setState({ open: false, query: '' }))

  it('opens on Ctrl+K', () => {
    render(<Harness />)
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    expect(useCommandBar.getState().open).toBe(true)
  })

  it('opens on bare "/" when not typing in a field', () => {
    render(<Harness />)
    fireEvent.keyDown(window, { key: '/' })
    expect(useCommandBar.getState().open).toBe(true)
  })

  it('does NOT open on "/" while focused in an input', () => {
    const { getByTestId } = render(<Harness />)
    getByTestId('field').focus()
    fireEvent.keyDown(getByTestId('field'), { key: '/' })
    expect(useCommandBar.getState().open).toBe(false)
  })
})
