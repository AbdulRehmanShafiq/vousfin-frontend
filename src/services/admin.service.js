import api from './api'

/** Admin-only API calls. All endpoints require admin role on the backend. */
const adminService = {
  stats: () =>
    api.get('/admin/stats'),

  listUsers: (params = {}) =>
    api.get('/admin/customers', { params }),

  getUser: (id) =>
    api.get(`/admin/customers/${id}`),

  suspend: (id, reason = '') =>
    api.put(`/admin/customers/${id}/suspend`, { reason }),

  reinstate: (id) =>
    api.put(`/admin/customers/${id}/reinstate`),

  verify: (id) =>
    api.put(`/admin/customers/${id}/verify`),

  setRole: (id, role) =>
    api.put(`/admin/customers/${id}/role`, { role }),

  remove: (id) =>
    api.delete(`/admin/customers/${id}`),

  listBusinesses: (params = {}) =>
    api.get('/admin/businesses', { params }),

  // Feedback management
  listFeedback: (params = {}) =>
    api.get('/admin/feedback', { params }),

  updateFeedback: (id, data) =>
    api.patch(`/admin/feedback/${id}`, data),

  // Support ticket management
  listSupport: (params = {}) =>
    api.get('/admin/support', { params }),

  getTicket: (id) =>
    api.get(`/admin/support/${id}`),

  replyTicket: (id, body) =>
    api.post(`/admin/support/${id}/reply`, { body }),

  updateTicket: (id, data) =>
    api.patch(`/admin/support/${id}`, data),

  // Announcement management
  listAnnouncements: () =>
    api.get('/admin/announcements'),

  createAnnouncement: (data) =>
    api.post('/admin/announcements', data),

  updateAnnouncement: (id, data) =>
    api.patch(`/admin/announcements/${id}`, data),

  deleteAnnouncement: (id) =>
    api.delete(`/admin/announcements/${id}`),

  // Activity log
  activity: (params = {}) =>
    api.get('/admin/activity', { params }),

  // MFA reset
  resetMfa: (id) =>
    api.put(`/admin/customers/${id}/reset-mfa`),
}

export default adminService