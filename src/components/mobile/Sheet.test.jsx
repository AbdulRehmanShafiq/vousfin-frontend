import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Sheet from './Sheet'

describe('Sheet', () => {
  it('renders nothing when closed', () => {
    render(<Sheet isOpen={false} onClose={() => {}} title="Test">content</Sheet>)
    expect(screen.queryByText('content')).not.toBeInTheDocument()
  })

  it('renders title and children when open', () => {
    render(<Sheet isOpen={true} onClose={() => {}} title="Add item">Body content</Sheet>)
    expect(screen.getByText('Add item')).toBeInTheDocument()
    expect(screen.getByText('Body content')).toBeInTheDocument()
  })

  it('renders the footer when provided', () => {
    render(
      <Sheet isOpen={true} onClose={() => {}} title="X" footer={<button>Save</button>}>
        body
      </Sheet>,
    )
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<Sheet isOpen={true} onClose={onClose} title="X">body</Sheet>)
    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    render(<Sheet isOpen={true} onClose={onClose} title="X">body</Sheet>)
    fireEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalled()
  })
})
