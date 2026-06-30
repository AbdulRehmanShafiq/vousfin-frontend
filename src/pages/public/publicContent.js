/**
 * publicContent.js — content for the public company + legal pages, rendered by
 * PublicContentPage. Each doc: { title, updated?, intro?, sections: [{ heading,
 * body?: string[], list?: string[] }] }. Plain, honest copy (no lorem).
 */

const SUPPORT_EMAIL = 'support@vousfin.com'

export const CONTENT = {
  // ── Company ──────────────────────────────────────────────────────────────
  about: {
    title: 'About VousFin',
    intro: 'VousFin is an AI-powered smart accountant that does almost all of a small business’s bookkeeping automatically — while keeping every number correct and explainable.',
    sections: [
      {
        heading: 'Why we built it',
        body: [
          'Most small businesses can’t afford a full-time accountant, and most accounting software still expects you to think like one. VousFin flips that around: you describe what happened in plain language, and the system does the double-entry bookkeeping, reconciliation, tax, and reporting for you.',
          'Under the hood it is a real, audit-grade accounting engine — every transaction produces a balanced journal entry, nothing is ever silently overwritten, and every report is derived from the ledger rather than stored separately. The AI assists; it never invents the books.',
        ],
      },
      {
        heading: 'What it does',
        list: [
          'Auto-categorises and posts transactions with correct double-entry accounting',
          'Reconciles banks, matches invoices and bills, and tracks who owes what',
          'Generates IFRS-ready financial statements, tax summaries and cash forecasts',
          'Flags anomalies and likely mistakes before they become problems',
          'Answers plain-language questions about your finances from your real data',
        ],
      },
      {
        heading: 'Our principle',
        body: [
          'Accounting correctness is always more important than convenience. We will never trade the integrity of your records for a nicer screen or a faster shortcut. If a feature risks corrupting your books, we redesign it.',
        ],
      },
    ],
  },

  contact: {
    title: 'Contact us',
    intro: 'We’re a small team and we read everything. Here’s how to reach us.',
    sections: [
      {
        heading: 'Support',
        body: [`For help with your account, billing or a bug: email ${SUPPORT_EMAIL} and we’ll get back to you, usually within one business day.`],
      },
      {
        heading: 'Inside the app',
        body: ['Already signed in? Use the feedback option in the user menu, or press ⌘K / Ctrl+K and ask the assistant — it can answer most “how do I…” questions instantly.'],
      },
      {
        heading: 'Security reports',
        body: [`Found a security issue? Please email ${SUPPORT_EMAIL} with the details and we’ll respond quickly. See our Security page for what we expect and how we handle disclosures.`],
      },
    ],
    cta: { label: `Email ${SUPPORT_EMAIL}`, href: `mailto:${SUPPORT_EMAIL}` },
  },

  careers: {
    title: 'Careers',
    intro: 'VousFin is built by a small, product-obsessed team that cares deeply about correctness and craft.',
    sections: [
      {
        heading: 'How we work',
        list: [
          'Correctness first — we hold the accounting engine to a very high bar',
          'Small team, high ownership — you ship real things end to end',
          'Plain language for users, rigorous engineering underneath',
        ],
      },
      {
        heading: 'Open roles',
        body: ['We don’t always have formal openings posted, but we’re always glad to hear from exceptional engineers, designers and accountants who like this problem space.'],
      },
      {
        heading: 'Get in touch',
        body: [`Send a short note about what you’d love to work on, plus anything you’ve built, to ${SUPPORT_EMAIL}.`],
      },
    ],
    cta: { label: 'Introduce yourself', href: `mailto:${SUPPORT_EMAIL}?subject=Careers` },
  },

  blog: {
    title: 'Blog',
    intro: 'Notes on building a trustworthy, AI-powered accounting platform.',
    sections: [
      {
        heading: 'Coming soon',
        body: ['We’re putting together write-ups on how VousFin keeps the ledger correct, how the AI assistant stays grounded in your real data, and practical guides for running your books.'],
      },
      {
        heading: 'In the meantime',
        body: ['The Documentation has a full end-to-end guide to how VousFin works and how to use every module.'],
      },
    ],
    cta: { label: 'Read the documentation', href: '/docs' },
  },

  // ── Legal ────────────────────────────────────────────────────────────────
  privacy: {
    title: 'Privacy Policy',
    updated: 'Last updated: June 2026',
    intro: 'This policy explains what data VousFin collects, why, and the choices you have. We aim to collect as little as possible and to never sell your data.',
    sections: [
      { heading: 'What we collect', list: [
        'Account details you provide (name, email, business information)',
        'The financial data you enter or import so we can keep your books',
        'Basic usage and device information needed to run and secure the service',
      ] },
      { heading: 'How we use it', body: ['We use your data only to provide the service: to maintain your accounting records, generate reports, power AI features on your own data, and keep your account secure. We do not sell your data or use your financial records to train shared models.'] },
      { heading: 'AI features and your data', body: ['When you use AI features, only the minimum context needed to answer is used, business summaries are redacted of personal identifiers where possible, and your questions are stored only as one-way hashes — never as readable text tied to you. Your data stays isolated to your business.'] },
      { heading: 'Data sharing', body: ['We share data only with infrastructure providers needed to operate the service (for example hosting, database and email delivery), under appropriate agreements, and where required by law.'] },
      { heading: 'Retention and your rights', body: ['Financial records are kept for as long as your account is active and as required by accounting and tax law. You can request access to, correction of, or deletion of your personal data — subject to legal record-keeping obligations — by contacting us.'] },
      { heading: 'Contact', body: [`Questions about privacy? Email ${SUPPORT_EMAIL}.`] },
    ],
  },

  terms: {
    title: 'Terms of Service',
    updated: 'Last updated: June 2026',
    intro: 'These terms govern your use of VousFin. By using the service you agree to them. Please read them carefully.',
    sections: [
      { heading: 'Your account', body: ['You are responsible for keeping your login credentials secure and for the activity under your account. You must provide accurate information and use the service in compliance with applicable laws.'] },
      { heading: 'The service', body: ['VousFin helps you keep accounting records and produce reports. While we work hard to keep the accounting engine correct, you remain responsible for reviewing your records and for your own tax and regulatory filings. VousFin is a tool, not a substitute for a licensed accountant or legal advice.'] },
      { heading: 'Acceptable use', list: [
        'Don’t attempt to break, overload, or gain unauthorised access to the service',
        'Don’t use the service to store unlawful content or to violate others’ rights',
        'Don’t resell or misrepresent the service',
      ] },
      { heading: 'Availability and changes', body: ['We may update, improve or change features over time. We aim for high availability but the service is provided “as is” without warranty of uninterrupted operation.'] },
      { heading: 'Liability', body: ['To the maximum extent permitted by law, VousFin is not liable for indirect or consequential losses. Nothing in these terms limits liability that cannot be limited by law.'] },
      { heading: 'Contact', body: [`Questions about these terms? Email ${SUPPORT_EMAIL}.`] },
    ],
  },

  security: {
    title: 'Security',
    updated: 'Last updated: June 2026',
    intro: 'Security and the integrity of your financial records are core to VousFin. Here’s how we protect them.',
    sections: [
      { heading: 'Data protection', list: [
        'All traffic is encrypted in transit (TLS)',
        'Strict multi-tenant isolation — your data is never mixed with another business’s',
        'Authentication with optional two-factor (TOTP) and automatic idle logout',
      ] },
      { heading: 'Integrity of your books', body: ['Financial history is immutable: journal entries, payments and audit logs are never deleted or silently changed. Corrections happen through proper reversing and adjustment entries, so there is always a complete, explainable audit trail of who changed what, when and why.'] },
      { heading: 'AI safety', body: ['AI features are grounded in your real data and refuse to answer rather than fabricate. Questions are logged only as one-way hashes, and bulk data-extraction requests are blocked.'] },
      { heading: 'Reporting a vulnerability', body: [`If you believe you’ve found a security issue, please email ${SUPPORT_EMAIL} with details and steps to reproduce. Please don’t publicly disclose it until we’ve had a chance to fix it. We appreciate responsible disclosure.`] },
    ],
  },

  gdpr: {
    title: 'GDPR & Data Protection',
    updated: 'Last updated: June 2026',
    intro: 'We respect data-protection rights, including those under the GDPR, for users in applicable regions.',
    sections: [
      { heading: 'Your rights', list: [
        'Access — get a copy of the personal data we hold about you',
        'Rectification — correct inaccurate personal data',
        'Erasure — request deletion, subject to legal record-keeping duties',
        'Portability — receive your data in a structured, machine-readable format',
        'Objection and restriction — limit certain processing',
      ] },
      { heading: 'Lawful basis', body: ['We process personal data to perform our contract with you (providing the service), to comply with legal obligations (such as accounting and tax record-keeping), and for our legitimate interests in operating and securing the service.'] },
      { heading: 'Data processors', body: ['We use a limited set of infrastructure providers (hosting, database, email) as data processors under appropriate agreements, and only to the extent needed to run the service.'] },
      { heading: 'Exercising your rights', body: [`To make a request, email ${SUPPORT_EMAIL}. We’ll respond within the timeframes required by applicable law. Note that some financial records must be retained to meet accounting and tax obligations.`] },
    ],
  },
}

export const CONTENT_KEYS = Object.keys(CONTENT)
