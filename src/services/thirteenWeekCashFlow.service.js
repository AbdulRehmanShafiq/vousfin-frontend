// src/services/thirteenWeekCashFlow.service.js — Phase 8 FR-06.3
import api from './api'

const thirteenWeekService = {
  getForecast: (floor = 0) => api.get('/cash-flow/thirteen-week', { params: { floor } }),
  getAlerts:   (floor = 0) => api.get('/cash-flow/thirteen-week/alerts', { params: { floor } }),
}

export default thirteenWeekService
