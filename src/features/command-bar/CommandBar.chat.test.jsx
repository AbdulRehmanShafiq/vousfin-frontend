import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useCommandBar } from './useCommandBar'

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => vi.fn() }))
vi.mock('@/stores/useModulesStore', () => ({ useModulesStore: (sel) => sel({ disabled: [] }) }))
vi.mock('./catalogApi', () => ({ searchCatalogSemantic: vi.fn().mockResolvedValue([]) }))
vi.mock('./logApi', () => ({ logSearchEvent: vi.fn() }))

const sendMessage = vi.fn(() => Promise.resolve())
const clearChat = vi.fn()
let aiState = { messages: [], loading: false, sendMessage, clearChat }
vi.mock('@/stores/useAIStore', () => ({ useAIStore: (sel) => sel(aiState) }))

import { CommandBar } from './CommandBar'

beforeEach(() => {
  vi.clearAllMocks()
  aiState = { messages: [], loading: false, sendMessage, clearChat }
  useCommandBar.setState({ open: false, query: '', view: 'search' })
})

const wrap = () => render(<MemoryRouter><CommandBar /></MemoryRouter>)

describe('CommandBar — inline AI chat (merged assistant)', () => {
  it('offers an "Ask AI" row for a typed question and switching to it sends the message + enters chat', async () => {
    useCommandBar.setState({ open: true, query: '', view: 'search' })
    wrap()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'what is my net profit' } })
    const askRow = await screen.findByText(/Ask AI/i)
    fireEvent.mouseDown(askRow)
    expect(sendMessage).toHaveBeenCalledWith('what is my net profit')
    await waitFor(() => expect(useCommandBar.getState().view).toBe('chat'))
  })

  it('renders the conversation inline when in chat view', () => {
    aiState.messages = [
      { id: 1, role: 'user', content: 'what is my profit' },
      { id: 2, role: 'assistant', content: 'Your net profit is $5,000.', meta: {} },
    ]
    useCommandBar.setState({ open: true, view: 'chat' })
    wrap()
    expect(screen.getByText(/Your net profit is \$5,000/)).toBeInTheDocument()
  })

  it('sends a follow-up from the chat input on Enter', () => {
    aiState.messages = [{ id: 1, role: 'assistant', content: 'Hi', meta: {} }]
    useCommandBar.setState({ open: true, view: 'chat' })
    wrap()
    const chatInput = screen.getByLabelText(/message the ai assistant/i)
    fireEvent.change(chatInput, { target: { value: 'and last month?' } })
    fireEvent.keyDown(chatInput, { key: 'Enter' })
    expect(sendMessage).toHaveBeenCalledWith('and last month?')
  })

  it('Escape in chat view returns to search (does not close the bar)', () => {
    useCommandBar.setState({ open: true, view: 'chat' })
    wrap()
    fireEvent.keyDown(screen.getByLabelText(/message the ai assistant/i), { key: 'Escape' })
    expect(useCommandBar.getState().view).toBe('search')
    expect(useCommandBar.getState().open).toBe(true)
  })
})
