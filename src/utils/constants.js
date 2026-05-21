export const ROLES = { ADMIN: 'admin', CUSTOMER: 'customer' }

export const TRANSACTION_TYPES = {
  EXPENSE: 'Expense',
  INCOME: 'Income',
  TRANSFER: 'Transfer',
}

export const TRANSACTION_STATUS = {
  POSTED: 'posted',
  REVERSED: 'reversed',
}

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  TRANSACTIONS: '/transactions',
  CREATE_TRANSACTION: '/transactions/new',
  REPORTS_INCOME: '/reports/income-statement',
  REPORTS_BALANCE: '/reports/balance-sheet',
  REPORTS_CASHFLOW: '/reports/cash-flow',
  REPORTS_EXPORT: '/reports/export',
  AI_ASSISTANT: '/ai/assistant',
  AI_FORECAST: '/ai/forecast',
  AI_ANOMALIES: '/ai/anomalies',
  BUSINESS_SETUP: '/business/setup',
  BUSINESS_SETTINGS: '/business/settings',
  SETTINGS: '/settings',
  ADMIN: '/admin',
  ADMIN_CUSTOMERS: '/admin/customers',
}

export const KPI_LABELS = {
  revenue: 'Revenue',
  expenses: 'Expenses',
  netProfit: 'Net Profit',
  cashBalance: 'Cash Balance',
  profitMargin: 'Profit Margin',
  accountsReceivable: 'Accounts Receivable',
  accountsPayable: 'Accounts Payable',
}

export const SUGGESTED_PROMPTS = [
  'What was my net profit last month?',
  'Show top expense categories',
  'How can I improve cash flow?',
  'Summarize accounts receivable',
]
