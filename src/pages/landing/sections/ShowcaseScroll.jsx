import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useReducedMotion from "../hooks/useReducedMotion";
import AppWindow from "../components/AppWindow";

const EASE = [0.16, 1, 0.3, 1];

// Each step pins the app window and swaps the screenshot as you scroll.
const steps = [
  {
    tag: "Dashboard",
    title: "Your whole business, one glance",
    body: "Revenue, expenses, profit, cash and receivables update live the moment you open vousFin — plus AI alerts on what needs your attention today.",
    img: "/landing/shot-dashboard.png",
    label: "app.vousfin.com / dashboard",
  },
  {
    tag: "Insights",
    title: "A health score that thinks ahead",
    body: "Liquidity, profitability and leverage scored automatically, with a forward outlook that flags margin compression before it hits your bank.",
    img: "/landing/shot-insights.png",
    label: "app.vousfin.com / insights",
  },
  {
    tag: "Forecasting",
    title: "See 90 days into the future",
    body: "Machine-learning models project revenue, expenses and liquidity so you can plan hiring, spending and runway with confidence.",
    img: "/landing/shot-forecast.png",
    label: "app.vousfin.com / forecast",
  },
  {
    tag: "Protection",
    title: "Catch fraud and errors instantly",
    body: "Every transaction is scored for anomalies — duplicate payments, round-number fraud, unusual spikes — and surfaced for review before they cost you.",
    img: "/landing/shot-anomaly.png",
    label: "app.vousfin.com / anomalies",
  },
  {
    tag: "Reports",
    title: "Closing-ready statements, always",
    body: "Income statement, balance sheet, cash flow and trial balance — generated from a balanced double-entry ledger and explained in plain language by AI.",
    img: "/landing/shot-reports.png",
    label: "app.vousfin.com / reports",
  },
];

export default function ShowcaseScroll() {
  const reduced = useReducedMotion();
  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);

  // rAF scroll tracking. Transform is written DIRECTLY to the DOM (no React
  // re-render per frame); React state only flips on the 5 discrete step changes.
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
      if (frameRef.current) {
        const rot = 3 - 6 * p;        // 3deg -> -3deg
        const y = -18 * p;            // gentle lift
        frameRef.current.style.transform = `translate3d(0, ${y}px, 0) rotateZ(${rot}deg)`;
      }
      const idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
      if (idx !== activeRef.current) {
        activeRef.current = idx;
        setActive(idx);
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(compute); };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const jumpTo = useCallback((i) => {
    const el = containerRef.current;
    if (!el) return;
    const travel = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + travel * ((i + 0.5) / steps.length), behavior: "smooth" });
  }, []);

  // Reduced motion: simple stacked gallery (no pinning).
  if (reduced) {
    return (
      <section id="showcase" className="vf-stage section-padding content-max py-24">
        <Heading />
        <div className="mt-16 space-y-16">
          {steps.map((s) => (
            <div key={s.tag} className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <Tag>{s.tag}</Tag>
                <h3 className="mt-4 font-display text-2xl font-semibold text-[#F5F0E8]">{s.title}</h3>
                <p className="mt-3 max-w-md text-[#C8B9A2]">{s.body}</p>
              </div>
              <AppWindow src={s.img} alt={s.title} label={s.label} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const cur = steps[active];

  return (
    <section id="showcase" className="vf-stage relative">
      {/* Tall driver: each step gets ~78vh of scroll travel */}
      <div ref={containerRef} style={{ height: `${steps.length * 78}vh` }} className="relative">
        <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
          {/* heading rides along at the top of the pinned panel */}
          <div className="content-max section-padding shrink-0 pb-0 pt-24 lg:pt-28">
            <Heading compact />
          </div>

          {/* the stage */}
          <div className="content-max flex flex-1 items-center px-4 pb-10 sm:px-6 lg:px-8">
            <div className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
              {/* LEFT: copy that crossfades */}
              <div className="relative order-2 lg:order-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.45, ease: EASE }}
                  >
                    <Tag>{cur.tag}</Tag>
                    <h3 className="mt-4 font-display font-bold leading-[1.05] text-[#F5F0E8]" style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.85rem)" }}>
                      {cur.title}
                    </h3>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-[#C8B9A2] sm:text-lg">
                      {cur.body}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* clickable step rail */}
                <div className="mt-8 flex flex-col gap-2.5">
                  {steps.map((s, i) => (
                    <button
                      key={s.tag}
                      type="button"
                      onClick={() => jumpTo(i)}
                      className="group flex items-center gap-3 text-left"
                      aria-label={`Jump to ${s.tag}`}
                    >
                      <span className="relative h-1 w-12 overflow-hidden rounded-full bg-[#C8A96E]/15">
                        <span
                          className="bg-gold-gradient absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                          style={{ width: i <= active ? "100%" : "0%", opacity: i === active ? 1 : i < active ? 0.45 : 0 }}
                        />
                      </span>
                      <span className={`font-mono text-[0.7rem] uppercase tracking-[0.15em] transition-colors ${i === active ? "text-[#C8A96E]" : "text-[#6B6259] group-hover:text-[#A89B8C]"}`}>
                        {s.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* RIGHT: pinned app window; screenshots crossfade */}
              <div className="order-1 lg:order-2 [perspective:1600px]">
                <div ref={frameRef} className="relative will-change-transform" style={{ transformStyle: "preserve-3d" }}>
                  <div className="bg-gold-glow pointer-events-none absolute -inset-10 rounded-[3rem]" />
                  <AppWindow label={cur.label} className="relative">
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      <AnimatePresence>
                        <motion.img
                          key={active}
                          src={cur.img}
                          alt={cur.title}
                          className="absolute inset-0 h-full w-full object-cover object-top"
                          initial={{ opacity: 0, scale: 1.03 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.55, ease: EASE }}
                          draggable={false}
                        />
                      </AnimatePresence>
                    </div>
                  </AppWindow>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Heading({ compact }) {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#C8A96E]">A live product tour</span>
      <h2 className="mt-3 font-display font-bold leading-tight" style={{ fontSize: compact ? "clamp(1.6rem, 3.2vw, 2.6rem)" : "clamp(2rem, 4vw, 3.5rem)" }}>
        <span className="text-[#F5F0E8]">See vousFin </span>
        <span className="text-gold-gradient">in motion.</span>
      </h2>
      {!compact && (
        <p className="mx-auto mt-5 max-w-2xl text-lg text-[#A89B8C]">
          Scroll through the real product — these are actual screens, not mockups.
        </p>
      )}
    </motion.div>
  );
}

function Tag({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#C8A96E]/25 bg-[#C8A96E]/[0.06] px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#C8A96E]">
      {children}
    </span>
  );
}
