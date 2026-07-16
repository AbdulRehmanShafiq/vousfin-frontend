import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import { staticFabActionsFor, CAPTURE_FAB_ACTION } from './nav.config'

/**
 * The ⊕ contract. `staticFabActionsFor` returns the pure-navigation "New …"
 * actions a page gets for free (page-registered actions and the Capture
 * fallback are layered on top in MobileNav). These tests guard: every returned
 * action is a labelled nav to a route the router actually serves, and unknown
 * routes return nothing (so the ⊕ falls through to Capture, never a 404).
 */
describe('staticFabActionsFor', () => {
  it('offers New invoice anywhere under Invoices, and from Receivables', () => {
    expect(staticFabActionsFor('/sales/invoices')).toEqual([
      expect.objectContaining({ id: 'new-invoice', kind: 'nav', to: '/sales/invoices/new', labelKey: 'create.invoice' }),
    ])
    expect(staticFabActionsFor('/sales/invoices/abc123')[0]).toMatchObject({ to: '/sales/invoices/new' })
    expect(staticFabActionsFor('/sales/receivables')[0]).toMatchObject({ to: '/sales/invoices/new' })
  })

  it('offers New bill under Bills and Payables, New order under Purchase Orders', () => {
    expect(staticFabActionsFor('/purchases/bills')[0]).toMatchObject({ id: 'new-bill', to: '/purchases/bills/new' })
    expect(staticFabActionsFor('/purchases/payables')[0]).toMatchObject({ id: 'new-bill', to: '/purchases/bills/new' })
    expect(staticFabActionsFor('/procurement/purchase-orders')[0]).toMatchObject({ id: 'new-po', to: '/procurement/purchase-orders/new' })
  })

  it('returns nothing where a section has no create route (⊕ falls to Capture)', () => {
    for (const p of ['/dashboard', '/reports', '/money', '/transactions', '/inventory', '/customers', '/vendors', '/banking', '/nope']) {
      expect(staticFabActionsFor(p)).toEqual([])
    }
  })

  it('returns nothing for empty or missing input', () => {
    expect(staticFabActionsFor('')).toEqual([])
    expect(staticFabActionsFor()).toEqual([])
  })

  it('matches on path segments, never bare string prefixes', () => {
    // '/sales/invoices-archive' must NOT resolve as '/sales/invoices'.
    expect(staticFabActionsFor('/sales/invoices-archive')).toEqual([])
  })

  it('every static action is a nav, and every target is a route routes.jsx serves', () => {
    // The drift guard that matters: the ⊕ must never aim at a 404. routes.jsx
    // is the authority — a create route can be real without a nav entry.
    const routesSrc = readFileSync(resolve(process.cwd(), 'src/routes.jsx'), 'utf8')
    const declared = new Set(
      [...routesSrc.matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1].replace(/^\//, '')),
    )
    expect(declared.size).toBeGreaterThan(50)

    for (const p of ['/sales/invoices', '/sales/receivables', '/purchases/bills', '/purchases/payables', '/procurement/purchase-orders']) {
      const [action] = staticFabActionsFor(p)
      expect(action.kind).toBe('nav')
      expect(declared, `⊕ on ${p} points at ${action.to}, which routes.jsx does not serve`)
        .toContain(action.to.replace(/^\//, ''))
    }
  })

  it('the Capture fallback is a capture action, never a navigation', () => {
    expect(CAPTURE_FAB_ACTION.kind).toBe('capture')
    expect(CAPTURE_FAB_ACTION.to).toBeUndefined()
  })
})
