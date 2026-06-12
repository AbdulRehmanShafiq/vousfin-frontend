/**
 * Classifier Service API client — connects to classifier-service on port 8003.
 */
import aiClient from './aiClient'

const BASE = import.meta.env.VITE_CLASSIFIER_URL ?? 'http://localhost:8003'

const classifierApi = {
  getDrafts:  (params = {}) => aiClient.get(`${BASE}/v1/queue/drafts`,   { params }),
  getFlagged: (params = {}) => aiClient.get(`${BASE}/v1/queue/flagged`,  { params }),
  /** Atomically claim a draft for posting (idempotency). 409 if already claimed. */
  claim:         (draftId)            => aiClient.post(`${BASE}/v1/claim/${draftId}`),
  /** Release a claimed draft back to pending if posting failed. */
  release:       (draftId)            => aiClient.post(`${BASE}/v1/release/${draftId}`),
  /** Mark a draft resolved after the real journal entry was posted by the backend. */
  markConfirmed: (draftId, body = {}) => aiClient.post(`${BASE}/v1/confirm/${draftId}`, body),
  dismiss:       (draftId)            => aiClient.post(`${BASE}/v1/dismiss/${draftId}`),
  /** Ledger self-audit: Σdebits=Σcredits + orphan check. */
  integrity:     ()                   => aiClient.get(`${BASE}/v1/integrity/balance`),
  getAccuracy:   ()                   => aiClient.get(`${BASE}/v1/health/accuracy`),
  /** Local (no-Gemini) natural-language parse → resolved transaction. */
  nlParse:       (text)              => aiClient.post(`${BASE}/v1/nl-parse`, { text }),
  /** AutoPostFeed — most recent zero-touch postings. */
  getAutoPosted: (params = {})        => aiClient.get(`${BASE}/v1/queue/auto-posted`, { params }),
  /** Dispute an auto-post AFTER reversing the JE via the backend (one click in UI). */
  dispute:       (draftId, body = {}) => aiClient.post(`${BASE}/v1/dispute/${draftId}`, body),
  /** Manually trigger model retraining (the weekly scheduler does this automatically). */
  retrain:       ()                   => aiClient.post(`${BASE}/v1/retrain`),
}

export default classifierApi
