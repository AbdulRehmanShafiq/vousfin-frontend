import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Eye, Undo2 } from 'lucide-react'
import SwipeRow from './SwipeRow'
import ListCard from './ListCard'

describe('SwipeRow', () => {
  it('renders the wrapped card content', () => {
    render(
      <SwipeRow actions={[]}>
        <ListCard title="Rent payment" />
      </SwipeRow>,
    )
    expect(screen.getByText('Rent payment')).toBeInTheDocument()
  })

  it('exposes actions through the always-present more button (no gesture required)', () => {
    const onDetails = vi.fn()
    const onReverse = vi.fn()
    render(
      <SwipeRow
        actions={[
          { label: 'Details', icon: Eye, onClick: onDetails },
          { label: 'Reverse', icon: Undo2, tone: 'danger', onClick: onReverse },
        ]}
      >
        <ListCard title="Rent payment" />
      </SwipeRow>,
    )

    fireEvent.click(screen.getByLabelText('More actions'))
    expect(screen.getByText('Actions')).toBeInTheDocument()

    // Two "Details" / "Reverse" labels exist (hidden swipe layer + sheet) —
    // the sheet's copy is the one currently visible/clickable in the dialog.
    const detailsButtons = screen.getAllByText('Details')
    fireEvent.click(detailsButtons[detailsButtons.length - 1])
    expect(onDetails).toHaveBeenCalled()
  })

  it('renders no more button when there are no actions', () => {
    render(
      <SwipeRow actions={[]}>
        <ListCard title="Row" />
      </SwipeRow>,
    )
    expect(screen.queryByLabelText('More actions')).not.toBeInTheDocument()
  })
})
