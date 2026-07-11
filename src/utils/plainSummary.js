// src/utils/plainSummary.js
// One plain-English sentence a non-accountant reads ABOVE the DR/CR preview.
// Pure function, no API calls. Product rule: no accounting jargon here.
import { formatCurrency } from '@/utils/formatters'

const PAY_LABEL = {
  cash: 'in cash', bank: 'by bank transfer', mobile_wallet: 'by mobile wallet',
  online: 'online', credit_card: 'by card',
}
const BUY_TYPES  = new Set(['Inventory Purchase', 'Cash Purchase', 'Credit Purchase', 'Expense', 'Asset Purchase'])
const SELL_TYPES = new Set(['Inventory Sale', 'Cash Sale', 'Credit Sale', 'Income'])

export function buildPlainSummary({ transactionType, amount, currency, paymentMethod, inventory } = {}) {
  if (!(amount > 0)) return null
  const money = formatCurrency(amount, currency)
  const paid = PAY_LABEL[paymentMethod] || ''
  const inv = inventory || { mode: 'none' }
  const qtyPhrase = inv.quantity ? `${inv.quantity} ${inv.unit || 'units'}` : ''

  if (BUY_TYPES.has(transactionType) && inv.mode === 'existing' && inv.itemName) {
    let s = `You bought ${qtyPhrase ? qtyPhrase + ' of ' : ''}${inv.itemName} for ${money}${paid ? ', paid ' + paid : ''}.`
    if (inv.quantity) s += ` Stock will go up by ${inv.quantity}.`
    return s
  }
  if (BUY_TYPES.has(transactionType) && inv.mode === 'create' && inv.itemName) {
    return `You bought ${qtyPhrase ? qtyPhrase + ' of ' : ''}${inv.itemName} for ${money}${paid ? ', paid ' + paid : ''}. ` +
      `${inv.itemName} will be added to your inventory as a new item.`
  }
  if (SELL_TYPES.has(transactionType) && inv.mode === 'existing' && inv.itemName) {
    let s = `You sold ${qtyPhrase ? qtyPhrase + ' of ' : ''}${inv.itemName} for ${money}${paid ? ', received ' + paid : ''}.`
    if (inv.quantity) s += ` Stock will go down by ${inv.quantity}.`
    if (inv.currentStock != null) s += ` You have ${inv.currentStock} in stock right now.`
    return s
  }
  if (BUY_TYPES.has(transactionType))  return `You paid ${money}${paid ? ' ' + paid : ''}.`
  if (SELL_TYPES.has(transactionType)) return `You received ${money}${paid ? ' ' + paid : ''}.`
  return null
}
