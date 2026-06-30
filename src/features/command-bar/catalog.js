/**
 * catalog.js — flatten nav.config MODULES into searchable command-bar entries.
 * This is the SINGLE source of truth: never hand-maintain a parallel list.
 *
 * Enablement mirrors the nav exactly (opt-out): a module is "optional" when it is
 * neither alwaysOn nor pinBottom, and optional modules are visible unless the
 * business has explicitly disabled them (see filter.js + useModulesStore).
 */
import { SYNONYMS } from './synonyms'

export function slug(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function tokens(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
}

/**
 * @param {Array} modules  the MODULES array from nav.config.js
 * @returns {Array<Entry>}
 *   Entry = { id, type:'module'|'page'|'action', title, path:string[], href,
 *             icon:Component, synonyms:string[], moduleKey, enablementKey:string|null }
 */
export function deriveCatalog(modules) {
  const entries = []
  for (const m of modules) {
    const optional = m.alwaysOn !== true && m.pinBottom !== true
    const enablementKey = optional ? m.key : null

    entries.push({
      id: m.key,
      type: 'module',
      title: m.name,
      path: [m.name],
      href: m.href,
      icon: m.icon,
      desc: m.subtitle || '',
      synonyms: [...tokens(m.subtitle), ...tokens(m.tag), ...(SYNONYMS[m.key] || [])],
      moduleKey: m.key,
      enablementKey,
    })

    for (const item of m.items || []) {
      const id = `${m.key}.${slug(item.name)}`
      entries.push({
        id,
        type: 'page',
        title: item.name,
        path: [m.name, item.name],
        href: item.href,
        icon: item.icon,
        desc: item.desc || '',
        synonyms: [
          ...tokens(item.desc), ...tokens(m.tag), ...tokens(m.name),
          ...(SYNONYMS[id] || []),
        ],
        moduleKey: m.key,
        enablementKey,
      })
    }
  }
  return entries
}
