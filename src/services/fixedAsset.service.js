// src/services/fixedAsset.service.js — Fixed Asset Register
import api from './api'

const fixedAssetService = {
  list:       ()         => api.get('/fixed-assets'),
  create:     (data)     => api.post('/fixed-assets', data),
  get:        (id)       => api.get(`/fixed-assets/${id}`),
  schedule:   (id)       => api.get(`/fixed-assets/${id}/schedule`),
  depreciate: (id)       => api.post(`/fixed-assets/${id}/depreciate`),
  dispose:    (id, data) => api.post(`/fixed-assets/${id}/dispose`, data),
}

export default fixedAssetService
