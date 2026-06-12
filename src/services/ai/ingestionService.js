/**
 * Ingestion Gateway API client — connects to ingestion-gateway (port 8001).
 *
 * This is the "front door" of the Autonomous Transaction Engine. Anything sent
 * here flows: dedup → raw store → AI classifier → auto-post or review queue.
 */
import aiClient from './aiClient'

const BASE = import.meta.env.VITE_INGESTION_URL ?? 'http://localhost:8001'

const ingestionApi = {
  /** Upload a CSV / Excel bank statement. Returns { import_job_id, total_rows, valid_rows, ... }. */
  importCsv: (file) => {
    const form = new FormData()
    form.append('file', file)
    return aiClient.post(`${BASE}/v1/import/csv`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120_000,
    })
  },

  /** Poll an import job for progress + per-row report. */
  importStatus: (jobId) => aiClient.get(`${BASE}/v1/import/${jobId}/status`),

  /** Ingest a single transaction typed by the user. */
  ingestManual: (payload) =>
    aiClient.post(`${BASE}/v1/ingest`, {
      channel:       'manual',
      source_ref:    `manual:${Date.now()}`,
      currency:      'PKR',
      ...payload,
    }),
}

export default ingestionApi
