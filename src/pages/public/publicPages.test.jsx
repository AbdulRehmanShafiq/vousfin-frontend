import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PublicContentPage from './PublicContentPage'
import DocsPage from './DocsPage'
import { CONTENT_KEYS } from './publicContent'

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('public content pages', () => {
  it('renders every content doc without crashing', () => {
    for (const key of CONTENT_KEYS) {
      const { unmount } = wrap(<PublicContentPage doc={key} />)
      unmount()
    }
    expect(CONTENT_KEYS.length).toBeGreaterThanOrEqual(8)
  })

  it('renders the About page heading + intro', () => {
    wrap(<PublicContentPage doc="about" />)
    expect(screen.getByRole('heading', { name: 'About VousFin', level: 1 })).toBeInTheDocument()
  })

  it('shows the Privacy policy', () => {
    wrap(<PublicContentPage doc="privacy" />)
    expect(screen.getByRole('heading', { name: 'Privacy Policy', level: 1 })).toBeInTheDocument()
  })

  it('falls back gracefully for an unknown doc', () => {
    wrap(<PublicContentPage doc="does-not-exist" />)
    expect(screen.getByText(/doesn’t exist/)).toBeInTheDocument()
  })
})

describe('DocsPage', () => {
  it('renders the documentation with a table of contents', () => {
    wrap(<DocsPage />)
    expect(screen.getByRole('heading', { name: 'Documentation', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /table of contents/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /getting started/i })).toBeInTheDocument()
  })
})
