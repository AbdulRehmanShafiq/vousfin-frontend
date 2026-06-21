import api from './api'

const reportService = {
  incomeStatement: (params) => api.get('/reports/income-statement', { params }),
  balanceSheet: (params) => api.get('/reports/balance-sheet', { params }),
  cashFlow: (params) => api.get('/reports/cash-flow', { params }),
  kpi: (params) => api.get('/reports/kpi', { params }),
  exportReport: (params) =>
    api.get('/reports/export', { params, responseType: 'blob' }),

  // ── Report Builder: Template CRUD ────────────────────────────────────
  listTemplates: () =>
    api.get('/reports/templates'),
  createTemplate: (body) =>
    api.post('/reports/templates', body),
  getTemplate: (id) =>
    api.get(`/reports/templates/${id}`),
  updateTemplate: (id, body) =>
    api.put(`/reports/templates/${id}`, body),
  deleteTemplate: (id) =>
    api.delete(`/reports/templates/${id}`),

  // ── Render / Preview ─────────────────────────────────────────────────
  renderTemplate: (id, body) =>
    api.post(`/reports/templates/${id}/render`, body),
  previewTemplate: (body) =>
    api.post('/reports/templates/preview', body),

  // ── Schedule ─────────────────────────────────────────────────────────
  scheduleTemplate: (id, body) =>
    api.put(`/reports/templates/${id}/schedule`, body),

  // ── Export (blob download) ────────────────────────────────────────────
  exportTemplate: (id, params) =>
    api.get(`/reports/templates/${id}/export`, { params, responseType: 'blob' }),
}

export default reportService
