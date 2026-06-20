# Landing — Smoothness & Showcase Fixes

**Goal:** Kill the lag, make scrolling buttery (agency-grade), and fix the "See vousFin in motion" section (image-before-text sync + "stuck/boring" pin).

**Reconciliation (brainstorm):** user wants heavy animation AND smooth scroll on a GPU-limited laptop. Resolution: make existing effects *cheaper/adaptive* + add Lenis smooth-scroll; do NOT add GSAP/ScrollTrigger/Three (would worsen lag, overlaps framer). Stack stays React+Vite+Tailwind+framer-motion + **Lenis** + the budgeted OGL shader.

## Phase A — Lenis smooth scroll
- [ ] `npm i lenis`. Add `hooks/useLenis.js` — init Lenis with a rAF loop (lerp ~0.1), `prefers-reduced-motion` → skip, mount in `LandingPage`, destroy on unmount (never affects the authed app). Native-scroll based so framer `useScroll`/`whileInView` + IntersectionObserver keep working.

## Phase B — Kill the WebGL lag (LiquidGoldCanvas)
- [ ] Render at **capped low internal resolution** (≤640px long edge, dpr 1) and CSS-stretch to full — soft field looks identical, ~1/8th the fragment work.
- [ ] **Cap to ~30fps** in the rAF loop. Reduce fbm octaves 4→3.
- [ ] Keep existing pause-offscreen / pause-hidden / reduced-motion-skip guards.

## Phase C — Fix ShowcaseScroll ("See vousFin in motion")
- [ ] **Sync image + copy**: both currently key on `active` but the image overlap-crossfades immediately while the copy uses `mode="wait"` (exit-then-enter) → text lags the picture. Make both crossfade together (copy in an absolute, min-height container; matched 0.4–0.5s timing).
- [ ] **Less "stuck"**: reduce driver height 78vh→~58vh per step so it advances sooner; add subtle through-step life (screenshot scale/parallax) so the pin never feels frozen.
- [ ] Re-verify pin (overflow-x:clip), step progression, desktop+mobile.

## Verify
- [ ] 1 WebGL ctx, 0 console errors, lint clean, build green, no horizontal overflow; scroll feels smooth; showcase text+image change together; pin feels active.
