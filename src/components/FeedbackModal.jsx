import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Star } from 'lucide-react'
import feedbackService from '@/services/feedback.service'
import SelectField from '@/components/ui/SelectField'
import { cn } from '@/utils/cn'
import { getErrorMessage } from '@/utils/errorHandler'
import { toast } from 'react-hot-toast'
import { useFeedbackStore } from '@/stores/useFeedbackStore'

export default function FeedbackModal() {
  const { isOpen, setIsOpen } = useFeedbackStore()
  const [formData, setFormData] = useState({
    type: 'question',
    subject: '',
    message: '',
    rating: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      await feedbackService.submit(formData)
      toast.success('Feedback submitted successfully!')
      setFormData({
        type: 'question',
        subject: '',
        message: '',
        rating: 0,
      })
      setIsOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 sm:max-w-lg">
        <div className="relative bg-charcoal rounded-xl border border-glass p-6 shadow-2xl">
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-3 top-2.5 p-1 hover:bg-opacity-20 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-text-secondary" />
          </button>

          <h2 className="mb-4 text-xl font-semibold text-text-primary">
            Send Feedback
          </h2>
          <p className="mb-6 text-[13px] text-text-secondary">
            Help us improve VousFin by sharing your thoughts
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type */}
            <div>
              <label className="block mb-1 text-[13px] font-medium text-text-secondary">Type</label>
              <SelectField
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="question">Question</option>
                <option value="other">Other</option>
              </SelectField>
            </div>

            {/* Subject */}
            <div>
              <label className="block mb-1 text-[13px] font-medium text-text-secondary">Subject</label>
              <input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief summary of your feedback"
                className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-cyan/40"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block mb-1 text-[13px] font-medium text-text-secondary">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please provide details..."
                className="w-full px-3 py-2 rounded-lg border border-glass bg-glass-panel/40 text-[13px] text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-cyan/40"
                rows={4}
              />
            </div>

            {/* Rating (optional) */}
            <div>
              <label className="block mb-1 text-[13px] font-medium text-text-secondary">Rating (Optional)</label>
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className={cn(
                      'p-1 rounded hover:bg-gray-700',
                      star <= formData.rating ? 'text-yellow-400' : 'text-text-muted'
                    )}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-text-muted center">
                Click stars to rate (optional)
              </p>
            </div>
          </form>

          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-lg border border-glass text-[13px] text-text-secondary hover:bg-glass-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'px-4 py-2 rounded-lg text-[13px] font-medium transition-colors',
                isSubmitting
                  ? 'bg-gray-500/50 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400'
              )}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}