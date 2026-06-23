// src/services/sod.service.js — Phase 6B (Segregation of Duties)
import api from './api'

const sodService = {
  list:   ()                    => api.get('/sod/rules'),
  add:    (roleA, roleB, reason) => api.post('/sod/rules', { roleA, roleB, reason }),
  remove: (id)                  => api.delete(`/sod/rules/${id}`),
}

export default sodService
