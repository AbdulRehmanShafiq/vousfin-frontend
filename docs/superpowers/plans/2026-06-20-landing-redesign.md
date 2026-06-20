# VousFin Landing Page Redesign — Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the landing page to be *buttery-smooth* (60fps on a mid laptop) and visually 9.5/10 — fixing the black-band bug and the lag, with cohesive, varied, performant section reveals.

**Architecture:** Performance-first. Strip every continuous GPU/CPU hog (WebGL, animated blur, animated mix-blend grain, particle canvas, shimmer-on-every-heading). Replace heavy atmosphere with cheap, pre-baked gradients that move only via `transform`. Introduce ONE shared, reduced-motion-aware motion vocabulary used across all sections. Rebuild the product showcase so it fills the viewport (no dark void).

**Tech Stack:** React 19, framer-motion v12 (transform/opacity only), Tailwind, real product screenshots. NO three.js. NO particle canvas.

**Design system (UI-UX-PRO-MAX, fintech):** luxury-dark gold (keep brand = app's "atelier" theme). Playfair Display + Inter. Transitions 200–300ms, expo-out `[0.16,1,0.3,1]`. AA contrast. SVG/Lucide icons only. Responsive 375/768/1024/1440. Repeated CTA. Anti-patterns to avoid: harsh/continuous animation, neon, purple/pink AI gradients.

---

## Phase 1 — Performance foundation (the "buttery" prerequisite)

**Files:** `sections/Hero.jsx`, `LandingPage.jsx`, `landing.css`, `components/CustomCursor.jsx`, delete usage of `GoldTorusScene`/`ParticleCanvas`.

- [ ] **1.1** Remove `GoldTorusScene` (three.js) from Hero + its lazy import. Replace the hero visual backdrop with a cheap static gold radial-glow + one slow `transform`-only drifting blob (no `filter` animation). Keeps the 520 kB three chunk out of the logged-out bundle entirely.
- [ ] **1.2** Remove `ParticleCanvas` from Hero.
- [ ] **1.3** `landing.css`: 
  - `.vf-grain` → static (remove `animation`, remove `mix-blend-mode`; keep ultra-low-opacity noise as plain overlay) OR drop entirely.
  - `.vf-aurora` → remove `filter: blur(40px)` + the scale animation; bake softness into the radial-gradients themselves; if it moves, move via `translate3d` only and slowly. Lower cost.
  - `.text-gold-gradient` → remove the infinite `vfShimmer` animation (static gradient). Add an opt-in `.text-gold-shimmer` for the ONE hero word only.
  - `.glass-card` / `.vf-glass-pro` → cut `backdrop-filter` to a single light blur or replace with solid translucent bg + border + shadow (backdrop-blur kept ONLY on fixed nav).
- [ ] **1.4** `CustomCursor`: drop `mix-blend-mode: difference` (full-screen recomposite). Keep dot+ring with plain colors; keep rAF lerp (one cheap loop).
- [ ] **1.5** Hero orbs: reduce `blur-[120px]/[100px]` → `blur-[70px]` and fewer; prefer baked radial-gradient.
- [ ] **1.6** Verify: scroll the full page in preview, confirm no continuous WebGL, check `preview_logs`/console clean, confirm three chunk absent from build for the landing entry.

## Phase 2 — Motion vocabulary (cohesive + varied + smooth)

**Files:** new `components/Reveal.jsx` (+ variants), apply across sections.

- [ ] **2.1** Create `Reveal` wrapper: `whileInView` + `viewport={{ once:true, amount:0.2 }}`, variants `rise|fade|scaleIn|blurFade(opacity-only)|left|right`, `stagger` container, duration 0.5–0.7, ease expo-out, reduced-motion → instant. `will-change` only while animating.
- [ ] **2.2** Replace ad-hoc per-section variants with `Reveal` so every section reveals consistently but with assigned variant (alternate left/right, scale for cards, clip for headlines).
- [ ] **2.3** Keep the scroll-progress bar (transform scaleX — cheap). Keep marquee (CSS transform).

## Phase 3 — Product showcase rebuild (kills the black band)

**Files:** rewrite `sections/ShowcaseScroll.jsx`.

- [ ] **3.1** Replace the 450vh sticky/centered-small-window layout. New: sticky section sized `100svh`, driver height `~(steps)*65vh`, with the **app window large (fills the panel)** and copy beside it, plus a section background panel so there is never an empty dark void. Progress via a single cheap rAF state toggle (already works) OR IntersectionObserver sentinels.
- [ ] **3.2** Ensure it fills on all viewport heights (`svh`/`dvh`), content vertically centered with minimal empty space; verify no black band at any scroll offset and step transitions are smooth crossfades.
- [ ] **3.3** Reduced-motion fallback = stacked gallery (keep).

## Phase 4 — Polish & checklist (UI-UX-PRO-MAX pre-delivery)

- [ ] **4.1** `cursor-pointer` + visible `focus-visible` rings on all interactive elements; hover transitions 150–300ms.
- [ ] **4.2** Contrast pass (muted text `#A89B8C` on `#12100E` ≥ AA for body sizes; bump where needed).
- [ ] **4.3** Responsive audit at 375 / 768 / 1024 / 1440 (Hero, Showcase, Bento, Pricing).
- [ ] **4.4** Final live verification: smooth scroll, all CTAs work, 0 console errors, lint clean (landing), build green. Capture proof.

---

## Self-review
- Black band → Phase 3.1/3.2 directly. 
- Lag → Phase 1 removes all continuous WebGL/blur/mix-blend/particle/shimmer loops.
- Smooth reveals → Phase 2 shared expo-out vocabulary.
- Brand kept (gold/atelier) so login→dashboard stays consistent.
