import api from './api'

/** Feature #5 — recurring / template transactions. */
const transactionTemplateService = {
  list:    (params)        => api.get('/transaction-templates', { params }),
  getById: (id)            => api.get(`/transaction-templates/${id}`),
  create:  (data)          => api.post('/transaction-templates', data),
  update:  (id, data)      => api.put(`/transaction-templates/${id}`, data),
  remove:  (id)            => api.delete(`/transaction-templates/${id}`),
  apply:   (id, overrides) => api.post(`/transaction-templates/${id}/apply`, overrides || {}),
  runDue:  ()              => api.post('/transaction-templates/run-due'),
}

export default transactionTemplateService
