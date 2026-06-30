/**
 * actions.js — re-type create-flow entries as quick actions so the command bar
 * can surface "do" results (New Invoice, Run Payroll) distinctly from "go" pages.
 */
const ACTION_TITLE = /^(new|run|create|add|record)\s/i

export function isAction(entry) {
  return /\/new$/.test(entry.href || '') || ACTION_TITLE.test(entry.title || '')
}

export function withActions(entries) {
  return entries.map((e) =>
    e.type === 'page' && isAction(e) ? { ...e, type: 'action' } : e
  )
}
