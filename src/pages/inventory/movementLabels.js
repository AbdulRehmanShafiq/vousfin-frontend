/**
 * Plain-language names for stock movements.
 *
 * The backend's movement types are internal enums (`write_off`, `adjustment_in`).
 * Owners must never see those — this is the one place that turns them into
 * words a shopkeeper would use. Add a label here whenever a movement type is
 * added to StockMovement.model.js, or the raw enum leaks into the UI.
 */

export const MOVEMENT_LABELS = {
  opening:          'Opening balance',
  purchase:         'Bought',
  sale:             'Sold',
  sale_return:      'Customer returned',
  purchase_return:  'Sent back to supplier',
  receipt_reversal: 'Delivery undone',
  sale_reversal:    'Sale undone',
  adjustment_in:    'Added by hand',
  adjustment_out:   'Removed by hand',
  write_off:        'Written off',
  count:            'Stock count',
  revalue:          'Value changed',
  landed_cost:      'Shipping costs added',
  transfer_in:      'Moved in',
  transfer_out:     'Moved out',
  assembly_in:      'Built',
  assembly_out:     'Used to build',
}

/** Never render a raw enum: unknown types degrade to readable words. */
export function movementLabel(type) {
  if (!type) return '—'
  return MOVEMENT_LABELS[type] || String(type).replace(/_/g, ' ')
}

/**
 * What the row should say when the movement carries no note of its own.
 * Mirrors the label so the Description column is never blank or cryptic.
 */
export function movementDescription(line) {
  if (line?.description) return line.description
  return movementLabel(line?.type)
}

/** Reason codes (adjustments) → words. */
export const REASON_LABELS = {
  damaged: 'Damaged',
  expired: 'Expired',
  lost: 'Lost',
  theft: 'Stolen',
  found: 'Found in count',
  count_correction: 'Count correction',
  nrv_write_down: 'Worth less than cost',
  nrv_reversal: 'Write-down reversed',
  cost_correction: 'Cost correction',
  other: 'Other',
}

export const reasonLabel = (r) => (r ? (REASON_LABELS[r] || String(r).replace(/_/g, ' ')) : null)
