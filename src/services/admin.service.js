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
}

export default adminService
