# Landing Page Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Presentational work — verification is build + lint + browser preview, not unit tests. Steps use checkbox (`- [ ]`).

**Goal:** Ship the `vousfin-v2` landing page as the public `/` home, fully self-contained in `vousfin-frontend-main`, every button working, with framer-motion + anime.js + lightweight Three.js + interactive scroll, isolated from the app's theme system.

**Source:** extracted at `/tmp/kimi_landing/vousfin-v2/` (re-extract from `Kimi_Agent_vousFin.zip` if gone).

**Spec:** `docs/superpowers/specs/2026-06-19-landing-page-integration-design.md`

---

## Task 1: Dependencies, fonts, assets

- [ ] **Add deps** (in `vousfin-frontend-main/`):
```bash
npm install framer-motion animejs three
```
- [ ] **Copy images** into the app's public dir:
```bash
mkdir -p public/landing
cp /tmp/kimi_landing/vousfin-v2/public/assets/* public/landing/
```
- [ ] **Fonts** — add to `index.html` `<head>` (before the app CSS), applied scoped later:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono&display=swap" rel="stylesheet">
```
- [ ] **Verify** deps installed: `node -e "require('framer-motion');require('animejs');require('three');console.log('deps ok')"` → `deps ok`.
- [ ] **Commit:** `git add package.json package-lock.json public/landing index.html && git commit -m "chore(landing): add framer-motion/animejs/three, landing assets + fonts"`

---

## Task 2: Scoped design system — `src/pages/landing/landing.css`

- [ ] **Create `src/pages/landing/landing.css`** — the entire landing look, scoped under `.vf-landing` so it can't bleed into / be themed by the app. Hardcoded hex (fixed luxury-dark).

```css
/* src/pages/landing/landing.css — scoped luxury-dark landing design system */
.vf-landing {
  background-color: #12100E;
  color: #F5F0E8;
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.vf-landing ::selection { background-color: rgba(200,169,110,0.25); color: #F5F0E8; }

/* Fonts (scoped: 2-class specificity beats Tailwind's single-class font-display) */
.vf-landing .font-display { font-family: 'Playfair Display', Georgia, serif; }
.vf-landing .font-body    { font-family: 'Inter', system-ui, sans-serif; }
.vf-landing .font-mono    { font-family: 'JetBrains Mono', monospace; }

/* Gradient text */
.vf-landing .text-gold-gradient {
  background: linear-gradient(135deg,#C8A96E,#D4B87A,#B8935A);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.vf-landing .text-rose-gradient {
  background: linear-gradient(135deg,#C4886A,#C8A96E);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
/* Gradient / glow backgrounds (used as classes) */
.vf-landing .bg-gold-gradient { background: linear-gradient(135deg,#C8A96E,#D4B87A,#B8935A); }
.vf-landing .bg-rose-gradient { background: linear-gradient(135deg,#C4886A,#C8A96E); }
.vf-landing .bg-card-gradient { background: linear-gradient(145deg,rgba(200,169,110,0.05),rgba(196,136,106,0.02)); }
.vf-landing .bg-hero-glow { background: radial-gradient(ellipse 60% 50% at 50% 30%,rgba(200,169,110,0.12),transparent); }
.vf-landing .bg-gold-glow { background: radial-gradient(ellipse at center,rgba(200,169,110,0.15) 0%,transparent 70%); }

/* Glass + glow + borders */
.vf-landing .glass-card { background: rgba(26,23,20,0.6); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(200,169,110,0.08); }
.vf-landing .glass-nav { background: rgba(18,16,14,0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid rgba(200,169,110,0.06); }
.vf-landing .glow-gold { box-shadow: 0 0 40px rgba(200,169,110,0.12); }
.vf-landing .glow-gold-strong { box-shadow: 0 0 60px rgba(200,169,110,0.2); }
.vf-landing .border-gold-subtle { border-color: rgba(200,169,110,0.12); }

/* Layout helpers */
.vf-landing .content-max { margin-left:auto; margin-right:auto; max-width: 80rem; padding-left:1rem; padding-right:1rem; }
@media (min-width:640px){ .vf-landing .content-max { padding-left:1.5rem; padding-right:1.5rem; } }
@media (min-width:1024px){ .vf-landing .content-max { padding-left:2rem; padding-right:2rem; } }
.vf-landing .section-padding { padding-top:5rem; padding-bottom:5rem; }
@media (min-width:640px){ .vf-landing .section-padding { padding-top:7rem; padding-bottom:7rem; } }
@media (min-width:1024px){ .vf-landing .section-padding { padding-top:8rem; padding-bottom:8rem; } }

/* Keyframe animation classes */
.vf-landing .animate-float { animation: vfFloat 6s ease-in-out infinite; }
.vf-landing .animate-pulse-glow { animation: vfPulseGlow 3s ease-in-out infinite; }
.vf-landing .animate-shimmer { animation: vfShimmer 3s ease-in-out infinite; }
@keyframes vfFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
@keyframes vfPulseGlow { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.6;transform:scale(1.05)} }
@keyframes vfShimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

@media (prefers-reduced-motion: reduce) {
  .vf-landing .animate-float,
  .vf-landing .animate-pulse-glow,
  .vf-landing .animate-shimmer { animation: none !important; }
  .vf-landing html { scroll-behavior: auto; }
}
```

- [ ] **Commit:** `git add src/pages/landing/landing.css && git commit -m "feat(landing): scoped landing design system"`

---

## Task 3: Port hooks, sections, components (with mechanical transforms)

Copy the source files into `src/pages/landing/` and apply these **transforms to every copied file**:
1. Named color tokens → arbitrary hex (only the named ones; hex literals stay):
   `bg-dark→bg-[#12100E]`, `text-gold→text-[#C8A96E]`, `bg-gold→bg-[#C8A96E]`, `bg-gold/[0.15]→bg-[#C8A96E]/15`, `bg-gold/20→bg-[#C8A96E]/20`, `bg-gold/10→bg-[#C8A96E]/10`, `border-gold/30→border-[#C8A96E]/30`, `border-gold/...→border-[#C8A96E]/...`, `text-gold-light→text-[#D4B87A]`, `text-teal→text-[#7EB5A6]`, `bg-teal/[0.10]→bg-[#7EB5A6]/10`, `text-cream→text-[#F5F0E8]`, `text-cream-muted→text-[#A89B8C]`, `text-cream-dim→text-[#6B6259]`, `text-rose→text-[#C4886A]`, `text-burgundy→text-[#6B1D2B]`. (Leave `text-gold-gradient`, `bg-gold-gradient`, `glass-card`, `content-max`, `section-padding`, `animate-*`, `font-*`, `border-gold-subtle`, `bg-hero-glow`, `bg-gold-glow` — they resolve via `landing.css`.)
2. Image paths `"/assets/` → `"/landing/`.
3. `@/hooks/...`, `@/sections/...`, `@/components/...` imports → `@/pages/landing/hooks/...` etc. (or relative `../hooks/...`).

- [ ] **Step 1: Hooks.** Create `src/pages/landing/hooks/useReducedMotion.js` from source, but export **both** named and default (sections import it both ways):
```js
import { useState, useEffect } from 'react'
export function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mql.matches)
    const handler = (e) => setPrefersReduced(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])
  return prefersReduced
}
export default useReducedMotion
```

- [ ] **Step 2: Components.** Copy `Navigation.jsx` and `ParticleCanvas.jsx` → `src/pages/landing/components/` with the transforms. (Navigation gets button wiring in Task 5; ParticleCanvas just transforms + verify it respects reduced motion — if not, gate its RAF on `!useReducedMotion()`.)

- [ ] **Step 3: Sections.** Copy all 7 → `src/pages/landing/sections/`: `Hero.jsx, Features.jsx, AIPower.jsx, ModulesBento.jsx, StatsCounter.jsx, CTA.jsx, Footer.jsx`, applying the transforms. Ensure section ids exist: Hero `#hero`, Features `#features`, AIPower `#ai-power`, ModulesBento `#modules`, CTA `#cta`.

- [ ] **Step 4: Sanity** — grep the ported tree for leftover bare tokens that won't resolve:
`grep -rnE "bg-dark|text-gold[^-]|bg-gold[^-]|text-teal|text-cream|/assets/" src/pages/landing` → expect no matches (all converted).

- [ ] **Commit:** `git add src/pages/landing && git commit -m "feat(landing): port sections/components/hooks (scoped tokens, app asset paths)"`

---

## Task 4: LandingPage shell + interactive scroll

- [ ] **Create `src/pages/landing/LandingPage.jsx`** — the former `App.jsx`, wrapped in `.vf-landing`, importing `landing.css`, with a **scroll-progress bar** and reduced-motion-aware mount fade:
```jsx
import { lazy, Suspense } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import './landing.css'
import Navigation from './components/Navigation'
import Hero from './sections/Hero'
import { useReducedMotion } from './hooks/useReducedMotion'

const Features = lazy(() => import('./sections/Features'))
const AIPower = lazy(() => import('./sections/AIPower'))
const ModulesBento = lazy(() => import('./sections/ModulesBento'))
const StatsCounter = lazy(() => import('./sections/StatsCounter'))
const CTA = lazy(() => import('./sections/CTA'))
const Footer = lazy(() => import('./sections/Footer'))

function SectionFallback() {
  return <div className="flex items-center justify-center py-24">
    <div className="border-2 border-[#C8A96E]/20 border-t-[#C8A96E] rounded-full w-8 h-8 animate-spin" /></div>
}

export default function LandingPage() {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })
  return (
    <div className="vf-landing relative min-h-[100dvh] overflow-x-hidden">
      {!reduced && (
        <motion.div className="fixed top-0 left-0 right-0 z-[60] h-[3px] origin-left bg-gold-gradient"
          style={{ scaleX }} />
      )}
      <Navigation />
      <main>
        <Hero />
        <Suspense fallback={<SectionFallback />}><Features /></Suspense>
        <Suspense fallback={<SectionFallback />}><AIPower /></Suspense>
        <Suspense fallback={<SectionFallback />}><ModulesBento /></Suspense>
        <Suspense fallback={<SectionFallback />}><StatsCounter /></Suspense>
        <Suspense fallback={<SectionFallback />}><CTA /></Suspense>
        <Suspense fallback={<SectionFallback />}><Footer /></Suspense>
      </main>
    </div>
  )
}
```
- [ ] **Commit:** `git add src/pages/landing/LandingPage.jsx && git commit -m "feat(landing): LandingPage shell + scroll-progress bar"`

---

## Task 5: Wire every button to real navigation

- [ ] **Hero.jsx** — import `useNavigate` from `react-router-dom`; replace the two CTAs:
  - "Start Free Trial": `onClick={() => navigate('/register')}`.
  - "Watch Demo": `onClick={() => document.getElementById('ai-power')?.scrollIntoView({ behavior: 'smooth' })}`.
- [ ] **Navigation.jsx** —
  - Desktop + mobile "Get Started" → `onClick={() => navigate('/register')}` (convert the `<motion.a href="#pricing">` to a button/Link).
  - Add a **"Login"** link before Get Started → `navigate('/login')`.
  - Repoint nav links array: keep `Features/#features`, `AI Power/#ai-power`, `Modules/#modules`; replace `Pricing/#pricing` with nothing (drop) — Get Started covers conversion. `handleSmoothScroll` stays for anchors.
- [ ] **CTA.jsx** — primary button → `navigate('/register')`; secondary (if any) → `navigate('/login')`.
- [ ] **Footer.jsx** — "product" column links → `handleSmoothScroll` to section ids; other links stay `#` (no dead external nav); company/legal as safe placeholders.
- [ ] **Verify** route file loads: `npm run build` (catches import errors) — defer full build to Task 9; here just confirm no syntax errors via `npx eslint src/pages/landing`.
- [ ] **Commit:** `git add src/pages/landing && git commit -m "feat(landing): wire buttons to /register, /login, and section scroll"`

---

## Task 6: anime.js — stat counters + animated mark

- [ ] **Create `src/pages/landing/hooks/useAnime.js`** — small helper to run an anime.js timeline on mount/in-view, no-op under reduced motion:
```js
import { useEffect, useRef } from 'react'
import anime from 'animejs'
import { useReducedMotion } from './useReducedMotion'
// Count a numeric element from 0 → target when `active` becomes true.
export function useCountUp(ref, target, { duration = 1600, decimals = 0, format } = {}, active = true) {
  const reduced = useReducedMotion()
  const done = useRef(false)
  useEffect(() => {
    if (!active || done.current || !ref.current) return
    done.current = true
    const fmt = format || ((v) => Number(v).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }))
    if (reduced) { ref.current.textContent = fmt(target); return }
    const obj = { v: 0 }
    anime({ targets: obj, v: target, duration, easing: 'easeOutExpo',
      update: () => { if (ref.current) ref.current.textContent = fmt(obj.v) } })
  }, [active, target, duration, decimals, format, reduced, ref])
}
```
- [ ] **StatsCounter.jsx** — replace the framer `AnimatedCounter` internals with `useCountUp` driven by `useInView` (keep the existing in-view trigger). Preserve prefix/suffix/decimals. (anime.js now powers the counters.)
- [ ] **Create `src/pages/landing/components/AnimatedMark.jsx`** — an inline SVG gold "V"/diamond mark whose paths draw + shimmer on mount via anime.js (`strokeDashoffset` draw then a gold fill fade); reduced-motion → static filled mark. Place it in the Hero badge or beside the nav logo.
- [ ] **Verify:** `npx eslint src/pages/landing` clean (watch `react-hooks/purity`: no impure calls in render; anime runs in effects).
- [ ] **Commit:** `git add src/pages/landing && git commit -m "feat(landing): anime.js stat counters + animated SVG mark"`

---

## Task 7: Lightweight Three.js hero accent + 3D tilt

- [ ] **Create `src/pages/landing/components/Hero3D.jsx`** — a small Three.js scene (rotating metallic-gold icosahedron with subtle mouse parallax) in a self-sized canvas. Guards: only mount if WebGL available; dispose on unmount; cap DPR at 2; pause RAF when tab hidden. Exported default; consumed via `React.lazy` + `Suspense` so `three` stays in the landing chunk.
```jsx
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
export default function Hero3D() {
  const mountRef = useRef(null)
  useEffect(() => {
    const mount = mountRef.current; if (!mount) return
    let renderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }) } catch { return }
    const w = mount.clientWidth, h = mount.clientHeight || 360
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h); mount.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100); camera.position.z = 4
    const geo = new THREE.IcosahedronGeometry(1.3, 0)
    const mat = new THREE.MeshStandardMaterial({ color: 0xC8A96E, metalness: 0.9, roughness: 0.25, flatShading: true })
    const mesh = new THREE.Mesh(geo, mat); scene.add(mesh)
    const wire = new THREE.LineSegments(new THREE.WireframeGeometry(geo), new THREE.LineBasicMaterial({ color: 0xD4B87A, transparent: true, opacity: 0.25 })); scene.add(wire)
    scene.add(new THREE.AmbientLight(0xffffff, 0.4))
    const key = new THREE.DirectionalLight(0xffe9c0, 1.4); key.position.set(3, 2, 4); scene.add(key)
    const rim = new THREE.DirectionalLight(0x7EB5A6, 0.5); rim.position.set(-3, -1, 2); scene.add(rim)
    let mx = 0, my = 0
    const onMove = (e) => { mx = (e.clientX / window.innerWidth - 0.5) * 0.6; my = (e.clientY / window.innerHeight - 0.5) * 0.6 }
    window.addEventListener('mousemove', onMove)
    let raf, t = 0
    const tick = () => {
      t += 0.005
      mesh.rotation.y = wire.rotation.y = t + mx
      mesh.rotation.x = wire.rotation.x = t * 0.6 + my
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    const onVis = () => { if (document.hidden) cancelAnimationFrame(raf); else tick() }
    document.addEventListener('visibilitychange', onVis)
    const onResize = () => { const nw = mount.clientWidth; renderer.setSize(nw, h); camera.aspect = nw / h; camera.updateProjectionMatrix() }
    window.addEventListener('resize', onResize)
    tick()
    return () => {
      cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove)
      document.removeEventListener('visibilitychange', onVis); window.removeEventListener('resize', onResize)
      geo.dispose(); mat.dispose(); renderer.dispose(); if (renderer.domElement.parentNode) mount.removeChild(renderer.domElement)
    }
  }, [])
  return <div ref={mountRef} className="h-[320px] w-full md:h-[400px]" aria-hidden="true" />
}
```
- [ ] **Hero.jsx** — lazy-load Hero3D and render it as a floating accent layered with the hero visual; gate on `!prefersReducedMotion && hasWebGL` else keep the static `hero-visual.jpg`. Add **3D tilt** to the hero image card: framer `useMotionValue` x/y → `rotateX/rotateY` perspective on mouse-move over the card; reset on leave; disabled under reduced motion.
- [ ] **Add a `hasWebGL()` util** (try create a webgl context once) in `src/pages/landing/lib/webgl.js`.
- [ ] **Verify:** `npx eslint src/pages/landing` clean.
- [ ] **Commit:** `git add src/pages/landing && git commit -m "feat(landing): lightweight Three.js hero accent + 3D tilt (WebGL/reduced-motion fallback)"`

---

## Task 8: Routing — landing at `/` for logged-out

- [ ] **`src/routes.jsx`** — add lazy import: `const LandingPage = lazy(() => import('@/pages/landing/LandingPage'))`.
- [ ] In `RootRedirect`, change the unauthenticated branch from `return <Navigate to="/login" replace />` to `return withSuspense(LandingPage)` (render, don't redirect). Keep `if (!hydrated) return <LoadingFallback/>` first, and the authenticated → setup/dashboard branches unchanged.
- [ ] **Confirm** `withSuspense` is defined before `RootRedirect` (it's a top-level const in routes.jsx — verify; if it's declared later, use a `<Suspense><LandingPage/></Suspense>` inline wrapper instead).
- [ ] **Commit:** `git add src/routes.jsx && git commit -m "feat(landing): serve landing at / for logged-out visitors"`

---

## Task 9: Build, lint, browser verification

- [ ] **Lint:** `npx eslint src/pages/landing src/routes.jsx` → clean (fix any `react-hooks/purity`, unused vars).
- [ ] **Build:** `npm run build` → succeeds; note the landing/three/framer chunks are separate from the main `index` chunk.
- [ ] **Browser preview** (preview_start the frontend dev server; the landing needs no login):
  - Load `/` (logged-out) → landing renders; check `preview_console_logs` for errors (expect none).
  - `preview_snapshot` confirms hero copy, sections, nav.
  - Test buttons via `preview_click` + assert navigation: Start Free Trial → `/register`; Login → `/login`; Watch Demo → scrolls; nav anchors → scroll.
  - `preview_resize` mobile → hamburger menu opens/closes.
  - `preview_screenshot` hero (desktop + mobile) as proof.
  - Verify Three.js canvas present (or graceful fallback) and counters animate.
- [ ] **Confirm app unaffected:** navigate to `/login`, log in flow still routes to dashboard; the `.vf-landing` styles don't appear outside the landing.

---

## Task 10: Finalize

- [ ] **Push frontend:** `git push origin main`.
- [ ] **Memory:** add a `landing-page` note (entry at `/` for logged-out; isolated under `.vf-landing`; deps framer-motion/animejs/three; Barba/Rive intentionally skipped) and pointer in MEMORY.md.
- [ ] **Summary** to the user (what shipped, buttons, animations, the Barba/Rive honest note, how to view).

---

## Self-Review

**Spec coverage:** integrate v2 landing → Tasks 3/4/8; working buttons → Task 5; framer interactive scroll → Task 4; anime.js → Task 6; lightweight 3D + tilt → Task 7; isolation under `.vf-landing` → Task 2; assets/fonts/deps → Task 1; Barba/Rive non-goals → documented (spec) + substitute mark (Task 6). ✓

**Placeholder scan:** section ports (Task 3) are mechanical copies with an explicit transform list, not placeholders; every NEW file (landing.css, LandingPage, useAnime, Hero3D, routing change) has full code. ✓

**Consistency:** `.vf-landing` wrapper (Task 4) matches the `landing.css` scope (Task 2); hex conversions (Task 3) match the tokens left to `landing.css`; `useReducedMotion` dual-export (Task 3) satisfies both import styles; button targets (`/register`, `/login`, `#ai-power`) match the spec. ✓

**Risks:** lucide-react v1.16 vs source's 0.460 — icon names are stable; build will catch any missing export (swap to an available icon if so). framer-motion API (`useScroll/useSpring/useInView/useMotionValue`) is current-major — verify against installed version at build.
