/**
 * haptics — the one feedback tap (Mobile Easy §5).
 * A 10ms pulse on supported devices; silently a no-op elsewhere
 * (iOS Safari has no vibrate API — the visual toast carries feedback there).
 */
export function vibrate(ms = 10) {
  try { navigator?.vibrate?.(ms) } catch { /* no-op */ }
}
