/**
 * Transaction entry — shared schema, option lists and pure mapping helpers.
 * Extracted verbatim from TransactionFormModal (Ledger phase-6 decomposition);
 * behavior-preserving, no logic changes.
 */
import { z } from 'zod'

// ─── Zod Schema ────────────────────────────────────────────────────────────────
export const formSchema = z.object({
  transactionDate:     z.string().min(1, 'Date is required'),
  description:         z.string().min(2, 'Description is required'),
  amount:              z.number().positive('Amount must be greater than 0'),
  debitAccountId:      z.string().min(1, 'Debit account is required'),
  creditAccountId:     z.string().min(1, 'Credit account is required'),
  transactionType:     z.string().optional(),
  referenceNumber:     z.string().optional(),
  invoiceNumber:       z.string().optional(),
  notes:               z.string().optional(),
  dueDate:             z.string().optional(),
  paymentMethod:       z.string().optional(),
  txnCurrency:         z.string().optional(),
  exchangeRate:        z.preprocess(
    (v) => (typeof v === 'number' && isNaN(v)) ? undefined : v,
    z.number().min(0).optional()
  ),
  taxAmount:           z.preprocess(
    (v) => (typeof v === 'number' && isNaN(v)) ? undefined : v,
    z.number().min(0).optional()
  ),
  taxRate:             z.preprocess(
    (v) => (typeof v === 'number' && isNaN(v)) ? undefined : v,
    z.number().min(0).max(100).optional()
  ),
  customerName:        z.string().optional(),
  vendorName:          z.string().optional(),
  isInstallment:       z.boolean().optional(),
  // valueAsNumber returns NaN for empty inputs → preprocess to safe defaults
  downPayment:         z.preprocess(
    (v) => (typeof v === 'number' && isNaN(v)) ? 0 : v,
    z.number().min(0).optional()
  ),
  installmentCount:    z.preprocess(
    (v) => (typeof v === 'number' && isNaN(v)) ? undefined : v,
    z.number().min(1).optional()
  ),
  installmentFrequency:z.string().optional(),
  interestRate:        z.preprocess(
    (v) => (typeof v === 'number' && isNaN(v)) ? 0 : v,
    z.number().min(0).max(100).optional()
  ),
  firstPaymentDate:    z.string().optional(),
  interestMethod:      z.enum(['reducing_balance', 'flat']).optional(),
}).refine((d) => d.debitAccountId !== d.creditAccountId, {
  message: 'Debit and Credit accounts must be different',
  path: ['creditAccountId'],
})

// ─── GAAP term → plain English map (shown in pre-save warning panel) ─────────
export const GAAP_PLAIN_ENGLISH = {
  'MATCHING_PRINCIPLE': 'Revenue & costs must land in the same period',
  'ACCRUAL_BASIS':      'Record when earned/owed, not when cash changes hands',
  'IAS 21':             'foreign currency accounting rule',
  'IFRS 9':             'financial asset impairment / write-off rule',
  'GAAP':               'Generally Accepted Accounting Principles',
  'IFRS':               'International Financial Reporting Standards',
}

export function applyGAAPGloss(text) {
  let t = text
  Object.entries(GAAP_PLAIN_ENGLISH).forEach(([term, plain]) => {
    // Only replace the FIRST occurrence so the brackets don't repeat mid-sentence
    t = t.replace(new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`), `${term} (${plain})`)
  })
  return t
}

// ─── Invoice / Bill number auto-generator ─────────────────────────────────────
export const SALE_TYPES_FOR_INV  = ['Cash Sale','Credit Sale','Inventory Sale','Payment Received','Advance from Customer','GST Collection']
export const BILL_TYPES_FOR_BILL = ['Cash Purchase','Credit Purchase','Inventory Purchase','Payment Made','Prepaid Expense']

export function generateDocNumber(txType) {
  const d = new Date()
  const yyyymm = d.getFullYear().toString() + String(d.getMonth() + 1).padStart(2, '0')
  const rand   = String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0')
  if (SALE_TYPES_FOR_INV.includes(txType))  return `INV-${yyyymm}-${rand}`
  if (BILL_TYPES_FOR_BILL.includes(txType)) return `BILL-${yyyymm}-${rand}`
  return null
}

// ─── Transaction Type options ─────────────────────────────────────────────────
export const TX_TYPE_OPTIONS = [
  { value: '', label: '— Auto-detect from accounts —' },
  // ── Sales & Revenue ──────────────────────────────────────────────────────────
  { value: 'Cash Sale',             label: 'Cash Sale',                         group: 'Sales & Revenue' },
  { value: 'Credit Sale',           label: 'Credit Sale (A/R Invoice)',         group: 'Sales & Revenue' },
  { value: 'Inventory Sale',        label: 'Inventory Sale',                    group: 'Sales & Revenue' },
  { value: 'Payment Received',      label: 'Payment Received from Customer',    group: 'Sales & Revenue' },
  { value: 'GST Collection',        label: 'GST / VAT Collected on Sale',       group: 'Sales & Revenue' },
  { value: 'Advance from Customer', label: 'Advance from Customer (Deposit)',   group: 'Sales & Revenue' },
  { value: 'Refund',                label: 'Customer Refund',                   group: 'Sales & Revenue' },
  { value: 'Income',                label: 'Other Income / Revenue',            group: 'Sales & Revenue' },
  // ── Purchases & Expenses ─────────────────────────────────────────────────────
  { value: 'Cash Purchase',         label: 'Cash Purchase / Expense',           group: 'Purchases & Expenses' },
  { value: 'Credit Purchase',       label: 'Credit Purchase (A/P Bill)',        group: 'Purchases & Expenses' },
  { value: 'Inventory Purchase',    label: 'Inventory / Stock Purchase',        group: 'Purchases & Expenses' },
  { value: 'Payment Made',          label: 'Payment Made to Vendor',            group: 'Purchases & Expenses' },
  { value: 'Prepaid Expense',       label: 'Prepaid Expense (paid in advance)', group: 'Purchases & Expenses' },
  { value: 'Interest Payment',      label: 'Interest / Finance Charge',         group: 'Purchases & Expenses' },
  { value: 'Expense',               label: 'General Expense',                   group: 'Purchases & Expenses' },
  // ── Payroll & Taxes ──────────────────────────────────────────────────────────
  { value: 'Salary',                label: 'Salary / Payroll Payment',          group: 'Payroll & Taxes' },
  { value: 'GST Payment',           label: 'GST / VAT Remitted to Authority',   group: 'Payroll & Taxes' },
  { value: 'WHT Payment',           label: 'Withholding Tax (WHT) Payment',     group: 'Payroll & Taxes' },
  // ── Assets & Depreciation ────────────────────────────────────────────────────
  { value: 'Asset Purchase',        label: 'Asset Purchase (fixed/tangible)',   group: 'Assets & Capital' },
  { value: 'Depreciation',          label: 'Depreciation Entry (non-cash)',     group: 'Assets & Capital' },
  { value: 'Owner Investment',      label: 'Owner Investment / Capital Intro',  group: 'Assets & Capital' },
  { value: 'Owner Withdrawal',      label: 'Owner Withdrawal / Drawing',        group: 'Assets & Capital' },
  // ── Financing ────────────────────────────────────────────────────────────────
  { value: 'Loan Disbursement',     label: 'Loan Received',                     group: 'Financing' },
  { value: 'Loan Repayment',        label: 'Loan Repayment (principal)',        group: 'Financing' },
  { value: 'Installment Payment',   label: 'Installment / EMI Payment',        group: 'Financing' },
  // ── Adjustments & Transfers ──────────────────────────────────────────────────
  { value: 'Bank Transfer',         label: 'Bank / Cash Transfer',              group: 'Adjustments & Transfers' },
  { value: 'Transfer',              label: 'Internal Transfer',                 group: 'Adjustments & Transfers' },
  { value: 'Journal Entry',         label: 'Manual Journal Entry (advanced)',   group: 'Adjustments & Transfers' },
  { value: 'Adjusting Entry',       label: 'Adjusting Entry (accrual/deferral)',group: 'Adjustments & Transfers' },
  { value: 'Opening Balance',       label: 'Opening Balance Entry',             group: 'Adjustments & Transfers' },
]

/**
 * Robustly extracts a string ObjectId from a value that may be:
 *  - already a plain string  ("64abc...")
 *  - a Mongoose ObjectId     (ObjectId("64abc..."))
 *  - a populated sub-doc     ({ _id: ObjectId("64abc..."), accountName: "..." })
 *  - null / undefined
 */
export function extractId(val) {
  if (!val) return ''
  if (typeof val === 'string') return val
  // Mongoose ObjectId or populated sub-doc
  const raw = val._id ?? val.id ?? val
  return raw ? String(raw) : ''
}

/**
 * Maps a stored transaction document to the shape StructuredFormTab expects
 * as initialValues.  Only the fields the update endpoint accepts are included.
 */
export function txToInitialValues(tx, currency) {
  return {
    transactionDate:     tx.transactionDate ? new Date(tx.transactionDate).toISOString().slice(0, 10) : '',
    description:         tx.description     || '',
    amount:              typeof tx.amount === 'number' ? tx.amount : 0,
    debitAccountId:      extractId(tx.debitAccountId),
    creditAccountId:     extractId(tx.creditAccountId),
    transactionType:     tx.transactionType  || '',
    invoiceNumber:       tx.invoiceNumber    || '',
    notes:               tx.notes            || '',
    dueDate:             tx.dueDate ? new Date(tx.dueDate).toISOString().slice(0, 10) : '',
    paymentMethod:       tx.paymentMethod    || '',
    txnCurrency:         tx.currencyCode     || currency,
    exchangeRate:        tx.exchangeRate     || 1,
    taxAmount:           tx.taxAmount        || 0,
    taxRate:             tx.taxRate          || 0,
    customerName:        tx.customerName     || tx.customerId?.fullName || tx.customerId?.businessName || '',
    vendorName:          tx.vendorName       || tx.vendorId?.vendorName || '',
    referenceNumber:     tx.transactionReference || '',
    // never pre-fill installment fields in edit mode
    isInstallment:       false,
  }
}
