import { describe, it, expect } from 'vitest'
import { SIMPLE_CHIPS, resolvePaymentAccount, resolveChipAccounts } from './simpleEntryPresets'

const ACCOUNTS = [
  { _id: 'a-cash', accountName: 'Cash in Hand', accountCode: '1020', accountType: 'Asset' },
  { _id: 'a-bank', accountName: 'Cash at Bank', accountCode: '1010', accountType: 'Asset' },
  { _id: 'a-inv',  accountName: 'Inventory',    accountCode: '1150', accountType: 'Asset' },
  { _id: 'a-rev',  accountName: 'Sales Revenue', accountCode: '4110', accountType: 'Revenue' },
  { _id: 'a-rent', accountName: 'Rent Expense', accountCode: '6110', accountType: 'Expense' },
]

describe('SIMPLE_CHIPS', () => {
  it('has the six chips in plain language', () => {
    expect(SIMPLE_CHIPS.map(c => c.id)).toEqual(['paid', 'gotPaid', 'boughtStock', 'soldStock', 'moved', 'other'])
    expect(SIMPLE_CHIPS.find(c => c.id === 'boughtStock').transactionType).toBe('Inventory Purchase')
  })
})

describe('resolvePaymentAccount', () => {
  it('cash → 1020, bank → 1010', () => {
    expect(resolvePaymentAccount(ACCOUNTS, 'cash')._id).toBe('a-cash')
    expect(resolvePaymentAccount(ACCOUNTS, 'bank')._id).toBe('a-bank')
  })
  it('empty accounts → null', () => {
    expect(resolvePaymentAccount([], 'cash')).toBeNull()
  })
})

describe('resolveChipAccounts', () => {
  it('paid: category debits, payment credits', () => {
    const r = resolveChipAccounts(SIMPLE_CHIPS[0], { accounts: ACCOUNTS, paymentMethod: 'cash', categoryAccountId: 'a-rent' })
    expect(r).toEqual({ debitAccountId: 'a-rent', creditAccountId: 'a-cash' })
  })
  it('boughtStock: Inventory debits, payment credits', () => {
    const chip = SIMPLE_CHIPS.find(c => c.id === 'boughtStock')
    const r = resolveChipAccounts(chip, { accounts: ACCOUNTS, paymentMethod: 'bank' })
    expect(r).toEqual({ debitAccountId: 'a-inv', creditAccountId: 'a-bank' })
  })
  it('soldStock: payment debits, revenue credits', () => {
    const chip = SIMPLE_CHIPS.find(c => c.id === 'soldStock')
    const r = resolveChipAccounts(chip, { accounts: ACCOUNTS, paymentMethod: 'cash' })
    expect(r).toEqual({ debitAccountId: 'a-cash', creditAccountId: 'a-rev' })
  })
  it('unresolvable pieces come back as empty strings, never guesses', () => {
    const chip = SIMPLE_CHIPS.find(c => c.id === 'boughtStock')
    const r = resolveChipAccounts(chip, { accounts: [], paymentMethod: 'cash' })
    expect(r).toEqual({ debitAccountId: '', creditAccountId: '' })
  })
})
