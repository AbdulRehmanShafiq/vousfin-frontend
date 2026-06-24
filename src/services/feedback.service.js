import api from './api'

/** Feedback submission service */
const feedbackService = {
  /** Submit feedback */
  submit: ({ type, subject, message, rating }) =>
    api.post('/feedback', { type, subject, message, rating }),
}

export default feedbackService