# Landing Page Integration — Design Spec

**Date:** 2026-06-19
**Goal:** Integrate the Kimi-generated VousFin landing page into the real frontend as the public home page, with every button working and rich, performant animation (framer-motion + anime.js + lightweight 3D + interactive scroll), fully self-contained inside `vousfin-frontend-main` (and any backend needs inside `vousfin-backend-main`).
**Status:** Approved for planning (user answered the 3 brainstorming questions; pre-authorized carry-through to implementation).

## Source

The zip `Kimi_Agent_vousFin.zip` contains two builds; **`vousfin-v2`** is the chosen base (React 19 + framer-motion + lucide-react + Tailwind — matches our stack — plus real images, a particle canvas, and a `design.md`). Sections: `Hero, Features, AIPower, ModulesBento, StatsCounter, CTA, Footer`, a `Navigation`, and a `ParticleCanvas`. Palette: luxury gold (`#C8A96E`) on warm-black (`#12100E`), Playfair Display / Inter / JetBrains Mono.

## Decisions (from brainstorming)

1. **Routing:** Public `/` for logged-out visitors → render the landing. Logged-in users keep going to setup/dashboard. (Change `RootRedirect` only.)
2. **Buttons:** Start Free Trial / Get Started / CTA primary → `/register`. New **Login** affordance → `/login`. Watch Demo → smooth-scroll to the showcase (AI Power) section. Nav anchor links → smooth in-page scroll.
3. **Animation toolset:** Best-fit + lightweight 3D. Use framer-motion (already in the page) + **anime.js** + a **lightweight Three.js** hero accent + interactive scroll. **Skip Barba.js** (fights React Router — use framer route transitions instead) and **skip Rive** (needs a designer-authored `.riv` asset we can't produce; deliver the same "interactive animated mark" intent via anime.js/SVG). Both documented as non-goals.

## Architecture

### Placement & isolation (the core integration concern)
- All landing code lives in **`src/pages/landing/`**: `LandingPage.jsx` (the former `App.jsx`), `sections/*`, `components/*`, `hooks/useReducedMotion.js`, and **`landing.css`**.
- `LandingPage.jsx` wraps everything in a single root: `<div className="vf-landing"> … </div>` and imports `landing.css` once.
- **`landing.css`** owns the entire landing design system, **scoped under `.vf-landing`** so it neither bleeds into the app nor is affected by the app's 4-theme token system:
  - Base: `.vf-landing { background:#12100E; color:#F5F0E8; font-family:Inter… }`.
  - Font overrides (higher specificity than Tailwind's single-class utilities, so they win without `!important`): `.vf-landing .font-display{font-family:'Playfair Display',Georgia,serif}`, `.vf-landing .font-body{font-family:Inter…}`, `.vf-landing .font-mono{font-family:'JetBrains Mono',monospace}`. This neutralises the **`font-display` collision** (app maps it to Fraunces).
  - Composite utility classes the components use, as plain scoped CSS (hardcoded hex): `.text-gold-gradient`, `.text-rose-gradient`, `.glass-card`, `.glass-nav`, `.glow-gold`, `.glow-gold-strong`, `.border-gold-subtle`, `.bg-gold-gradient`, `.bg-rose-gradient`, `.bg-hero-glow`, `.bg-gold-glow`, `.bg-card-gradient`, `.content-max`, `.section-padding`.
  - Keyframes + classes: `.animate-float`, `.animate-pulse-glow`, `.animate-shimmer` (with `@keyframes float/pulseGlow/shimmer`).
  - `@media (prefers-reduced-motion: reduce)` neutralises the keyframe animations.
- **Color tokens → arbitrary hex.** The components' named Tailwind color utilities are converted to arbitrary values so they need **zero `tailwind.config` change** and cannot collide with the app's `gold` theme var:
  `bg-dark→bg-[#12100E]`, `text-gold→text-[#C8A96E]`, `bg-gold→bg-[#C8A96E]`, `bg-gold/[0.15]→bg-[#C8A96E]/15`, `border-gold/30→border-[#C8A96E]/30`, `text-teal→text-[#7EB5A6]`, `bg-teal/[0.10]→bg-[#7EB5A6]/10`, `text-cream→text-[#F5F0E8]`, `text-cream-muted→text-[#A89B8C]`, `text-cream-dim→text-[#6B6259]`, `text-gold-light→text-[#D4B87A]`, `text-burgundy→text-[#6B1D2B]`, `text-rose→text-[#C4886A]`. (Most of the page already uses hex literals; this only touches the few named ones.) Standard Tailwind utilities (flex/grid/spacing/rounded/blur/etc.) work unchanged in the app's Tailwind build.
- **No edits to `tailwind.config.js` or the global theme.** The only global touch is loading the three webfonts (Google Fonts `<link>` in `index.html`), applied scoped.

### Routing
- `src/routes.jsx`: lazy `const LandingPage = lazy(() => import('@/pages/landing/LandingPage'))`.
- `RootRedirect`: when **not authenticated**, return `withSuspense(LandingPage)` (currently returns `<Navigate to="/login"/>`). Authenticated branches unchanged. The catch-all `*` keeps redirecting to `RootRedirect` so unknown public URLs still land sensibly.
- Landing is its own lazy chunk → framer-motion/anime.js/three load only for visitors, never in the authed app bundle.

### Working buttons (data flow)
- Replace inert `motion.button`s with navigation:
  - Hero "Start Free Trial" → `useNavigate('/register')`; "Watch Demo" → smooth-scroll to `#ai-power`.
  - Navigation desktop+mobile "Get Started" → `/register`; **add a "Login" text link → `/login`**; anchor links keep `handleSmoothScroll`. Repoint the `#pricing` nav item to the CTA section (`#cta`) labelled "Get Started" or drop it (there is no pricing section).
  - CTA section primary button → `/register`; secondary → `/login` or scroll.
  - Footer "product" links → smooth-scroll to the matching section; legal/social links are safe `#` placeholders (no dead external nav).
- Section ids verified/added so anchors resolve: `#hero, #features, #ai-power, #modules, #cta`.

## Animation & 3D

### framer-motion (present)
- Keep existing reveal/stagger variants. **Add interactive scroll:** a top **scroll-progress bar** (`useScroll` → `scaleX`); parallax on hero glow orbs and section backgrounds via `useScroll({offset})` + `useTransform`; `whileInView` reveals already present on sections. A subtle `AnimatePresence` fade when the landing mounts.

### anime.js (new dep)
- **Stat counters** (`StatsCounter`): anime.js number tween from 0 → target when the section enters view (replaces/augments any manual counter), with easing + thousand-separators.
- **Logo/mark flourish:** an SVG gold "V"/diamond mark in the hero or nav whose strokes draw + shimmer on load via anime.js (this is the Rive-substitute "interactive animated mark").
- Wrapped in a tiny `useAnime` helper; all effects no-op under `prefers-reduced-motion`.

### Lightweight 3D (new dep: `three`)
- **`components/Hero3D.jsx`** — a small Three.js scene: a slowly rotating metallic-gold geometric object (icosahedron/torus-knot) with subtle mouse-parallax, rendered into a fixed-size canvas behind/beside the hero visual.
  - **Lazy-loaded** (`React.lazy`) and **guarded**: render only if WebGL is available and `!prefersReducedMotion`; otherwise fall back to the existing static `hero-visual.jpg`. Disposes renderer/geometry on unmount; caps DPR at 2; pauses `requestAnimationFrame` when offscreen/tab hidden.
- **Interactive 3D tilt** on the hero visual card: mouse-move → perspective `rotateX/rotateY` via framer `useMotionValue` (works without WebGL; the always-on "3D feel").
- **ParticleCanvas** (already in v2): retained behind the hero, throttled + reduced-motion aware.

### Honest non-goals
- **Barba.js** — not integrated; it targets non-SPA multi-page navigation and conflicts with React Router. Route transitions use framer-motion instead.
- **Rive** — not integrated; authoring a `.riv` requires the Rive editor (unavailable here). The intended interactive animated mark is delivered with anime.js + SVG.

## Assets
- Copy `vousfin-v2/public/assets/*` (`hero-visual.jpg`, `ai-dashboard.jpg`, `feature-*.jpg`, `logo-full.png`, `logo-icon.png`) → `vousfin-frontend-main/public/landing/`. Update `src` paths in components to `/landing/<file>`.

## Dependencies (add to `vousfin-frontend-main`)
- `framer-motion` (landing animation engine; not currently installed).
- `animejs` (counters + SVG mark).
- `three` (hero 3D accent).
- `lucide-react` already present (v1.16 — icon imports used by the landing verified at build).
- `react-router-dom` v7 present (`Link`/`useNavigate` used).

All three new deps are only imported by the lazy landing chunk.

## Verification / testing
- This is presentational; verification is **build + lint + browser preview**, not unit tests.
- `npm run build` succeeds; `npm run lint` clean on all new files (note the `react-hooks/purity` rule — no `Date.now()`/`Math.random()` in render; seed any randomness in effects/refs).
- **Browser preview** (preview_start): landing renders at `/` when logged out; scroll-progress + reveals fire; Three.js hero shows (or falls back); counters animate; every button navigates correctly (Start/Get Started→/register, Login→/login, Watch Demo→scroll, anchors→scroll); mobile menu works; reduced-motion disables heavy motion; no console errors.
- Confirm the **authed app is unaffected**: log-in path still reaches dashboard; app bundle does not include three/framer/anime (separate chunk); the 4 themes still render normally (no `.vf-landing` bleed).

## Non-goals / out of scope
- No backend changes expected (registration/login already exist). If a "request demo" capture is wanted later, that's a separate phase.
- No pricing/billing section (no pricing data exists); the "pricing" nav entry maps to the Get-Started CTA.
- No CMS/editable content; copy is static in the components.
