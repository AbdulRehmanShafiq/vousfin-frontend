// src/services/costCenter.service.js — SRS FR-07.1
import api from './api'

const costCenterService = {
  list:   (params)   => api.get('/cost-centers', { params }),
  tree:   ()         => api.get('/cost-centers/tree'),
  get:    (id)       => api.get(`/cost-centers/${id}`),
  create: (data)     => api.post('/cost-centers', data),
  update: (id, data) => api.put(`/cost-centers/${id}`, data),
  remove: (id)       => api.delete(`/cost-centers/${id}`),
}

export default costCenterService
