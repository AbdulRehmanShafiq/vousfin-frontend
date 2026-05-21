import api from './api'

const adminService = {
  getCustomers: (params) => api.get('/admin/customers', { params }),
  getCustomer: (id) => api.get(`/admin/customers/${id}`),
  suspendCustomer: (id, reason) => api.put(`/admin/customers/${id}/suspend`, { reason }),
  reinstateCustomer: (id) => api.put(`/admin/customers/${id}/reinstate`),
  deleteCustomer: (id) => api.delete(`/admin/customers/${id}`),
  getStats: () => api.get('/admin/stats'),
}

export default adminService
