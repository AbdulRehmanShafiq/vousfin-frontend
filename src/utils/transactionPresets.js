/**
 * Transaction Presets — preconfigured debit/credit account-type pairs for
 * common accounting scenarios.
 *
 * Each preset narrows the debit/credit dropdowns to the relevant account
 * categories so the user can't accidentally pick a nonsensical combination
 * (e.g. crediting an Expense to record a sale).
 *
 *   debitFilter / creditFilter:
 *     - { types:    [...] }       → match by accountType
 *     - { subtypes: [...] }       → match by accountSubtype
 *     - { names:    [...] }       → exact-match accountName (case-insensitive)
 *     - omitted                    → no narrowing on that side
 *
 *   transactionType is the suggested backend type label.
 */

export const TRANSACTION_PRESETS = [
  // ── Sales & Revenue ──────────────────────────────────────────────────────────
  {
    id: 'cash-sale',
    label: 'Cash Sale',
    group: 'Sales & Revenue',
    description: 'Customer pays at the time of sale — cash/bank increases immediately.',
    transactionType: 'Cash Sale',
    debitFilter:  { subtypes: ['Bank and Cash'] },
    creditFilter: { types: ['Revenue'] },
  },
  {
    id: 'credit-sale',
    label: 'Credit Sale (Invoice)',
    group: 'Sales & Revenue',
    description: 'Invoice customer to be paid later — creates Accounts Receivable.',
    transactionType: 'Credit Sale',
    debitFilter:  { names: ['Accounts Receivable'] },
    creditFilter: { types: ['Revenue'] },
  },
  {
    id: 'receive-payment',
    label: 'Receive Customer Payment',
    group: 'Sales & Revenue',
    description: 'Customer settles an outstanding invoice — A/R decreases.',
    transactionType: 'Payment Received',
    debitFilter:  { subtypes: ['Bank and Cash'] },
    creditFilter: { names: ['Accounts Receivable'] },
  },
  {
    id: 'customer-refund',
    label: 'Customer Refund',
    group: 'Sales & Revenue',
    description: 'Return money to a customer (e.g., returned goods, overpayment).',
    transactionType: 'Refund',
    debitFilter:  { types: ['Revenue'] },
    creditFilter: { subtypes: ['Bank and Cash'] },
  },
  {
    id: 'advance-from-customer',
    label: 'Advance from Customer',
    group: 'Sales & Revenue',
    description: 'Receive payment before delivering — creates Unearned Revenue liability.',
    transactionType: 'Advance from Customer',
    debitFilter:  { subtypes: ['Bank and Cash'] },
    creditFilter: { names: ['Unearned Revenue'] },
  },
  {
    id: 'gst-collect',
    label: 'GST Collected on Sale',
    group: 'Sales & Revenue',
    description: 'Record GST/sales tax collected; bank up, GST Payable up.',
    transactionType: 'GST Collection',
    debitFilter:  { subtypes: ['Bank and Cash'] },
    creditFilter: { names: ['GST Payable', 'Tax Payable'] },
  },

  // ── Purchases & Expenses ─────────────────────────────────────────────────────
  {
    id: 'cash-expense',
    label: 'Cash Expense',
    group: 'Purchases & Expenses',
    description: 'Pay an expense immediately from bank or cash.',
    transactionType: 'Cash Purchase',
    debitFilter:  { types: ['Expense'] },
    creditFilter: { subtypes: ['Bank and Cash'] },
  },
  {
    id: 'credit-purchase',
    label: 'Credit Purchase (Bill)',
    group: 'Purchases & Expenses',
    description: 'Buy on credit — vendor to be paid later, creates Accounts Payable.',
    transactionType: 'Credit Purchase',
    debitFilter:  { types: ['Expense', 'Asset'] },
    creditFilter: { names: ['Accounts Payable'] },
  },
  {
    id: 'pay-vendor',
    label: 'Pay Vendor (Settle Bill)',
    group: 'Purchases & Expenses',
    description: 'Settle an outstanding vendor bill — A/P decreases.',
    transactionType: 'Payment Made',
    debitFilter:  { names: ['Accounts Payable'] },
    creditFilter: { subtypes: ['Bank and Cash'] },
  },
  {
    id: 'inventory-purchase',
    label: 'Inventory Purchase',
    group: 'Purchases & Expenses',
    description: 'Buy goods for resale — increases inventory asset.',
    transactionType: 'Inventory Purchase',
    debitFilter:  { names: ['Inventory'] },
    creditFilter: { subtypes: ['Bank and Cash', 'Current Liabilities'] },
  },
  {
    id: 'prepaid-expense',
    label: 'Prepaid Expense',
    group: 'Purchases & Expenses',
    description: 'Pay in advance for insurance, software, or rent — asset until consumed.',
    transactionType: 'Prepaid Expense',
    debitFilter:  { names: ['Prepaid Expenses'] },
    creditFilter: { subtypes: ['Bank and Cash'] },
  },
  {
    id: 'interest-expense',
    label: 'Interest Expense',
    group: 'Purchases & Expenses',
    description: 'Pay or accrue interest on a loan or credit facility.',
    transactionType: 'Interest Payment',
    debitFilter:  { names: ['Interest Expense'] },
    creditFilter: { subtypes: ['Bank and Cash', 'Current Liabilities'] },
  },

  // ── Payroll & Taxes ──────────────────────────────────────────────────────────
  {
    id: 'payroll',
    label: 'Salary / Payroll',
    group: 'Payroll & Taxes',
    description: 'Disburse net wages to employees from bank.',
    transactionType: 'Salary',
    debitFilter:  { names: ['Wages and Salaries', 'Salaries Expense', 'Wages Payable'] },
    creditFilter: { subtypes: ['Bank and Cash', 'Current Liabilities'] },
  },
  {
    id: 'gst-pay',
    label: 'GST Payment to Authority',
    group: 'Payroll & Taxes',
    description: 'Remit collected GST to FBR / SRB — GST Payable decreases.',
    transactionType: 'GST Payment',
    debitFilter:  { names: ['GST Payable', 'Tax Payable'] },
    creditFilter: { subtypes: ['Bank and Cash'] },
  },
  {
    id: 'wht-payment',
    label: 'WHT Payment',
    group: 'Payroll & Taxes',
    description: 'Remit withheld income tax to FBR / SRB.',
    transactionType: 'WHT Payment',
    debitFilter:  { names: ['WHT Payable', 'PAYG Withholding Payable'] },
    creditFilter: { subtypes: ['Bank and Cash'] },
  },

  // ── Assets & Capital ─────────────────────────────────────────────────────────
  {
    id: 'asset-purchase',
    label: 'Asset Purchase (Cash)',
    group: 'Assets & Capital',
    description: 'Buy equipment, furniture, or vehicle paid immediately.',
    transactionType: 'Asset Purchase',
    debitFilter:  { subtypes: ['Non-current Assets'] },
    creditFilter: { subtypes: ['Bank and Cash'] },
  },
  {
    id: 'financed-asset-purchase',
    label: 'Financed Asset Purchase (EMI)',
    group: 'Assets & Capital',
    description: 'Buy on installment — asset increases, loan liability increases (no cash moves now).',
    transactionType: 'Asset Purchase',
    debitFilter:  { subtypes: ['Non-current Assets'] },
    creditFilter: { subtypes: ['Non-current Liabilities', 'Current Liabilities'] },
  },
  {
    id: 'depreciation-entry',
    label: 'Depreciation Entry',
    group: 'Assets & Capital',
    description: 'Non-cash period-end: reduce asset value, record expense.',
    transactionType: 'Depreciation',
    debitFilter:  { names: ['Depreciation Expense'] },
    creditFilter: { names: ['Accumulated Depreciation'] },
  },
  {
    id: 'owner-investment',
    label: 'Owner Investment / Capital Injection',
    group: 'Assets & Capital',
    description: 'Owner contributes cash or assets into the business.',
    transactionType: 'Owner Investment',
    debitFilter:  { subtypes: ['Bank and Cash'] },
    creditFilter: { types: ['Equity'] },
  },
  {
    id: 'owner-drawing',
    label: 'Owner Drawing / Distribution',
    group: 'Assets & Capital',
    description: 'Owner withdraws funds from the business.',
    transactionType: 'Owner Withdrawal',
    debitFilter:  { types: ['Equity'] },
    creditFilter: { subtypes: ['Bank and Cash'] },
  },

  // ── Financing ────────────────────────────────────────────────────────────────
  {
    id: 'loan-received',
    label: 'Loan Received',
    group: 'Financing',
    description: 'Receive loan proceeds — cash increases, loan liability increases.',
    transactionType: 'Loan Disbursement',
    debitFilter:  { subtypes: ['Bank and Cash'] },
    creditFilter: { subtypes: ['Current Liabilities', 'Non-current Liabilities'] },
  },
  {
    id: 'loan-repayment',
    label: 'Loan Repayment',
    group: 'Financing',
    description: 'Pay down loan principal — liability decreases.',
    transactionType: 'Loan Repayment',
    debitFilter:  { subtypes: ['Current Liabilities', 'Non-current Liabilities'] },
    creditFilter: { subtypes: ['Bank and Cash'] },
  },

  // ── Bank & Transfers ─────────────────────────────────────────────────────────
  {
    id: 'bank-to-cash',
    label: 'Bank to Cash (Withdrawal)',
    group: 'Bank & Transfers',
    description: 'Withdraw cash from bank account to petty cash.',
    transactionType: 'Bank Transfer',
    debitFilter:  { names: ['Cash on Hand'] },
    creditFilter: { names: ['Cash at Bank'] },
  },
  {
    id: 'cash-to-bank',
    label: 'Cash Deposit to Bank',
    group: 'Bank & Transfers',
    description: 'Deposit petty cash or receipts into the bank account.',
    transactionType: 'Bank Transfer',
    debitFilter:  { names: ['Cash at Bank'] },
    creditFilter: { names: ['Cash on Hand'] },
  },

  // ── Adjustments ──────────────────────────────────────────────────────────────
  {
    id: 'journal-entry',
    label: 'Manual Journal Entry',
    group: 'Adjustments',
    description: 'Free-form adjusting entry for corrections or period-end accruals.',
    transactionType: 'Journal Entry',
    // No filter — accountant picks any debit/credit combination
  },
]

/**
 * Apply a filter spec to an account option (as produced by toAccountOption).
 * Returns true if the option matches.
 */
export function matchesFilter(opt, filter) {
  if (!filter) return true
  if (filter.types && !filter.types.includes(opt.accountType))   return false
  if (filter.subtypes && !filter.subtypes.includes(opt.accountSubtype)) return false
  if (filter.names) {
    const lower = (opt.accountName || '').toLowerCase()
    if (!filter.names.some((n) => n.toLowerCase() === lower)) return false
  }
  return true
}

export function getPresetById(id) {
  return TRANSACTION_PRESETS.find((p) => p.id === id) || null
}
