import api from './api'

/** Support ticket service for end users */
const supportService = {
  /** Create a new support ticket */
  create: ({ subject, category, priority, message }) =>
    api.post('/support/tickets', { subject, category, priority, message }),

  /** Get list of current user's support tickets */
  listMine: () =>
    api.get('/support/tickets'),

  /** Get a specific support ticket by ID */
  get: (id) =>
    api.get(`/support/tickets/${id}`),

  /** Reply to a support ticket */
  reply: (id, body) =>
    api.post(`/support/tickets/${id}/reply`, { body }),
}

export default supportService