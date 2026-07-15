/**
 * Split-view helpers for the Inspector (redesign spec §7.2).
 * Separate module so Inspector.jsx stays component-only (fast-refresh safe).
 */

/** Pages use this to decide peek-vs-navigate on row click: ≥xl gets the
 *  right-side Inspector (list context kept), smaller screens route-push. */
export function wideEnoughForInspector() {
  return typeof window !== 'undefined' && window.matchMedia('(min-width: 1280px)').matches
}
