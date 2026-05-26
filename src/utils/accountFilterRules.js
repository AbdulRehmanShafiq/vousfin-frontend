/**
 * Transaction-type-aware account filtering rules.
 *
 * When a user picks a transactionType (or NL parser sets one) but no preset
 * is active, we still want to suggest the right accounts. This map provides
 * the SAME filter contract as transactionPresets — { types, subtypes, names }
 * — so the suggestion logic is symmetric.
 *
 * GAAP rules baked in:
 *   - Debit increases:  Assets, Expenses
 *   - Credit increases: Liabilities, Equity, Revenue
 *   - DEBIT side typical: Asset accounts, Expense accounts, A/R, Inventory, Prepaid
 *   - CREDIT side typical: Liability accounts, Revenue accounts, A/P, Equity, Tax Payable
 */

/**
 * Map a transactionType (Title Case API value) to the suggested account
 * filters for debit and credit dropdowns.
 */
export const TX_TYPE_FILTERS = Object.freeze({
  // ── Sales & Revenue ──────────────────────────────────────────────────────────
  'Cash Sale':             { debitFilter: { subtypes: ['Bank and Cash'] },                          creditFilter: { types: ['Revenue'] } },
  'Credit Sale':           { debitFilter: { subtypes: ['Accounts Receivable', 'Current Assets'] },  creditFilter: { types: ['Revenue'] } },
  'Inventory Sale':        { debitFilter: { subtypes: ['Bank and Cash'] },                          creditFilter: { types: ['Revenue'] } },
  'Payment Received':      { debitFilter: { subtypes: ['Bank and Cash'] },                          creditFilter: { subtypes: ['Accounts Receivable', 'Current Assets'] } },
  'GST Collection':        { debitFilter: { subtypes: ['Bank and Cash'] },                          creditFilter: { types: ['Revenue', 'Liability'] } },
  'Advance from Customer': { debitFilter: { subtypes: ['Bank and Cash'] },                          creditFilter: { subtypes: ['Current Liabilities'], names: ['Unearned Revenue'] } },
  'Refund':                { debitFilter: { types: ['Revenue'] },                                   creditFilter: { subtypes: ['Bank and Cash'] } },

  // ── Purchases & Expenses ─────────────────────────────────────────────────────
  'Cash Purchase':         { debitFilter: { types: ['Expense'] },                                   creditFilter: { subtypes: ['Bank and Cash'] } },
  'Credit Purchase':       { debitFilter: { types: ['Expense'] },                                   creditFilter: { subtypes: ['Accounts Payable', 'Current Liabilities'] } },
  'Inventory Purchase':    { debitFilter: { names: ['Inventory'], subtypes: ['Current Assets'] },   creditFilter: { subtypes: ['Bank and Cash', 'Accounts Payable', 'Current Liabilities'] } },
  'Payment Made':          { debitFilter: { subtypes: ['Accounts Payable', 'Current Liabilities'] },creditFilter: { subtypes: ['Bank and Cash'] } },
  'Prepaid Expense':       { debitFilter: { names: ['Prepaid Expenses'] },                          creditFilter: { subtypes: ['Bank and Cash'] } },
  'Interest Payment':      { debitFilter: { names: ['Interest Expense'] },                          creditFilter: { subtypes: ['Bank and Cash'] } },

  // ── Payroll & Taxes ──────────────────────────────────────────────────────────
  'Salary':                { debitFilter: { names: ['Wages and Salaries'] },                        creditFilter: { subtypes: ['Bank and Cash', 'Current Liabilities'] } },
  'GST Payment':           { debitFilter: { names: ['GST Payable'] },                               creditFilter: { subtypes: ['Bank and Cash'] } },
  'WHT Payment':           { debitFilter: { names: ['WHT Payable'] },                               creditFilter: { subtypes: ['Bank and Cash'] } },

  // ── Assets & Capital ─────────────────────────────────────────────────────────
  'Asset Purchase':        { debitFilter: { subtypes: ['Non-current Assets', 'Current Assets'] },   creditFilter: { subtypes: ['Bank and Cash', 'Non-current Liabilities', 'Current Liabilities'] } },
  'Depreciation':          { debitFilter: { names: ['Depreciation Expense'] },                      creditFilter: { names: ['Accumulated Depreciation'] } },
  'Owner Investment':      { debitFilter: { subtypes: ['Bank and Cash'] },                          creditFilter: { types: ['Equity'] } },
  'Owner Withdrawal':      { debitFilter: { types: ['Equity'] },                                    creditFilter: { subtypes: ['Bank and Cash'] } },

  // ── Financing ───────────────────────────────────────────────────────────────
  'Loan Disbursement':     { debitFilter: { subtypes: ['Bank and Cash'] },                          creditFilter: { subtypes: ['Non-current Liabilities', 'Current Liabilities'] } },
  'Loan Repayment':        { debitFilter: { subtypes: ['Non-current Liabilities', 'Current Liabilities'] }, creditFilter: { subtypes: ['Bank and Cash'] } },
  'Installment Payment':   { debitFilter: { subtypes: ['Non-current Liabilities', 'Current Liabilities'] }, creditFilter: { subtypes: ['Bank and Cash'] } },

  // ── Transfers & Adjustments ─────────────────────────────────────────────────
  'Bank Transfer':         { debitFilter: { subtypes: ['Bank and Cash'] },                          creditFilter: { subtypes: ['Bank and Cash'] } },
  'Transfer':              { debitFilter: { subtypes: ['Bank and Cash'] },                          creditFilter: { subtypes: ['Bank and Cash'] } },
  'Journal Entry':         {},  // free-form — no filter
  // ── Legacy (backward-compatible) ────────────────────────────────────────────
  'Income':                { debitFilter: { subtypes: ['Bank and Cash'] },                          creditFilter: { types: ['Revenue'] } },
  'Expense':               { debitFilter: { types: ['Expense'] },                                   creditFilter: { subtypes: ['Bank and Cash'] } },
});

/**
 * Look up the filter for a transactionType.
 * Returns { debitFilter, creditFilter } or empty object if none configured.
 */
export function getTxTypeFilter(transactionType) {
  if (!transactionType) return {};
  return TX_TYPE_FILTERS[transactionType] || {};
}
