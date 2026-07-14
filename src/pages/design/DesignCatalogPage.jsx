import { useState } from 'react'
import { Send, Trash2, Download, Plus } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import { SmartTable, Money } from '@/design-system'

/*
 * /design — the living Ledger catalog (dev-only route).
 * Every governed component, every state, on the active theme. This page is
 * the cheap Storybook: if a component state isn't visible here, it isn't
 * governed. Excluded from production builds via the DEV route guard.
 */

const ROLES = [
  ['surface-canvas', 'bg-surface-canvas border border-glass'],
  ['surface-raised', 'bg-surface-raised border border-glass'],
  ['surface-overlay', 'bg-surface-overlay border border-glass'],
  ['accent', 'bg-accent'],
  ['money-in', 'bg-money-in'],
  ['money-out', 'bg-money-out'],
  ['status-warning', 'bg-status-warning'],
  ['status-info', 'bg-status-info'],
]

const TYPE_SCALE = [
  ['display', 'text-display', 'Rs 4,280,000'],
  ['title', 'text-title', 'Page title'],
  ['heading', 'text-heading', 'Section heading'],
  ['body', 'text-body', 'Body copy at 14px carries the app.'],
  ['small', 'text-small', 'Secondary cell text'],
  ['label', 'text-label uppercase tracking-wider', 'COLUMN LABEL'],
]

const DEMO_ROWS = [
  { id: 1, name: 'Ali Raza', status: 'paid', amount: 125000 },
  { id: 2, name: 'Hamza Traders', status: 'overdue', amount: 48000 },
  { id: 3, name: 'Stasie Restaurant', status: 'draft', amount: 8600 },
]

function Section({ title, children }) {
  return (
    <section className="space-y-4">
      <h2 className="text-heading font-semibold text-text-primary border-b border-glass pb-2">{title}</h2>
      {children}
    </section>
  )
}

export default function DesignCatalogPage() {
  const [selected, setSelected] = useState([])

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <h1 className="text-title font-semibold text-text-primary">Ledger — design catalog</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Dev-only. Every governed component and state, rendered on the active theme. Switch themes in Settings → Appearance to QA both modes.
        </p>
      </div>

      <Section title="Color roles">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ROLES.map(([name, cls]) => (
            <div key={name} className="space-y-1.5">
              <div className={`h-12 rounded-card ${cls}`} />
              <p className="text-xs text-text-muted num">{name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type scale">
        <div className="space-y-3">
          {TYPE_SCALE.map(([name, cls, sample]) => (
            <div key={name} className="flex items-baseline gap-4">
              <span className="w-16 shrink-0 text-xs text-text-muted num">{name}</span>
              <span className={`${cls} text-text-primary`}>{sample}</span>
            </div>
          ))}
          <div className="flex items-baseline gap-4">
            <span className="w-16 shrink-0 text-xs text-text-muted num">money</span>
            <span className="space-x-4">
              <Money value={4280000} emphasis="hero" compact />
              <Money value={125000} emphasis="total" />
              <Money value={4800} flow="in" signed />
              <Money value={1200} flow="out" signed />
            </span>
          </div>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" icon={Plus}>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger" icon={Trash2}>Danger</Button>
          <Button variant="primary" loading>Saving</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="secondary" size="sm">Small</Button>
          <Button variant="secondary" size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Inputs">
        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
          <Input label="Label" placeholder="Placeholder" helperText="Helper text under the field." name="demo1" />
          <Input label="With error" placeholder="Placeholder" error="Plain-language error: say what to fix." name="demo2" />
          <Input label="Password" type="password" name="demo3" />
          <Input label="Disabled" disabled placeholder="Read only" name="demo4" />
        </div>
      </Section>

      <Section title="Badges / status chips">
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">Paid</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="danger">Overdue</Badge>
          <Badge variant="info">Draft</Badge>
          <Badge>Neutral</Badge>
        </div>
      </Section>

      <Section title="SmartTable — selection, row actions, money columns">
        <SmartTable
          columns={[
            { key: 'name', header: 'Customer', mobile: 'title',
              render: (r) => <span className="font-semibold text-text-primary">{r.name}</span> },
            { key: 'status', header: 'Status', mobile: 'subtitle',
              render: (r) => <Badge variant={r.status === 'paid' ? 'success' : r.status === 'overdue' ? 'danger' : 'info'}>{r.status}</Badge> },
            { key: 'amount', header: 'Amount', type: 'money', mobile: 'trailing',
              render: (r) => <Money value={r.amount} /> },
          ]}
          data={DEMO_ROWS}
          selectable
          selectedKeys={selected}
          onSelectionChange={setSelected}
          bulkActions={[
            { label: 'Send reminder', icon: Send, onClick: () => {} },
            { label: 'Export', icon: Download, onClick: () => {} },
          ]}
          rowActions={() => [
            { label: 'Send', icon: Send, onClick: () => {} },
            { label: 'Export', icon: Download, onClick: () => {} },
            { label: 'Delete', icon: Trash2, tone: 'danger', onClick: () => {} },
          ]}
          onRowClick={() => {}}
        />
        <p className="text-xs text-text-muted">Keyboard: j/k move · Enter open · x select. Resize under 768px to see the card collapse.</p>
      </Section>

      <Section title="Ledger ruling — the statement signature">
        <table className="w-full max-w-md text-sm">
          <tbody>
            <tr><td className="py-1.5 text-text-secondary">Revenue</td><td className="py-1.5 text-right num text-text-primary">4,820,000</td></tr>
            <tr><td className="py-1.5 text-text-secondary">Cost of sales</td><td className="py-1.5 text-right num text-text-primary">(2,140,000)</td></tr>
            <tr className="rule-subtotal"><td className="py-1.5 font-semibold text-text-primary">Gross profit</td><td className="py-1.5 text-right num font-semibold text-text-primary">2,680,000</td></tr>
            <tr><td className="py-1.5 text-text-secondary">Operating expenses</td><td className="py-1.5 text-right num text-text-primary">(1,310,000)</td></tr>
            <tr className="rule-total"><td className="py-2 font-semibold text-text-primary">Net income</td><td className="py-2 text-right num font-semibold text-text-primary">1,370,000</td></tr>
          </tbody>
        </table>
      </Section>

      <Section title="Empty state">
        <EmptyState title="Nothing here yet" description="One line that says what this is, and one action to start." />
      </Section>
    </div>
  )
}
