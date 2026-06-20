import { useEffect } from "react";
import Lenis from "lenis";

// Module-level singleton so any landing component can drive programmatic scroll
// THROUGH Lenis (native scrollTo/scrollIntoView are overridden while Lenis runs).
let _lenis = null;

export function smoothScrollTo(target, options = {}) {
  if (_lenis) {
    _lenis.scrollTo(target, { duration: 1.1, ...options });
    return;
  }
  // Fallback (reduced-motion or before init): native smooth scroll.
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: "smooth" });
  } else if (typeof target === "string") {
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  } else if (target && target.scrollIntoView) {
    target.scrollIntoView({ behavior: "smooth" });
  }
}

// Premium inertia/smooth scroll for the landing only. Native-scroll based, so
// framer-motion useScroll/whileInView and IntersectionObserver keep working.
// Skipped under reduced-motion; fully torn down on unmount (never affects the app).
export default function useLenis() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    _lenis = lenis;

    let raf = 0;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      _lenis = null;
    };
  }, []);
}
