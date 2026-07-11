// src/utils/simpleEntryPresets.js
// Simple-mode chip catalog + deterministic account wiring. Pure module —
// no API calls, fully unit-testable. Uses the SAME transactionType values as
// the advanced form so both modes hit the identical save path.

export const SIMPLE_CHIPS = [
  { id: 'paid',        label: 'I paid for something',            transactionType: 'Expense',            fields: ['description', 'category', 'amount', 'paymentMethod', 'date'] },
  { id: 'gotPaid',     label: 'I got paid',                      transactionType: 'Income',             fields: ['description', 'category', 'amount', 'paymentMethod', 'date'] },
  { id: 'boughtStock', label: 'I bought stock to sell',          transactionType: 'Inventory Purchase', fields: ['inventory', 'amount', 'paymentMethod', 'date', 'counterparty'] },
  { id: 'soldStock',   label: 'I sold stock',                    transactionType: 'Inventory Sale',     fields: ['inventory', 'amount', 'paymentMethod', 'date', 'counterparty'] },
  { id: 'moved',       label: 'I moved money between accounts',  transactionType: 'Bank Transfer',      fields: ['fromAccount', 'toAccount', 'amount', 'date'] },
  { id: 'other',       label: 'Something else',                  transactionType: null,                 fields: [] },
]

const byCode = (accounts, code) => accounts.find(a => a.accountCode === code) || null
const byName = (accounts, re)  => accounts.find(a => re.test(a.accountName)) || null

export function resolvePaymentAccount(accounts = [], method = 'cash') {
  if (!accounts.length) return null
  if (method === 'cash') return byCode(accounts, '1020') || byName(accounts, /cash/i)
  return byCode(accounts, '1010') || byName(accounts, /bank/i)
}

export function resolveChipAccounts(chip, { accounts = [], paymentMethod = 'cash', categoryAccountId = '' } = {}) {
  const pay = resolvePaymentAccount(accounts, paymentMethod)
  const payId = pay?._id || ''
  switch (chip?.id) {
    case 'paid':    return { debitAccountId: categoryAccountId || '', creditAccountId: payId }
    case 'gotPaid': return { debitAccountId: payId, creditAccountId: categoryAccountId || '' }
    case 'boughtStock': {
      const inv = byName(accounts, /^inventory$/i) || byCode(accounts, '1150')
      return { debitAccountId: inv?._id || '', creditAccountId: payId }
    }
    case 'soldStock': {
      const rev = byCode(accounts, '4110') || byName(accounts, /sales/i)
      return { debitAccountId: payId, creditAccountId: rev?._id || '' }
    }
    default: return { debitAccountId: '', creditAccountId: '' }
  }
}
