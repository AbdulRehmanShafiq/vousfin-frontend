# VousFin Landing — Cinematic Gold Redesign ("The Living Ledger")

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax. Execute phase-by-phase; verify in preview after each phase; keep the page at 60fps.

**Goal:** A tournament-grade, *buttery-smooth* luxury-gold fintech landing with one cinematic centerpiece and a cohesive scroll story — without bringing back the lag.

**Creative concept — "The Living Ledger":** a near-black stage where warm gold light behaves like liquid/aurora, and the *real product* emerges from the dark as you scroll. Editorial Playfair display + clean Inter. Every scroll beat reveals a product truth (real screenshots already integrated). The signature feeling is *weighty, expensive, calm* — not busy.

**Decisions (from brainstorming):** keep+enhance gold; cinematic-but-budgeted (ONE centerpiece); transform existing + rebuild within. Grounded by UI-UX-PRO-MAX design engine → "premium dark + gold accent", Dark-Mode(OLED) style, Satoshi/Inter type, anti-pattern = light bg / harsh motion.

**Tech:** React 19 + framer-motion v12 + Tailwind. ONE micro-WebGL centerpiece via **OGL** (~10 kB, vs three's 520 kB) — single fullscreen fragment-shader quad. NO particles, NO scroll-scrubbed video, NO animated blur/mix-blend.

---

## NON-NEGOTIABLE PERFORMANCE BUDGET (applies to every task)
- **Max ONE WebGL context** on the whole page (the hero). Capped DPR ≤ 1.5. **Paused** when offscreen (IntersectionObserver), when tab hidden (visibilitychange), and entirely skipped under `prefers-reduced-motion` (→ static gold radial fallback).
- Animate **transform/opacity only**. No `filter: blur()` animation, no `mix-blend-mode` on animated/full-screen layers, no `backdrop-filter` except the fixed nav.
- Section reveals via `whileInView once:true` (IntersectionObserver) — no persistent scroll listeners except the (already DOM-mutating, render-free) showcase rAF.
- `will-change` only while animating. Verify: 0 extra WebGL contexts beyond hero, no console errors, build green, no horizontal overflow, smooth at 1366×768 and 375px.

---

## Phase 0 — Design tokens & motion foundation
**Files:** `landing.css`, new `components/Reveal.jsx`, new `hooks/useInViewOnce.js` (or reuse framer `whileInView`).

- [ ] **0.1** Add enhanced-gold tokens/utilities to `landing.css` (scoped `.vf-landing`):
  - `.text-gold-liquid` — richer multi-stop gold gradient text (static by default; shimmer opt-in only).
  - `.vf-liquidglass` — premium **gold** liquid-glass border frame via `::before` + `mask-composite: exclude` (sharp 1.4px gradient edge) — **no backdrop-filter** (cheap). Inspired by the reference liquid-glass, recolored gold.
  - `.vf-divider-fade` — section-to-section dark→light→dark seam (gold hairline + soft vignette) for smooth flow.
- [ ] **0.2** Create `Reveal.jsx`: a single wrapper exposing variants `rise | fade | scaleIn | blurLight(opacity-only) | left | right | clipUp` + a `stagger` container. `whileInView`, `viewport={{ once:true, amount:0.2 }}`, ease `[0.16,1,0.3,1]`, 0.5–0.7s, reduced-motion → instant. Replaces ad-hoc per-section variants so sections feel varied yet cohesive.
- [ ] **0.3** Verify build + no visual regressions.

## Phase 1 — Cinematic hero centerpiece (the ONE indulgence)
**Files:** new `components/LiquidGoldCanvas.jsx`, `sections/Hero.jsx`, `package.json` (add `ogl`).
- [ ] **1.1** `npm i ogl`. Build `LiquidGoldCanvas`: one OGL `Renderer` + fullscreen triangle, fragment shader = slow flowing gold "liquid light" (domain-warped noise in gold ramp `#0d0b09→#8a6f42→#C8A96E→#F5E6C8`). Uniforms: time, resolution, pointer (subtle). **Budget:** DPR `Math.min(1.5, devicePixelRatio)`, `IntersectionObserver` pause when hero offscreen, `document.hidden` pause, `cancelAnimationFrame` + `gl.getExtension('WEBGL_lose_context')` cleanup on unmount.
- [ ] **1.2** Gate: render `<LiquidGoldCanvas/>` only when `!prefersReducedMotion`; otherwise a static CSS gold radial (`bg-hero-glow`). Lazy-load the component so its chunk loads only for logged-out + motion-on (never in the authed app bundle).
- [ ] **1.3** Hero composition: per-letter mask-reveal headline (keep), subcopy, **magnetic** dual CTAs (Start Free Trial→/register, Watch Demo→demo modal), trust row; right column = real dashboard in `AppWindow` with `InteractiveTilt` over the liquid-gold field; scroll-linked parallax (`useScroll`/`useTransform`, transform/opacity only). Scroll cue.
- [ ] **1.4** Verify: exactly 1 WebGL context, paused when scrolled away & on hidden tab, reduced-motion → static, no console errors, 60fps feel. Screenshot proof.

## Phase 2 — Signature scroll story (buttery, varied)
**Files:** `LandingPage.jsx`, each section.
- [ ] **2.1** Apply `Reveal` across sections with *assigned, varied* transitions: Features=scaleIn stagger; HowItWorks=alternating left/right; AIPower=clipUp; Pricing=rise stagger; FAQ=fade. Cohesive easing, distinct feel per section.
- [ ] **2.2** Keep the **fixed** ShowcaseScroll scrollytelling (sticky pins via `overflow-x:clip`); enhance: add a thin scroll-progress sub-rail + smoother crossfade; confirm pin on desktop+mobile.
- [ ] **2.3** Add `.vf-divider-fade` seams between major sections so the page flows as one continuous cinematic scroll (no hard section edges).
- [ ] **2.4** Keep scroll-progress bar (transform scaleX) + trust marquee (CSS transform). Verify smoothness end-to-end.

## Phase 3 — Enhance the gold sections (transform + rebuild within)
**Files:** `Features.jsx`, `ModulesBento.jsx`, `AIPower.jsx`, `Pricing.jsx`, `Testimonials.jsx`, `Hero/AppWindow`.
- [ ] **3.1** Apply `.vf-liquidglass` gold border frames to feature/bento/pricing cards + `AppWindow` for a premium "liquid gold" edge (cheap, no blur).
- [ ] **3.2** Features: swap the stock concept images for a cleaner gold-iconography or real-screenshot treatment; varied hover (color/shadow, no layout-shifting scale).
- [ ] **3.3** Testimonials: keep the new vertical-marquee wall (3 columns, alt directions, pause-on-hover, mask) — confirm performance (CSS transform) + reduced-motion grid fallback.
- [ ] **3.4** Pricing/AIPower/Bento: polish spacing, focus-visible, cursor-pointer, hover 150–300ms.

## Phase 4 — Polish, a11y, every-button, verify (UI-UX-PRO-MAX checklist)
- [ ] **4.1** All clickables: `cursor-pointer`, visible `focus-visible` ring, hover 150–300ms. Every CTA/link routes correctly (register/login/demo/anchors).
- [ ] **4.2** Contrast ≥ 4.5:1 for body; SVG icons only (no emoji); alt text on images.
- [ ] **4.3** Responsive audit 375 / 768 / 1024 / 1440 (hero, showcase, bento, pricing, testimonial wall).
- [ ] **4.4** Final live verification: 1 WebGL ctx, 0 console errors, no horizontal scroll, lint clean (landing), build green, smooth scroll. Capture proof. Commit + push.

## Optional asset pipeline (higgsfield) — BLOCKED on user auth
- If the user runs `higgsfield auth login`, generate a 6–8s seamless looping "liquid gold" hero clip; if it's lighter to decode than the shader on low-end machines, offer it as an alternate hero backdrop (`<video>` with the static fallback). Until then, the OGL shader is the centerpiece.

---

## Self-review
- "Cinematic but budgeted" → Phase 1 single OGL centerpiece with hard pause/cap/fallback rules.
- "Keep+enhance gold" → Phase 0 liquid-gold tokens + Phase 3 liquid-glass gold edges; design engine concurs.
- "Buttery + 3D scroll" → Phase 2 varied Reveal vocabulary + kept scrollytelling + section seams.
- "Transform + rebuild within" → keep fixed sections, rebuild hero + testimonials + card treatments.
- Lag guard → the global performance budget, enforced per phase.
