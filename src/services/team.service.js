// src/services/team.service.js — Phase 6A team & RBAC
import api from './api'

const teamService = {
  me:          ()                 => api.get('/team/me'), // current user's roles + permissions
  list:        ()                 => api.get('/team'),
  invite:      (email, roles)     => api.post('/team/invite', { email, roles }),
  accept:      (token)            => api.post('/team/accept', { token }),
  updateRoles: (userId, roles)    => api.patch(`/team/${userId}/roles`, { roles }),
  remove:      (userId)           => api.delete(`/team/${userId}`),
}

export default teamService
