/**
 * accountResolver unit tests
 * Run:  node src/utils/accountResolver.test.js
 *
 * Standalone node script — no test framework needed. Uses dynamic require()
 * over the ESM source via a tiny CJS shim.
 */

'use strict';

// Compile ESM to CJS in-memory via esbuild-less approach: just shell out to node --input-type
// Simpler approach: convert ESM to CJS manually for the test
const path = require('path');
const fs = require('fs');

const src = fs.readFileSync(path.join(__dirname, 'accountResolver.js'), 'utf8')
  // Convert ESM to CJS for this throwaway runtime
  .replace(/export function /g, 'function ')
  .replace(/export const /g, 'const ')
  .replace(/^export \{[^}]+\}$/gm, '');

const wrapper = `${src}
module.exports = { resolveAccount, resolveDebitCreditPair, RESOLVER_CONSTANTS };`;

// Write to a temp file, require it, then clean up
const tmp = path.join(__dirname, '__accountResolver.cjs.tmp.cjs');
fs.writeFileSync(tmp, wrapper, 'utf8');
let resolver;
try { resolver = require(tmp); }
finally { try { fs.unlinkSync(tmp); } catch {} }

const { resolveAccount, resolveDebitCreditPair } = resolver;

// ─── Test harness ────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
const failures = [];
function section(t) {
  console.log('\n────────────────────────────────────────────────────────');
  console.log(`  ${t}`);
  console.log('────────────────────────────────────────────────────────');
}
function assert(c, m) {
  if (c) { console.log(`  ✅  ${m}`); passed++; }
  else   { console.log(`  ❌  ${m}`); failed++; failures.push(m); }
}

// ─── Fixture: typical SME chart of accounts ──────────────────────────────────
const accounts = [
  { _id: 'a1',  accountName: 'Cash at Bank',           accountType: 'Asset',     accountSubtype: 'Bank and Cash',           accountCode: '1010' },
  { _id: 'a2',  accountName: 'Accounts Receivable',    accountType: 'Asset',     accountSubtype: 'Current Assets',          accountCode: '1100' },
  { _id: 'a3',  accountName: 'Inventory',              accountType: 'Asset',     accountSubtype: 'Current Assets',          accountCode: '1200' },
  { _id: 'a4',  accountName: 'Prepaid Expenses',       accountType: 'Asset',     accountSubtype: 'Current Assets',          accountCode: '1250' },
  { _id: 'a5',  accountName: 'Computer Equipment',     accountType: 'Asset',     accountSubtype: 'Non-current Assets',      accountCode: '1510' },
  { _id: 'a6',  accountName: 'Furniture and Fittings', accountType: 'Asset',     accountSubtype: 'Non-current Assets',      accountCode: '1520' },
  { _id: 'a7',  accountName: 'Company Car',            accountType: 'Asset',     accountSubtype: 'Non-current Assets',      accountCode: '1530' },

  { _id: 'l1',  accountName: 'Accounts Payable',       accountType: 'Liability', accountSubtype: 'Current Liabilities',     accountCode: '2010' },
  { _id: 'l2',  accountName: 'GST Payable',            accountType: 'Liability', accountSubtype: 'Current Liabilities',     accountCode: '2050' },
  { _id: 'l3',  accountName: 'WHT Payable',            accountType: 'Liability', accountSubtype: 'Current Liabilities',     accountCode: '2060' },
  { _id: 'l4',  accountName: 'Wages Payable',          accountType: 'Liability', accountSubtype: 'Current Liabilities',     accountCode: '2070' },
  { _id: 'l5',  accountName: 'Accrued Expenses',       accountType: 'Liability', accountSubtype: 'Current Liabilities',     accountCode: '2080' },
  { _id: 'l6',  accountName: 'Unearned Revenue',       accountType: 'Liability', accountSubtype: 'Current Liabilities',     accountCode: '2090' },
  { _id: 'l7',  accountName: 'Loan Payable',           accountType: 'Liability', accountSubtype: 'Non-current Liabilities', accountCode: '2510' },

  { _id: 'r1',  accountName: 'Sales',                  accountType: 'Revenue',   accountSubtype: 'Revenue',                 accountCode: '4010' },
  { _id: 'r2',  accountName: 'Other Revenue',          accountType: 'Revenue',   accountSubtype: 'Revenue',                 accountCode: '4020' },

  { _id: 'e1',  accountName: 'Wages and Salaries',     accountType: 'Expense',   accountSubtype: 'Expenses',                accountCode: '6010' },
  { _id: 'e2',  accountName: 'Rent Expense',           accountType: 'Expense',   accountSubtype: 'Expenses',                accountCode: '6020' },
  { _id: 'e3',  accountName: 'Utilities',              accountType: 'Expense',   accountSubtype: 'Expenses',                accountCode: '6030' },
  { _id: 'e4',  accountName: 'Internet',               accountType: 'Expense',   accountSubtype: 'Expenses',                accountCode: '6035' },
  { _id: 'e5',  accountName: 'Insurance',              accountType: 'Expense',   accountSubtype: 'Expenses',                accountCode: '6040' },
  { _id: 'e6',  accountName: 'Advertising',            accountType: 'Expense',   accountSubtype: 'Expenses',                accountCode: '6060' },
  { _id: 'e7',  accountName: 'Office Supplies',        accountType: 'Expense',   accountSubtype: 'Expenses',                accountCode: '6070' },
  { _id: 'e8',  accountName: 'Professional Fees',      accountType: 'Expense',   accountSubtype: 'Expenses',                accountCode: '6080' },
  { _id: 'e9',  accountName: 'Company Car Expenses',   accountType: 'Expense',   accountSubtype: 'Expenses',                accountCode: '6090' },
  { _id: 'e10', accountName: 'Depreciation Expense',   accountType: 'Expense',   accountSubtype: 'Expenses',                accountCode: '6100' },
];

// ════════════════════════════════════════════════════════════════════════════
section('A — Exact name matches (score = 1.0)');
{
  const r = resolveAccount('Cash at Bank', accounts);
  assert(r.account?._id === 'a1',                  `exact "Cash at Bank" → Cash at Bank`);
  assert(r.score === 1.0,                          `exact match score = 1.0 (got ${r.score})`);
  assert(!r.ambiguous,                             'exact match not ambiguous');
}

section('A2 — Exact code match');
{
  const r = resolveAccount('1010', accounts);
  assert(r.account?._id === 'a1',                  `code "1010" → Cash at Bank`);
}

section('B — Required examples from the spec');
{
  const r1 = resolveAccount('internet expense', accounts);
  assert(r1.account?._id === 'e4',                 `"internet expense" → Internet (got "${r1.account?.accountName}")`);

  const r2 = resolveAccount('bike', accounts, { preferType: 'Asset' });
  assert(r2.account?._id === 'a7',                 `"bike" → Company Car (got "${r2.account?.accountName}")`);

  const r3 = resolveAccount('salary payable', accounts, { preferType: 'Liability' });
  assert(r3.account?._id === 'l4',                 `"salary payable" → Wages Payable (got "${r3.account?.accountName}")`);
}

section('C — Common alias hints');
{
  const tests = [
    ['laptop',           'a5',  'Asset',     'Computer Equipment'],
    ['printer',          null,  'Asset',     null], // no Office Equipment in fixture; should resolve to something or null safely
    ['fuel for car',     'e9',  'Expense',   'Company Car Expenses'],
    ['electricity bill', 'e3',  'Expense',   'Utilities'],
    ['rent for office',  'e2',  'Expense',   'Rent Expense'],
    ['gst output',       'l2',  'Liability', 'GST Payable'],
    ['accrued expense',  'l5',  'Liability', 'Accrued Expenses'],
    ['cash',             'a1',  'Asset',     'Cash at Bank'],
  ];
  tests.forEach(([input, expectedId, type, expectedName]) => {
    const r = resolveAccount(input, accounts, { preferType: type });
    if (expectedId) {
      assert(r.account?._id === expectedId, `"${input}" → ${expectedName} (got "${r.account?.accountName}")`);
    } else {
      // For unmatchable ones we just ensure no crash
      assert(r.account === null || typeof r.account === 'object', `"${input}" handled gracefully (got "${r.account?.accountName || 'null'}")`);
    }
  });
}

section('D — Type filter blocks wrong-side matches');
{
  // "sales" → Revenue. If caller asks for Asset, must NOT pick "Sales".
  const r = resolveAccount('sales', accounts, { preferType: 'Asset' });
  assert(r.account?.accountType !== 'Revenue', `"sales" with preferType=Asset doesn't pick Sales (got "${r.account?.accountName || 'null'}")`);
}

section('E — Substring containment');
{
  const r = resolveAccount('insurance', accounts);
  assert(r.account?._id === 'e5', `"insurance" → Insurance (got "${r.account?.accountName}")`);

  const r2 = resolveAccount('professional', accounts);
  assert(r2.account?._id === 'e8', `"professional" → Professional Fees (got "${r2.account?.accountName}")`);
}

section('F — Empty / nonsense input returns null');
{
  const r1 = resolveAccount('', accounts);
  assert(r1.account === null, 'empty string → null');
  const r2 = resolveAccount('xyzqwerty12345', accounts);
  assert(r2.account === null, 'garbage → null');
}

section('G — DR/CR pair: avoids same-side collision');
{
  // Both suggestions match "Cash at Bank" — resolver must drop one
  const r = resolveDebitCreditPair('cash', 'cash at bank', accounts);
  const dRes = r.debit.account?._id, cRes = r.credit.account?._id;
  assert(dRes !== cRes || (!dRes && !cRes), `DR ≠ CR (DR=${dRes}, CR=${cRes})`);
}

section('H — Candidates list for ambiguous picks');
{
  const r = resolveAccount('office', accounts);
  assert(Array.isArray(r.candidates), 'candidates list returned');
  // "office" could match Office Supplies, Office Equipment etc.
  assert(r.candidates.length >= 1, `at least 1 candidate (got ${r.candidates.length})`);
}

section('I — Levenshtein fallback for typos');
{
  const r = resolveAccount('Recievable', accounts);  // typo: i & e swapped
  assert(r.account?._id === 'a2', `typo "Recievable" → Accounts Receivable (got "${r.account?.accountName}")`);
}

// ════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════════════════════════════════');
console.log(`  accountResolver: ${passed} passed, ${failed} failed`);
console.log('══════════════════════════════════════════════════════════');
if (failed > 0) {
  console.log('\nFailures:');
  failures.forEach(f => console.log(`  - ${f}`));
  process.exit(1);
}
