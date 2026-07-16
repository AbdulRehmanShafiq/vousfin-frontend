import {
  LineChart, Scale, PieChart, BookOpen, Download,
  Clock, Receipt, BarChart2, Building2, Layers,
} from 'lucide-react'

/**
 * The reports VousFin has — the single list both surfaces read.
 *
 * Metadata only, no page components: the desktop hub maps these to its lazy
 * imports, while the phone only needs to name and route them. Kept here rather
 * than in the hub because the hub imports the mobile screen, and the mobile
 * screen needs the list — importing it back would be a cycle.
 *
 * `plain` is the phone label. "Trial Balance" means nothing to an owner; "Every
 * account, side by side" does. The desktop keeps the accountant's name, because
 * that is who is reading it there.
 */
export const REPORT_TABS = [
  { key: 'income-statement', label: 'Income Statement', short: 'P&L',     plain: 'What you made and spent',   icon: LineChart },
  { key: 'balance-sheet',    label: 'Balance Sheet',    short: 'Balance', plain: 'What you own and owe',      icon: Scale },
  { key: 'cash-flow',        label: 'Cash Flow',        short: 'Cash',    plain: 'Where the cash went',       icon: PieChart },
  { key: 'trial-balance',    label: 'Trial Balance',    short: 'Trial',   plain: 'Every account, side by side', icon: BookOpen },
  { key: 'general-ledger',   label: 'General Ledger',   short: 'Ledger',  plain: 'Every entry, in order',     icon: Building2 },
  { key: 'aging',            label: 'Aging',            short: 'Aging',   plain: 'Who is late paying',        icon: Clock },
  { key: 'tax',              label: 'Tax Report',       short: 'Tax',     plain: 'What you owe in tax',       icon: Receipt },
  { key: 'comparative',      label: 'Comparative',      short: 'Compare', plain: 'This period vs last',       icon: BarChart2 },
  { key: 'equity',           label: 'Equity Statement', short: 'Equity',  plain: 'What the business is worth', icon: Layers },
  { key: 'export',           label: 'Export',           short: 'Export',  plain: 'Download for your accountant', icon: Download },
]

export const reportTab = (key) => REPORT_TABS.find((t) => t.key === key) || null

/** Every statement lives at the same place; ?full=1 is what asks for the deep view. */
export const reportPath = (key) => `/financial-reports/${key}?full=1`
