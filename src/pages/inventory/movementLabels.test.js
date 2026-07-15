/**
 * Drift guard: every movement type the backend can emit must have a
 * plain-language label here.
 *
 * This exists because the raw enums (`write_off`, `adjustment_in`) shipped
 * straight into the stock history UI — the label map silently fell behind the
 * backend's list when new movement types were added. If this test fails, add
 * the label; do NOT let the enum reach the screen.
 */
import { describe, it, expect } from 'vitest'
import { MOVEMENT_LABELS, movementLabel, movementDescription, reasonLabel } from './movementLabels'

// Mirrors MOVEMENT_TYPES in vousfin-backend-main/models/StockMovement.model.js
const BACKEND_MOVEMENT_TYPES = [
  'opening', 'purchase', 'sale', 'sale_return', 'purchase_return',
  'receipt_reversal', 'sale_reversal', 'adjustment_in', 'adjustment_out',
  'write_off', 'count', 'revalue', 'landed_cost',
  'transfer_in', 'transfer_out', 'assembly_in', 'assembly_out',
]

// Mirrors REASON_CODES in vousfin-backend-main/services/inventoryAdjustment.service.js
const BACKEND_REASON_CODES = [
  'damaged', 'expired', 'lost', 'theft', 'found', 'count_correction',
  'nrv_write_down', 'nrv_reversal', 'cost_correction', 'other',
]

describe('movement labels', () => {
  it('every backend movement type has a label', () => {
    const missing = BACKEND_MOVEMENT_TYPES.filter((t) => !MOVEMENT_LABELS[t])
    expect(missing).toEqual([])
  })

  it('no label is a raw enum leaking through', () => {
    for (const type of BACKEND_MOVEMENT_TYPES) {
      expect(MOVEMENT_LABELS[type]).not.toMatch(/_/)
      expect(MOVEMENT_LABELS[type]).not.toBe(type)
    }
  })

  it('an unknown type degrades to readable words rather than snake_case', () => {
    expect(movementLabel('some_new_type')).toBe('some new type')
    expect(movementLabel(null)).toBe('—')
  })

  it('falls back to the label when a movement carries no note', () => {
    expect(movementDescription({ type: 'write_off' })).toBe('Written off')
    expect(movementDescription({ type: 'write_off', description: 'Water damage' })).toBe('Water damage')
  })

  it('every adjustment reason code has a label', () => {
    const missing = BACKEND_REASON_CODES.filter((r) => !reasonLabel(r) || reasonLabel(r).includes('_'))
    expect(missing).toEqual([])
  })
})
