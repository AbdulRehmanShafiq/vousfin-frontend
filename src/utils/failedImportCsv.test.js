import { describe, it, expect } from 'vitest'
import { buildFailedImportCsv } from './failedImportCsv'

// A resolved preview row carries the full importable data; `originalRow` is the
// source file's row number, which is what the failed entries reference.
const row = (originalRow, over = {}) => ({
  originalRow,
  transactionDate: '2026-06-01',
  description: 'Office rent',
  amount: 25000,
  debitAccountName: 'Rent Expense',
  creditAccountName: 'Cash',
  transactionType: 'Cash Purchase',
  customerName: null,
  vendorName: 'ABC Properties',
  transactionReference: 'INV-1',
  notes: 'monthly',
  ...over,
})

describe('buildFailedImportCsv', () => {
  it('joins each failed entry to its full source row and appends the error reason', () => {
    const rows = [row(2), row(3, { description: 'Fuel', amount: 500 })]
    const failed = [{ row: 3, error: 'Debit account not found: "Fule"' }]

    const csv = buildFailedImportCsv(failed, rows)
    const lines = csv.trim().split('\n')

    expect(lines[0]).toBe(
      'Row,Date,Description,Amount,Debit Account,Credit Account,Type,Customer,Vendor,Reference,Notes,Error'
    )
    expect(lines).toHaveLength(2) // header + the one failed row
    expect(lines[1]).toContain('Fuel')
    expect(lines[1]).toContain('500')
    expect(lines[1]).toContain('Debit account not found')
  })

  it('escapes commas, quotes and newlines so the CSV stays valid', () => {
    const rows = [row(2, { description: 'Rent, June', notes: 'she said "ok"' })]
    const failed = [{ row: 2, error: 'line1\nline2' }]

    const csv = buildFailedImportCsv(failed, rows)
    const dataLine = csv.trim().split('\n').slice(1).join('\n')

    expect(dataLine).toContain('"Rent, June"')
    expect(dataLine).toContain('"she said ""ok"""')
    expect(dataLine).toContain('"line1\nline2"')
  })

  it('still emits a row (with the error) when no source row matches', () => {
    const csv = buildFailedImportCsv([{ index: 0, error: 'Could not resolve account IDs' }], [])
    const lines = csv.trim().split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[1]).toContain('Could not resolve account IDs')
  })

  it('returns just the header when there are no failures', () => {
    const csv = buildFailedImportCsv([], [row(2)])
    expect(csv.trim().split('\n')).toHaveLength(1)
  })
})
