import { describe, it, expect } from 'vitest'
import { deriveCatalog, slug } from './catalog'
import { MODULES } from '@/components/layout/nav.config.js'

const catalog = deriveCatalog(MODULES)
const byId = (id) => catalog.find((e) => e.id === id)

describe('deriveCatalog', () => {
  it('emits a module entry for each top-level module', () => {
    const sales = byId('sales')
    expect(sales).toBeTruthy()
    expect(sales.type).toBe('module')
    expect(sales.href).toBe('/sales')
    expect(sales.path).toEqual(['Sales'])
  })

  it('emits a page entry for each sub-item with a breadcrumb path', () => {
    const invoices = byId('sales.invoices')
    expect(invoices.type).toBe('page')
    expect(invoices.title).toBe('Invoices')
    expect(invoices.href).toBe('/sales/invoices')
    expect(invoices.path).toEqual(['Sales', 'Invoices'])
  })

  it('carries the module tag and item desc into synonyms', () => {
    const receivables = byId('sales.receivables')
    expect(receivables.synonyms.join(' ')).toMatch(/receivable/i)
  })

  it('marks optional (not always-on, not pinned) modules with an enablementKey', () => {
    // App enablement is opt-out: optional modules are visible unless disabled.
    expect(byId('payroll').enablementKey).toBe('payroll')
    expect(byId('sales').enablementKey).toBeNull()
  })

  it('carries a readable desc for help generation', () => {
    expect(byId('sales.invoices').desc).toMatch(/customers/i)
    expect(byId('sales').desc).toBeTruthy()
  })

  it('produces globally-unique ids', () => {
    const ids = catalog.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('slug', () => {
  it('normalizes a label to a stable token', () => {
    expect(slug('New Invoice')).toBe('new-invoice')
    expect(slug('AR Aging')).toBe('ar-aging')
  })
})
