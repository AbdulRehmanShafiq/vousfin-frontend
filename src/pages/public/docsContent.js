/**
 * docsContent.js — the end-to-end VousFin documentation, rendered by DocsPage
 * with a table of contents. Each section: { id, title, body?: string[],
 * steps?: string[], list?: string[] }. Grounded in the real product modules.
 */
export const DOC_SECTIONS = [
  {
    id: 'overview',
    title: 'What VousFin is',
    body: [
      'VousFin is an AI-powered smart accountant. It does almost all of your bookkeeping automatically while keeping every number correct, immutable and explainable — so you can run your business by typing what happened in plain language instead of thinking like an accountant.',
      'It is organised as a few always-on modules (Home, Sales, Purchases, Banking, Accounting, Reports) plus optional ones you can switch on (Payroll, Planning, Tax & Compliance) and Settings.',
    ],
  },
  {
    id: 'getting-started',
    title: 'Getting started',
    body: ['Setting up takes a few minutes. There is no card required to start.'],
    steps: [
      'Create an account with your email (or sign in with Google), and verify your email.',
      'Run the business setup wizard: name your business, pick its type and base currency. VousFin seeds a full chart of accounts for you automatically.',
      'Add your first transaction — describe it in plain language or use a form. VousFin posts the correct double-entry journal behind the scenes.',
      'Connect the rest as you go: customers, vendors, bank statements, and any modules you need.',
    ],
  },
  {
    id: 'how-accounting-works',
    title: 'How the accounting stays correct',
    body: [
      'Everything you do produces exactly one balanced journal entry, where total debits equal total credits. Reports are always derived from those entries — never stored separately — so they can never silently disagree with your ledger.',
      'Your financial history is permanent. Journal entries, payments and audit logs are never deleted or edited in place; corrections are made with proper reversing and adjustment entries. That means there is always a complete audit trail: who did what, when, why, and what changed.',
      'The AI assists with this — it categorises, suggests, predicts and explains — but it never invents accounting records. You always stay in control.',
    ],
  },
  {
    id: 'command-bar',
    title: 'Find anything: the command bar',
    body: [
      'Press ⌘K (Mac) or Ctrl+K (Windows), or just “/”, anywhere in the app to open the command bar. Type what you mean — even vague phrases like “who owes me money” — and jump straight to the right page.',
      'It searches by meaning, not just exact words, and includes quick actions (like “New Invoice”). Ask a “how do I…” question and it returns a short, step-by-step answer with a link to the page.',
    ],
  },
  {
    id: 'sales',
    title: 'Sales (money coming in)',
    body: ['The Sales module manages customers and everything they owe you.'],
    list: [
      'Customers — who buys from you and their running balances',
      'Invoices — bills you send; create one with New Invoice',
      'Receivables — money customers still owe you',
      'AR Aging — how overdue each balance is',
    ],
  },
  {
    id: 'purchases',
    title: 'Purchases (money going out)',
    body: ['The Purchases module covers suppliers and procurement.'],
    list: [
      'Vendors — who you buy from',
      'Bills — what suppliers charge you; record one with New Bill',
      'Payables — money you still owe suppliers',
      'Purchase Orders → Goods Receipts → Bills — the full procurement flow with 3-way matching',
      'AP Workflow — approve and schedule bill payments',
    ],
  },
  {
    id: 'banking',
    title: 'Banking',
    body: ['Keep your books and your bank in agreement.'],
    list: [
      'Bank Reconciliation — match your books against the bank statement',
      'AI Review Queue — AI-suggested entries to confirm with one click',
      'Transactions — every cash and bank entry',
      'Recurring — saved templates and repeating entries',
    ],
  },
  {
    id: 'accounting',
    title: 'Accounting (the books)',
    body: ['The general ledger and everything underneath it.'],
    list: [
      'Chart of Accounts — the account structure of your business',
      'Journal Entries — every entry in your books',
      'Approvals — items waiting for sign-off',
      'Fixed Assets — equipment and vehicles with depreciation',
      'Inventory — stock you hold and its value, kept in lock-step with the ledger',
      'Fiscal Years — open and close accounting periods',
      'Activity & Internal Audit — full audit trail and review tools',
    ],
  },
  {
    id: 'reports',
    title: 'Reports',
    body: ['Every report is derived from your ledger, so it’s always accurate.'],
    list: [
      'Financial Statements — income statement, balance sheet, cash flow',
      'Equity Statement — how owner equity changed over the period',
      'Report Builder — build custom report layouts with scheduling',
      'Tax Reports — tax summaries for filing',
    ],
  },
  {
    id: 'payroll',
    title: 'Payroll (optional)',
    body: ['Switch on Payroll in Settings to pay your team.'],
    list: [
      'Employees — the people you pay and their salary setup',
      'Run Payroll — calculate take-home pay and post it to the books',
      'Payslips — download payslips, the bank file and tax certificates',
    ],
  },
  {
    id: 'planning',
    title: 'Planning & intelligence (optional)',
    body: ['Turn your numbers into decisions.'],
    list: [
      'Budgets and Budget vs Actual — plan and track variance',
      'Forecast and 13-week cash — see cash 90 days out',
      'Profitability, Job Costing and Break-even — understand what makes money',
      'Anomalies and Benchmarking — catch mistakes and compare to your sector',
    ],
  },
  {
    id: 'tax',
    title: 'Tax & Compliance (optional)',
    body: ['Tax is treated as part of accounting, so it’s always reproducible.'],
    list: [
      'Tax Autopilot — automatic tax calculation and return preparation',
      'Compliance Calendar — never miss a filing deadline',
      'Leases & Impairment, AML Screening — for businesses that need them',
    ],
  },
  {
    id: 'ai-assistant',
    title: 'The AI assistant',
    body: [
      'Ask plain-language questions about your finances — “how did revenue do last month?”, “who are my biggest overdue customers?” — and get answers grounded in your real, indexed data, with the sources shown.',
      'The assistant refuses to guess: if it doesn’t have the data, it tells you, rather than making something up. Your questions are never stored as readable text, and the assistant only ever sees your own business’s data.',
    ],
  },
  {
    id: 'settings-security',
    title: 'Settings & security',
    body: ['Manage your business, your team and your security from Settings.'],
    list: [
      'Business profile, currency and exchange rates',
      'Tax engine configuration for your country',
      'Team & Roles with segregation-of-duties controls',
      'Security — two-factor authentication (TOTP), backup codes and idle logout',
      'Appearance — switch between visual themes',
    ],
  },
  {
    id: 'faq',
    title: 'FAQ',
    body: [
      'Do I need to know accounting? No — describe what happened and VousFin handles the double-entry for you. The correct accounting still happens underneath.',
      'Can I trust the numbers? Yes — every entry is balanced and immutable, and reports are derived from the ledger, so they can’t drift. There’s a full audit trail for everything.',
      'Is my data private and isolated? Yes — your data is strictly separated from every other business, encrypted in transit, and never used to train shared models.',
      'How do I get help? Press ⌘K / Ctrl+K and ask, use the feedback option in the app, or email support@vousfin.com.',
    ],
  },
]
