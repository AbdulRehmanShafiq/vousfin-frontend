/**
 * synonyms.js — plain-language phrases mapped onto catalog entry ids.
 * The primary relevance-tuning lever. Keys are entry ids from catalog.js.
 * Phrases are stored lowercased; the matcher normalizes queries the same way.
 */
export const SYNONYMS = {
  'sales.receivables':            ['who owes me', 'money owed to me', 'debtors', 'outstanding customers'],
  'sales.ar-aging':               ['overdue customers', 'how late are payments'],
  'purchases.payables':           ['what i owe', 'money i owe', 'creditors', 'unpaid bills'],
  'banking.bank-reconciliation':  ['reconcile', 'match the bank', 'bank matching'],
  'accounting.chart-of-accounts': ['accounts list', 'ledger accounts', 'coa'],
  'reports.financial-statements': ['profit and loss', 'p&l', 'pnl', 'balance sheet', 'cash flow'],
  'accounting.inventory':         ['stock', 'stock on hand'],
}

export function expandSynonyms(entry) {
  return SYNONYMS[entry.id] || []
}
