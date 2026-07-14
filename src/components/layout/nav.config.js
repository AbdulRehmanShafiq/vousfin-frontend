/**
 * nav.config.js — single source of truth for app navigation.
 *
 * NEW IA (2026-06 redesign): "the accountant's OS".
 *   6 always-on modules  → Home · Sales · Purchases · Banking · Accounting · Reports
 *   3 enableable modules → Payroll · Planning · Tax & Compliance
 *   1 pinned             → Settings
 *
 * Navigation model = Hybrid Rail + Contextual Panel:
 *   - A 64px icon rail lists every (enabled) module → 1 click to anywhere.
 *   - A 216px contextual panel shows the active module's sub-items.
 *   - Clicking a rail module lands on its command center (/sales, /banking, …).
 *
 * Routes here are PRESENTATION only — they must match routes.jsx, never define
 * new ones. `accent` is a theme variable (recolors per theme), meaning not
 * decoration. Dual-label: top-level uses a plain word; `tag` carries the
 * accounting term; sub-items can use accounting vocabulary.
 */
import {
  LayoutDashboard, Activity,
  Receipt, BookOpen, Repeat, ClipboardCheck, CalendarDays, CalendarCheck,
  Users, FileText, Wallet, Plus,
  Briefcase, CreditCard, ShoppingBag, Truck,
  Landmark, BrainCircuit, ShieldAlert,
  Boxes, Library, Sparkles, Scale, Inbox,
  ArrowDownCircle, ArrowUpCircle, Banknote,
  FileBarChart2, TrendingUp, Lightbulb, Target, Hammer, Layers,
  Settings, DollarSign, Percent, Palette, Building2, UsersRound, ShieldCheck,
  LayoutTemplate, Search, Clock, ListChecks,
} from 'lucide-react'

/* Section accents — theme variables (recolor per theme), meaning not decoration */
const JADE = 'var(--sec-money-in)'      // money in / overview
const CORAL = 'var(--sec-money-out)'    // money out
const GOLD = 'var(--sec-ledger)'        // the record / the books
const MINT = 'var(--sec-autopilot)'     // banking / automation
const CHAMP = 'var(--sec-intelligence)' // insight / planning
const MUTE = 'var(--sec-settings)'      // neutral / config

/*
 * MODULES — the new top-level model.
 *   { key, name, icon, accent, href, subtitle, tag?, alwaysOn?, pinBottom?,
 *     items: [{ name, href, icon, exact?, activePrefix?, badgeKey?, statKey?, primary? }] }
 * `href` is the module command center. `items` populate the contextual panel
 * AND the command center "Go to" grid. `primary:true` marks the headline
 * destinations shown as quick links.
 */
export const MODULES = [
  {
    key: 'home', name: 'Home', icon: LayoutDashboard, accent: JADE, href: '/dashboard',
    subtitle: 'Your business at a glance', alwaysOn: true,
    items: [
      { name: 'Command Center', href: '/command-center', icon: Inbox, primary: true, desc: 'Your one inbox — what needs you, and what VousFin is doing' },
    ],
  },
  {
    key: 'sales', name: 'Sales', icon: ArrowDownCircle, accent: JADE, href: '/sales',
    subtitle: 'Money coming in', tag: 'Accounts Receivable', alwaysOn: true,
    items: [
      { name: 'Customers',   href: '/customers',         icon: Users,    exact: true, primary: true, desc: 'Who buys from you and their balances' },
      { name: 'Invoices',    href: '/sales/invoices',    icon: FileText, activePrefix: '/sales/invoices', primary: true, desc: 'Bills you send to customers' },
      { name: 'New Invoice', href: '/sales/invoices/new', icon: Plus,    desc: 'Create and send a new invoice' },
      { name: 'Receivables', href: '/sales/receivables', icon: Wallet,   primary: true, statKey: 'receivable', desc: 'Money customers still owe you' },
      { name: 'AR Aging',    href: '/financial-reports/aging', icon: Clock, desc: 'How overdue each balance is' },
    ],
  },
  {
    key: 'purchases', name: 'Purchases', icon: ArrowUpCircle, accent: CORAL, href: '/purchases',
    subtitle: 'Money going out', tag: 'Accounts Payable & Procurement', alwaysOn: true,
    items: [
      { name: 'Vendors',         href: '/vendors',                     icon: Briefcase,   exact: true, primary: true, desc: 'Who you buy from' },
      { name: 'Bills',           href: '/purchases/bills',             icon: FileText,    activePrefix: '/purchases/bills', primary: true, desc: 'What suppliers charge you' },
      { name: 'New Bill',        href: '/purchases/bills/new',         icon: Plus,        desc: 'Record a new supplier bill' },
      { name: 'Payables',        href: '/purchases/payables',          icon: CreditCard,  primary: true, statKey: 'payable', desc: 'Money you still owe suppliers' },
      { name: 'Purchase Orders', href: '/procurement/purchase-orders', icon: ShoppingBag, activePrefix: '/procurement/purchase-orders', desc: 'Orders you place with suppliers' },
      { name: 'Goods Receipts',  href: '/procurement/goods-receipts',  icon: Truck,       desc: 'Confirm what actually arrived' },
      { name: 'AP Workflow',     href: '/purchases/ap-workflow',       icon: ListChecks,  desc: 'Approve and schedule bill payments' },
    ],
  },
  {
    key: 'banking', name: 'Banking', icon: Banknote, accent: MINT, href: '/banking',
    subtitle: 'Cash, bank feeds & matching', alwaysOn: true,
    items: [
      { name: 'Bank Reconciliation', href: '/reconciliation/bank',       icon: Landmark,     primary: true, desc: 'Match your books against the bank' },
      { name: 'AI Review Queue',     href: '/ai/review-queue',           icon: BrainCircuit, primary: true, desc: 'AI-suggested entries to confirm' },
      { name: 'Exceptions',          href: '/reconciliation/exceptions', icon: ShieldAlert,  desc: 'Mismatches that need a closer look' },
      { name: 'Transactions',        href: '/transactions',              icon: Receipt,      exact: true, primary: true, desc: 'Every cash and bank entry' },
      { name: 'Recurring',           href: '/transactions/templates',    icon: Repeat,       desc: 'Saved templates and repeating entries' },
    ],
  },
  {
    key: 'accounting', name: 'Accounting', icon: Library, accent: GOLD, href: '/accounting',
    subtitle: 'The books', tag: 'General Ledger', alwaysOn: true,
    items: [
      { name: 'Chart of Accounts', href: '/accounts',                icon: BookOpen,       primary: true, desc: 'The account structure of your business' },
      { name: 'Transactions',      href: '/transactions',            icon: Receipt,        exact: true, primary: true, desc: 'Every entry in your books — the journal' },
      { name: 'Approvals',         href: '/approvals',               icon: ClipboardCheck, primary: true, badgeKey: 'approvals', statKey: 'approvals', desc: 'Items waiting for sign-off' },
      { name: 'Close the Month',   href: '/accounting/close',        icon: CalendarCheck,  primary: true, desc: 'The month-end checklist, then lock the period' },
      { name: 'Fixed Assets',      href: '/assets',                  icon: Building2,      activePrefix: '/assets', desc: 'Equipment and vehicles with depreciation' },
      { name: 'Inventory',         href: '/inventory',               icon: Boxes,          desc: 'Stock you hold and its value' },
      { name: 'Fiscal Years',      href: '/accounting/fiscal-years', icon: CalendarDays,   desc: 'Open and close accounting periods' },
      { name: 'Activity',          href: '/activity',                icon: Activity,       desc: 'Full audit trail of every change' },
      { name: 'Internal Audit',    href: '/audit/internal',          icon: Search,         activePrefix: '/audit/internal', desc: 'Plan reviews and track findings' },
    ],
  },
  {
    key: 'reports', name: 'Reports', icon: FileBarChart2, accent: CHAMP, href: '/reports',
    subtitle: 'Statements & filings', alwaysOn: true,
    items: [
      { name: 'Financial Statements', href: '/financial-reports/income-statement', activePrefix: '/financial-reports', icon: FileBarChart2, primary: true, desc: 'Income statement, balance sheet, cash flow' },
      { name: 'Equity Statement',     href: '/financial-reports/equity',           activePrefix: '/financial-reports/equity', icon: Layers, desc: 'How owner equity changed over the period' },
      { name: 'Report Builder',       href: '/financial-reports/builder',          activePrefix: '/financial-reports/builder', icon: LayoutTemplate, primary: true, desc: 'Build custom report layouts with scheduling' },
      { name: 'Tax Reports',          href: '/financial-reports/tax',              activePrefix: '/financial-reports/tax', icon: Percent, desc: 'Tax summaries for filing' },
    ],
  },
  {
    key: 'payroll', name: 'Payroll', icon: Wallet, accent: CORAL, href: '/payroll',
    subtitle: 'Pay your team', alwaysOn: false,
    items: [
      { name: 'Employees',   href: '/payroll/employees', icon: Users,    primary: true, desc: 'The people you pay and their salary setup' },
      { name: 'Run Payroll', href: '/payroll/run',       icon: Wallet,   primary: true, desc: 'Calculate take-home pay and post it to the books' },
      { name: 'Payslips',    href: '/payroll/payslips',  icon: FileText, desc: 'Download payslips, bank file and tax certificates' },
    ],
  },
  {
    key: 'planning', name: 'Planning', icon: TrendingUp, accent: CHAMP, href: '/planning',
    subtitle: 'Look ahead & dig in', tag: 'Management Accounting', alwaysOn: false,
    items: [
      { name: 'Forecast',         href: '/ai-analyst/forecast',   activePrefix: '/ai-analyst/forecast', icon: TrendingUp,  primary: true, desc: 'Where your numbers are heading' },
      { name: 'Scenarios',        href: '/ai-analyst/scenarios',  activePrefix: '/ai-analyst/scenarios', icon: Lightbulb,   desc: "Test 'what if' situations safely" },
      { name: '13-Week Cash',     href: '/cash/thirteen-week',    icon: TrendingUp,  primary: true, desc: '13-week rolling cash projection' },
      { name: 'Budgets',          href: '/budgets/editor',        icon: Target,      primary: true, desc: 'Set your plan for the year' },
      { name: 'Budget vs Actual', href: '/budgets/variance',      icon: FileBarChart2, desc: 'See how your real numbers compare to the plan' },
      { name: 'Job Costing',      href: '/cost/jobs',             icon: Hammer,      desc: 'Track job costs against budget' },
      { name: 'Profitability',    href: '/cost/profitability',    icon: TrendingUp,  desc: 'Who and what makes you money' },
      { name: 'Break-even',       href: '/cost/break-even',       icon: Target,      desc: 'How much you must sell to cover costs' },
      { name: 'Benchmarking',     href: '/analysis/benchmarking', icon: Target,      desc: 'How your ratios compare to your industry' },
      { name: 'Anomalies',        href: '/ai-analyst/anomalies',  activePrefix: '/ai-analyst/anomalies', icon: ShieldAlert, desc: 'Unusual activity we flagged for you' },
      { name: 'AI Assistant',     href: '/ai/assistant',          icon: Sparkles,    desc: 'Ask questions about your finances' },
      { name: 'Intelligence',     href: '/ai/intelligence',       activePrefix: '/ai/intelligence', icon: BrainCircuit, primary: true, desc: 'Advice, automation depth, close readiness and the AI decision log' },
    ],
  },
  {
    key: 'compliance', name: 'Tax & Compliance', icon: Scale, accent: MUTE, href: '/tax-compliance',
    subtitle: 'Stay compliant', alwaysOn: false,
    items: [
      { name: 'Tax Autopilot',       href: '/tax',                 icon: Scale,        primary: true, desc: 'Live tax position, deadlines and trends' },
      { name: 'Compliance Calendar', href: '/compliance/calendar', icon: CalendarDays, primary: true, desc: 'Your filing deadlines and obligations' },
      { name: 'Leases & Impairment', href: '/compliance/leases',   icon: Building2,    desc: 'IFRS-16 leases and IAS-36 impairment checks' },
      { name: 'AML Screening',       href: '/compliance/aml',      icon: ShieldAlert,  desc: 'Counterparty risk flags and STR drafts' },
    ],
  },
  {
    key: 'settings', name: 'Settings', icon: Settings, accent: MUTE, href: '/settings', alwaysOn: true, pinBottom: true,
    subtitle: 'Configure VousFin',
    items: [
      { name: 'Business',       href: '/business/settings',       icon: Settings,    primary: true, desc: 'Company profile and preferences' },
      { name: 'Team',           href: '/settings/team',           icon: UsersRound,  activePrefix: '/settings/team', primary: true, desc: 'Invite people and set what they can do' },
      { name: 'Roles & Duties', href: '/settings/duties',         icon: ShieldCheck, activePrefix: '/settings/duties', desc: 'Roles that one person may not hold together' },
      { name: 'Security',       href: '/settings/security',       icon: ShieldCheck, activePrefix: '/settings/security', desc: 'Two-factor authentication and session security' },
      { name: 'Tax Engine',     href: '/settings/tax',            icon: Percent,     activePrefix: '/settings/tax', desc: 'Tax rates and how tax is applied' },
      { name: 'Exchange Rates', href: '/settings/exchange-rates', icon: DollarSign,  activePrefix: '/settings/exchange-rates', desc: 'Currency conversion rates' },
      { name: 'Cost Centres',   href: '/settings/cost-centers',   icon: Building2,   activePrefix: '/settings/cost-centers', desc: 'Departments, branches and projects' },
      { name: 'Appearance',     href: '/settings/appearance',     icon: Palette,     activePrefix: '/settings/appearance', desc: 'Theme and look of the app' },
    ],
  },
]

/* Optional (enableable) module keys — businesses can hide these. */
export const OPTIONAL_MODULE_KEYS = MODULES.filter((m) => !m.alwaysOn && !m.pinBottom).map((m) => m.key)

/** Look up a module by key. */
export function moduleByKey(key) {
  return MODULES.find((m) => m.key === key) || null
}

/* ── Module-ownership prefixes — map a pathname to its owning module ──
   Longest-match wins via the item scan; these handle landing pages and
   sub-trees that don't appear verbatim in `items`. */
const MODULE_PREFIXES = [
  ['home', ['/dashboard', '/command-center', '/hub/home']],
  ['sales', ['/sales', '/customers', '/hub/sales', '/hub/money-in']],
  ['purchases', ['/purchases', '/vendors', '/procurement', '/hub/purchases', '/hub/money-out']],
  ['banking', ['/banking', '/reconciliation', '/ai/review-queue', '/transactions', '/hub/banking', '/hub/autopilot']],
  ['accounting', ['/accounting', '/accounts', '/approvals', '/assets', '/inventory', '/activity', '/audit', '/hub/accounting', '/hub/ledger']],
  ['reports', ['/reports', '/financial-reports', '/hub/reports', '/hub/intelligence']],
  ['payroll', ['/payroll', '/hub/payroll']],
  ['planning', ['/planning', '/ai-analyst', '/budgets', '/cost', '/cash', '/analysis', '/ai/assistant', '/hub/planning', '/hub/budgets', '/hub/cost']],
  ['compliance', ['/tax-compliance', '/tax', '/compliance', '/hub/compliance']],
  ['settings', ['/settings', '/business/settings', '/hub/settings']],
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

const FLAT_ITEMS = MODULES.flatMap((m) => m.items)

/** True when `item` should render as active for the given pathname. */
export function isItemActive(item, pathname) {
  if (item.exact) return pathname === item.href
  if (item.activePrefix) return pathname.startsWith(item.activePrefix)
  return pathname === item.href || pathname.startsWith(item.href + '/')
}

/** Which module owns the current route (rail highlight + which panel shows). */
export function activeModuleKey(pathname) {
  // Module landing pages first
  for (const m of MODULES) {
    if (pathname === m.href) return m.key
  }
  // Item match — longest matching href wins
  let best = null
  for (const m of MODULES) {
    for (const item of m.items) {
      const prefix = item.activePrefix || item.href
      if (pathname === item.href || pathname.startsWith(prefix)) {
        if (!best || prefix.length > best.len) best = { key: m.key, len: prefix.length }
      }
    }
  }
  if (best) return best.key
  // Prefix fallback for sub-trees / legacy hub URLs
  for (const [key, prefixes] of MODULE_PREFIXES) {
    if (prefixes.some((p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p))) return key
  }
  return null
}

/** Resolve the page title for a pathname — longest matching nav href wins. */
export function pageTitleFor(pathname) {
  // Module landing pages → module name
  for (const m of MODULES) {
    if (pathname === m.href) return m.name
  }
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
  if (best) return best.name
  const mk = activeModuleKey(pathname)
  return moduleByKey(mk)?.name || 'vousFin'
}

/**
 * Derive a stable i18n key segment from an href.
 * e.g. '/sales/invoices' → 'sales_invoices'
 */
export function navKey(href) {
  return href.replace(/^\//, '').replace(/\//g, '_')
}

/**
 * Resolve a trackable shortcut for a pathname — the specific nav item the user
 * landed on (longest matching href), so dashboard shortcuts point at real pages
 * (e.g. "Invoices" → /sales/invoices), not just the module. Returns null for
 * paths that aren't a real destination (dashboard itself, unknown routes).
 * @returns {{moduleKey, label, path}|null}
 */
export function shortcutForPath(pathname) {
  if (!pathname || pathname === '/' || pathname.startsWith('/dashboard')) return null
  let best = null
  for (const item of FLAT_ITEMS) {
    const prefix = item.activePrefix || item.href
    if (pathname === item.href || pathname.startsWith(prefix)) {
      if (!best || prefix.length > (best.activePrefix || best.href).length) best = item
    }
  }
  if (best) return { moduleKey: navKey(best.href), label: best.name, path: best.href }
  return null
}

/* Legacy aliases (RAIL_ITEMS / HUB_SECTIONS / hubByKey / activeSectionKey /
   NAV_SECTIONS) removed 2026-07-14 with their only consumers
   (SectionRail.jsx, SectionHubPage.jsx). MODULES is the one model. */
