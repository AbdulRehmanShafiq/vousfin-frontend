// Builds a CSV of the rows that could NOT be recorded during a bulk import,
// joined back to their full source data plus the reason each one failed.
//
// The user opens this file, fixes the flagged rows, and re-imports — nothing is
// silently lost. Columns mirror the import template so the file is re-uploadable
// as-is once corrected.

const COLUMNS = [
  'Row', 'Date', 'Description', 'Amount',
  'Debit Account', 'Credit Account', 'Type',
  'Customer', 'Vendor', 'Reference', 'Notes', 'Error',
]

// RFC-4180 escaping: wrap in quotes if the value has a comma, quote or newline,
// and double any embedded quotes.
function escapeCsv(value) {
  const s = value == null ? '' : String(value)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function fmtDate(raw) {
  if (!raw) return ''
  const s = typeof raw === 'string' ? raw : new Date(raw).toISOString()
  return s.split('T')[0]
}

/**
 * @param {Array<{row?: number, index?: number, error?: string}>} failed  failed entries from the import result
 * @param {Array<object>} rows  the full resolved preview rows (carry originalRow + all fields)
 * @returns {string} CSV text (header + one line per failed entry)
 */
export function buildFailedImportCsv(failed = [], rows = []) {
  const byRowNumber = new Map()
  for (const r of rows) {
    if (r && r.originalRow != null) byRowNumber.set(r.originalRow, r)
  }

  const lines = [COLUMNS.join(',')]

  for (const f of failed) {
    const src = f.row != null ? byRowNumber.get(f.row) : undefined
    const cells = [
      f.row != null ? f.row : (f.index != null ? f.index + 1 : ''),
      fmtDate(src?.transactionDate),
      src?.description ?? '',
      src?.amount ?? '',
      src?.debitAccountName ?? '',
      src?.creditAccountName ?? '',
      src?.transactionType ?? '',
      src?.customerName ?? '',
      src?.vendorName ?? '',
      src?.transactionReference ?? '',
      src?.notes ?? '',
      f.error ?? 'Unknown error',
    ]
    lines.push(cells.map(escapeCsv).join(','))
  }

  return lines.join('\n')
}
