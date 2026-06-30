import { describe, it, expect } from 'vitest'
import { deriveCatalog } from './catalog'
import { filterByDisabled } from './filter'
import { MODULES } from '@/components/layout/nav.config.js'

const entries = deriveCatalog(MODULES)

describe('filterByDisabled', () => {
  it('hides an optional module that is in the disabled list', () => {
    const visible = filterByDisabled(entries, ['payroll'])
    expect(visible.some((e) => e.id === 'payroll')).toBe(false)
    expect(visible.some((e) => e.id === 'payroll.payslips')).toBe(false)
  })
  it('shows an optional module when not disabled (opt-out default)', () => {
    const visible = filterByDisabled(entries, [])
    expect(visible.some((e) => e.id === 'payroll')).toBe(true)
  })
  it('always shows always-on modules regardless of the disabled list', () => {
    const visible = filterByDisabled(entries, ['sales'])
    expect(visible.some((e) => e.id === 'sales')).toBe(true)
  })
})
