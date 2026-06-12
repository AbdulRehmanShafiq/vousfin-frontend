/**
 * nav.config.js — single source of truth for app navigation.
 *
 * Consumed by Sidebar (sections), Header (page title), and anywhere else that
 * needs route→label mapping. Routes here are PRESENTATION only — they must
 * match routes.jsx but never define new ones.
 *
 * Section model:
 *   { label: 'Accounting'|null, key, items: [{ name, href, icon, exact?, activePrefix?, badgeKey? }] }
 * label:null renders without a header (pinned top section).
 */
import {
  LayoutDashboard, Activity,
  Receipt, BookOpen, Repeat, ClipboardCheck, CalendarDays,
  Users, FileText, Wallet,
  Briefcase, CreditCard, ShoppingBag, Truck,
  Landmark, BrainCircuit, ShieldAlert,
  Boxes,
  FileBarChart2, TrendingUp, Lightbulb, Sparkles,
  Settings, DollarSign, Percent,
} from 'lucide-react'

export const NAV_SECTIONS = [
  {
    label: null, key: 'overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Activity',  href: '/activity',  icon: Activity },
    ],
  },
  {
    label: 'Accounting', key: 'accounting',
    items: [
      { name: 'Transactions',      href: '/transactions',           icon: Receipt, exact: true },
      { name: 'Chart of Accounts', href: '/accounts',               icon: BookOpen },
      { name: 'Recurring',         href: '/transactions/templates', icon: Repeat },
      { name: 'Approvals',         href: '/approvals',              icon: ClipboardCheck, badgeKey: 'approvals' },
      { name: 'Fiscal Years',      href: '/accounting/fiscal-years', icon: CalendarDays },
    ],
  },
  {
    label: 'Sales', key: 'sales',
    items: [
      { name: 'Customers',   href: '/customers',         icon: Users },
      { name: 'Invoices',    href: '/sales/invoices',    icon: FileText },
      { name: 'Receivables', href: '/sales/receivables', icon: Wallet },
    ],
  },
  {
    label: 'Purchases', key: 'purchases',
    items: [
      { name: 'Vendors',         href: '/vendors',                     icon: Briefcase },
      { name: 'Bills',           href: '/purchases/bills',             icon: FileText },
      { name: 'Payables',        href: '/purchases/payables',          icon: CreditCard },
      { name: 'Purchase Orders', href: '/procurement/purchase-orders', icon: ShoppingBag },
      { name: 'Goods Receipts',  href: '/procurement/goods-receipts',  icon: Truck },
    ],
  },
  {
    label: 'Banking', key: 'banking',
    items: [
      { name: 'Bank Reconciliation', href: '/reconciliation/bank',       icon: Landmark },
      { name: 'AI Review Queue',     href: '/ai/review-queue',           icon: BrainCircuit },
      { name: 'Exceptions',          href: '/reconciliation/exceptions', icon: ShieldAlert },
    ],
  },
  {
    label: 'Operations', key: 'operations',
    items: [
      { name: 'Inventory', href: '/inventory', icon: Boxes },
    ],
  },
  {
    label: 'Insights', key: 'insights',
    items: [
      { name: 'Financial Reports', href: '/financial-reports/income-statement', activePrefix: '/financial-reports', icon: FileBarChart2 },
      { name: 'Forecast',          href: '/ai-analyst/forecast',  icon: TrendingUp },
      { name: 'Anomalies',         href: '/ai-analyst/anomalies', icon: ShieldAlert },
      { name: 'AI Insights',       href: '/ai-analyst/insights',  icon: Lightbulb },
      { name: 'AI Assistant',      href: '/ai/assistant',         icon: Sparkles },
    ],
  },
  {
    label: 'Settings', key: 'settings',
    items: [
      { name: 'Business',       href: '/business/settings',       icon: Settings },
      { name: 'Tax Engine',     href: '/settings/tax',            icon: Percent,    activePrefix: '/settings/tax' },
      { name: 'Exchange Rates', href: '/settings/exchange-rates', icon: DollarSign, activePrefix: '/settings/exchange-rates' },
    ],
  },
]

/* Detail/editor routes that need a nicer title than their list page */
const TITLE_OVERRIDES = [
  [/^\/customers\/[^/]+/,                 'Customer Detail'],
  [/^\/vendors\/[^/]+\/portal/,           'Vendor Portal'],
  [/^\/vendors\/[^/]+/,                   'Vendor Detail'],
  [/^\/sales\/invoices\/new/,             'New Invoice'],
  [/^\/sales\/invoices\/[^/]+\/edit/,     'Edit Invoice'],
  [/^\/purchases\/bills\/new/,            'New Bill'],
  [/^\/purchases\/bills\/[^/]+\/edit/,    'Edit Bill'],
  [/^\/procurement\/purchase-orders\/new/,       'New Purchase Order'],
  [/^\/procurement\/purchase-orders\/[^/]+\/edit/, 'Edit Purchase Order'],
  [/^\/purchases\/ap-workflow/,           'AP Workflow'],
  [/^\/purchases\/procurement-dashboard/, 'Procurement Dashboard'],
]

const FLAT_ITEMS = NAV_SECTIONS.flatMap((s) => s.items)

/** Resolve the page title for a pathname — longest matching nav href wins. */
export function pageTitleFor(pathname) {
  for (const [re, title] of TITLE_OVERRIDES) {
    if (re.test(pathname)) return title
  }
  let best = null
  for (const item of FLAT_ITEMS) {
    const prefix = item.activePrefix || item.href
    if (pathname === item.href || pathname.startsWith(prefix)) {
      if (!best || prefix.length > (best.activePrefix || best.href).length) best = item
    }
  }
  return best?.name || 'vousFin'
}

/** True when `item` should render as active for the given pathname. */
export function isItemActive(item, pathname) {
  if (item.exact) return pathname === item.href
  if (item.activePrefix) return pathname.startsWith(item.activePrefix)
  return pathname.startsWith(item.href)
}

/** Section key containing the active route (for default-expanding). */
export function activeSectionKey(pathname) {
  if (pathname.startsWith('/procurement')) return 'purchases'
  for (const section of NAV_SECTIONS) {
    if (section.items.some((i) => isItemActive(i, pathname))) return section.key
  }
  return null
}
