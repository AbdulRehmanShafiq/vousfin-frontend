// src/services/inventory.service.js
import api from './api';

const inventoryService = {
  createItem:          (data)            => api.post('/inventory', data),
  listItems:           (params)          => api.get('/inventory', { params }),
  getItemById:         (id)              => api.get(`/inventory/${id}`),
  updateItem:          (id, data)        => api.put(`/inventory/${id}`, data),
  toggleActive:        (id)              => api.patch(`/inventory/${id}/toggle-active`),
  getLowStockAlerts:   ()               => api.get('/inventory/low-stock'),
  getInventoryValuation: ()             => api.get('/inventory/valuation'),
  addStock:            (id, data)        => api.post(`/inventory/${id}/add-stock`, data),
  adjustStock:         (id, data)        => api.post(`/inventory/${id}/adjust`, data),
  getStockLedger:      (id)              => api.get(`/inventory/${id}/ledger`),
  getIntegrity:        ()                => api.get('/inventory/integrity'),

  // Phase 4 — landed costs
  applyLandedCost:     (data)            => api.post('/inventory/landed-cost', data),
  // Phase 5 — locations + transfers
  listWarehouses:      (params)          => api.get('/inventory/warehouses', { params }),
  createWarehouse:     (data)            => api.post('/inventory/warehouses', data),
  updateWarehouse:     (id, data)        => api.put(`/inventory/warehouses/${id}`, data),
  getStockByLocation:  (params)          => api.get('/inventory/stock-by-location', { params }),
  transferStock:       (data)            => api.post('/inventory/transfer', data),
  // Phase 6 — reservations / ATP
  getAtp:              (id)              => api.get(`/inventory/${id}/atp`),
  reserveStock:        (id, data)        => api.post(`/inventory/${id}/reserve`, data),
  releaseReservation:  (data)            => api.post('/inventory/reservations/release', data),
  getBackorders:       ()                => api.get('/inventory/backorders'),
  // Phase 7 — lots
  getLots:             (id)              => api.get(`/inventory/${id}/lots`),
  // Phase 9 — recipes + builds
  listBoms:            (params)          => api.get('/inventory/boms', { params }),
  createBom:           (data)            => api.post('/inventory/boms', data),
  quoteBuild:          (id, runs)        => api.get(`/inventory/boms/${id}/quote`, { params: { runs } }),
  build:               (id, data)        => api.post(`/inventory/boms/${id}/build`, data),
  // Phase 10 — reports
  reportValuation:     (params)          => api.get('/inventory/reports/valuation', { params }),
  reportTurnover:      (params)          => api.get('/inventory/reports/turnover', { params }),
  reportAging:         ()                => api.get('/inventory/reports/aging'),
  reportMargin:        (params)          => api.get('/inventory/reports/margin', { params }),
  reportSlowMovers:    (params)          => api.get('/inventory/reports/slow-movers', { params }),
  reportExpiring:      (params)          => api.get('/inventory/reports/expiring', { params }),
};

export default inventoryService;
