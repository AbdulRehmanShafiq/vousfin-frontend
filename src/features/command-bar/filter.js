/**
 * filter.js — hide entries for modules this business has disabled.
 *
 * Mirrors the nav's opt-out model exactly: a module is visible when it is
 * always-on/pinned (enablementKey === null) OR it is not in the disabled list.
 * (See useModulesStore: isEnabled = (key) => !disabled.includes(key).)
 */
export function filterByDisabled(entries, disabledModuleKeys = []) {
  const disabled = new Set(disabledModuleKeys)
  return entries.filter((e) => e.enablementKey == null || !disabled.has(e.enablementKey))
}
