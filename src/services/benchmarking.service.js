// src/services/benchmarking.service.js — Phase 8 FR-09.3
import api from './api'

const benchmarkingService = {
  getBenchmark: () => api.get('/benchmarking'),
}

export default benchmarkingService
