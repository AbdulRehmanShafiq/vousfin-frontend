import { useEffect, useState } from 'react'
import supportService from '@/services/support.service'
import { getErrorMessage } from '@/utils/errorHandler'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import SelectField from '@/components/ui/SelectField'
import toast from 'react-hot-toast'

/**
 * SupportPage - User-facing support ticket system
 */
export default function SupportPage() {
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: '',
    priority: '',
    message: '',
  })
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReplying, setIsReplying] = useState(false)

  // Fetch user's tickets
  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true)
      try {
        const res = await supportService.listMine()
        setTickets(res.data.data || [])
      } catch (err) {
        toast.error(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }

    fetchTickets()
  }, [])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setNewTicket(prev => ({ ...prev, [name]: value }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newTicket.subject || !newTicket.category || !newTicket.priority || !newTicket.message) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      await supportService.create(newTicket)
      toast.success('Support ticket submitted successfully')
      setNewTicket({
        subject: '',
        category: '',
        priority: '',
        message: '',
      })
      // Refresh tickets
      const res = await supportService.listMine()
      setTickets(res.data.data || [])
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle reply submission
  const handleReplySubmit = async (e) => {
    e.preventDefault()
    if (!replyText.trim() || !selectedTicket) {
      return
    }

    setIsReplying(true)
    try {
      await supportService.reply(selectedTicket._id, { body: replyText })
      toast.success('Reply sent successfully')
      setReplyText('')
      // Refresh ticket to get updated conversation
      const res = await supportService.get(selectedTicket._id)
      setSelectedTicket(res.data.data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsReplying(false)
    }
  }

  // Handle ticket selection
  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket)
    setReplyText('')
  }

  if (isLoading) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center py-8">
        <div className="animate-pulse h-8 w-8 rounded bg-gray-300" />
        <p className="mt-2 text-small text-text-secondary">Loading your tickets...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold text-text-primary">Support Center</h1>
        <p className="text-small text-text-muted max-w-xl text-center">
          Get help with any questions or issues you encounter while using VousFin
        </p>
      </div>

      {/* Main content */}
      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        {/* Left column - New ticket form */}
        <div className="space-y-4">
          <div className="border rounded-xl border-glass bg-charcoal p-4">
            <h2 className="mb-3 text-xl font-semibold text-text-primary">New Support Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-small font-medium text-text-secondary">Subject</label>
                <Input
                  type="text"
                  name="subject"
                  value={newTicket.subject}
                  onChange={handleChange}
                  placeholder="Briefly describe your issue or question"
                  className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block mb-1 text-small font-medium text-text-secondary">Category</label>
                  <SelectField
                    name="category"
                    value={newTicket.category}
                    onChange={handleChange}
                  >
                    <option value="">Select a category</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="feature">Feature Request</option>
                    <option value="account">Account Help</option>
                    <option value="other">Other</option>
                  </SelectField>
                </div>

                <div>
                  <label className="block mb-1 text-small font-medium text-text-secondary">Priority</label>
                  <SelectField
                    name="priority"
                    value={newTicket.priority}
                    onChange={handleChange}
                  >
                    <option value="">Select priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </SelectField>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-small font-medium text-text-secondary">Message</label>
                <textarea
                  name="message"
                  value={newTicket.message}
                  onChange={handleChange}
                  placeholder="Please provide as much detail as possible..."
                  className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40"
                  rows={4}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-auto px-4 py-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right column - My Tickets */}
        <div className="space-y-4">
          <div className="border rounded-xl border-glass bg-charcoal p-4">
            <h2 className="mb-3 text-xl font-semibold text-text-primary">My Support Tickets</h2>

            {selectedTicket ? (
              // Ticket detail view
              <div className="space-y-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-text-primary">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-label font-semibold ${
                      selectedTicket.priority === 'low' ? 'bg-text-muted/20 text-text-muted' :
                      selectedTicket.priority === 'medium' ? 'bg-highlight/20 text-highlight' :
                      selectedTicket.priority === 'high' ? 'bg-negative/20 text-negative' :
                      selectedTicket.priority === 'urgent' ? 'bg-positive/20 text-positive' :
                      'bg-text-muted/20 text-text-muted'
                    }`}>
                      {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-label font-semibold ${
                      selectedTicket.status === 'open' ? 'bg-highlight/20 text-highlight' :
                      selectedTicket.status === 'in_progress' ? 'bg-accent/20 text-accent' :
                      selectedTicket.status === 'resolved' ? 'bg-positive/20 text-positive' :
                      selectedTicket.status === 'closed' ? 'bg-text-muted/20 text-text-muted' :
                      'bg-text-muted/20 text-text-muted'
                    }`}>
                      {selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="border-t border-glass pt-4">
                  <h4 className="mb-2 text-small font-medium text-text-secondary">Conversation</h4>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {(selectedTicket.messages || []).map((msg, index) => (
                      <div key={index} className={`flex flex-col gap-1 ${
                        msg.fromUser ? 'items-start' : 'items-end'
                      }`}>
                        <div className={`max-w-[80%] ${
                          msg.fromUser ? 'bg-blue-500/10 text-blue-500 self-start' : 'bg-green-500/10 text-green-500 self-end'
                        } rounded-lg px-3 py-2`}>
                          <p className="text-small whitespace-pre-wrap">{msg.body}</p>
                          <p className="text-label opacity-70">
                            {msg.fromUser ? 'You' : 'Support Team'} • {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-glass pt-4">
                  <form onSubmit={handleReplySubmit} className="space-y-3">
                    <div>
                      <label className="block mb-1 text-small font-medium text-text-secondary">Your Reply</label>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply here..."
                        className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-small text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/40"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isReplying}
                        className="w-auto px-4 py-2"
                      >
                        {isReplying ? 'Sending...' : 'Send Reply'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              // Ticket list
              tickets.length > 0 ? (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      onClick={() => handleSelectTicket(ticket)}
                      className={`cursor-pointer p-3 rounded-lg border border-glass hover:bg-glass-hover transition-colors ${
                        selectedTicket && selectedTicket._id === ticket._id ? 'border-accent bg-accent/5' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-text-primary">{ticket.subject}</h4>
                        <div className="flex items-center gap-2 text-label">
                          <span className={`px-1.5 py-0.5 rounded text-label ${
                            ticket.priority === 'low' ? 'bg-text-muted/20 text-text-muted' :
                            ticket.priority === 'medium' ? 'bg-highlight/20 text-highlight' :
                            ticket.priority === 'high' ? 'bg-negative/20 text-negative' :
                            ticket.priority === 'urgent' ? 'bg-positive/20 text-positive' :
                            'bg-text-muted/20 text-text-muted'
                          }`}>
                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-label ${
                            ticket.status === 'open' ? 'bg-highlight/20 text-highlight' :
                            ticket.status === 'in_progress' ? 'bg-accent/20 text-accent' :
                            ticket.status === 'resolved' ? 'bg-positive/20 text-positive' :
                            ticket.status === 'closed' ? 'bg-text-muted/20 text-text-muted' :
                            'bg-text-muted/20 text-text-muted'
                          }`}>
                            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <p className="text-small line-clamp-2 text-text-secondary">{ticket.message}</p>
                      <p className="text-label text-text-muted">
                        {new Date(ticket.createdAt).toLocaleDateString()} •
                        {ticket.userId?.email || 'Anonymous'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-small text-text-muted">You haven't submitted any support tickets yet.</p>
                  <Button
                    onClick={() => {
                      // Scroll to form
                      document.getElementById('new-ticket-form')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    variant="outline"
                  >
                    Create Your First Ticket
                  </Button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}