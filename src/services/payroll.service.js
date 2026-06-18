// src/services/payroll.service.js — SRS FR-08 (Payroll)
import api from './api'

const payrollService = {
  // Employees
  listEmployees: ()          => api.get('/payroll/employees'),
  createEmployee: (data)     => api.post('/payroll/employees', data),
  updateEmployee: (id, data) => api.patch(`/payroll/employees/${id}`, data),

  // Runs
  listRuns:   ()             => api.get('/payroll/runs'),
  getRun:     (id)           => api.get(`/payroll/runs/${id}`),
  processRun: (data)         => api.post('/payroll/runs', data),
  postRun:    (id)           => api.post(`/payroll/runs/${id}/post`),
  payRun:     (id, bankAccountId) => api.post(`/payroll/runs/${id}/pay`, { bankAccountId }),
  reverseRun: (id)           => api.post(`/payroll/runs/${id}/reverse`),

  // Downloads (blobs)
  bankFile:   (id)                 => api.get(`/payroll/runs/${id}/bank-file`, { responseType: 'blob' }),
  payslip:    (id, employeeId)     => api.get(`/payroll/runs/${id}/payslips`, { params: { employeeId }, responseType: 'blob' }),
  certificatePdf: (employeeId, taxYear) => api.get(`/payroll/certificates/${employeeId}/${taxYear}/pdf`, { responseType: 'blob' }),
}

export default payrollService
