import { useRef, useState, useEffect } from "react";
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

const lerp = (a, b, t) => a + (b - a) * t;

export default function ShowcaseScroll() {
  const reduced = useReducedMotion();
  const containerRef = useRef(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 across the pinned section

  // Bulletproof scroll tracking via getBoundingClientRect + rAF (no useScroll
  // target measurement, which mis-measured inside this layout).
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
      setProgress(p);
      setActive(Math.min(steps.length - 1, Math.floor(p * steps.length)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  // Reduced motion: render a simple stacked gallery instead of the pinned scroll.
  if (reduced) {
    return (
      <section id="showcase" className="bg-[#12100E] section-padding content-max py-24">
        <Heading />
        <div className="mt-16 space-y-16">
          {steps.map((s) => (
            <div key={s.tag} className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <Tag>{s.tag}</Tag>
                <h3 className="mt-4 font-display text-2xl font-semibold text-[#F5F0E8]">{s.title}</h3>
                <p className="mt-3 max-w-md text-[#A89B8C]">{s.body}</p>
              </div>
              <AppWindow src={s.img} alt={s.title} label={s.label} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const frameRotate = lerp(4, -3, progress);
  const frameY = lerp(0, -20, progress);

  return (
    <section id="showcase" className="relative bg-[#12100E]">
      <div className="content-max section-padding pt-24">
        <Heading />
      </div>

      {/* Tall driver: height scales with number of steps */}
      <div ref={containerRef} style={{ height: `${steps.length * 90}vh` }} className="relative">
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div className="content-max section-padding grid w-full grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            {/* LEFT: copy that swaps */}
            <div className="relative min-h-[12rem] order-2 lg:order-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <Tag>{steps[active].tag}</Tag>
                  <h3 className="mt-4 font-display font-bold leading-tight text-[#F5F0E8]" style={{ fontSize: "clamp(1.75rem, 3.5vw, 3rem)" }}>
                    {steps[active].title}
                  </h3>
                  <p className="mt-5 max-w-md text-lg leading-relaxed text-[#A89B8C]">
                    {steps[active].body}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* progress rail */}
              <div className="mt-10 flex gap-2">
                {steps.map((s, i) => (
                  <button
                    key={s.tag}
                    type="button"
                    aria-label={`Jump to ${s.tag}`}
                    onClick={() => {
                      const el = containerRef.current;
                      if (!el) return;
                      const travel = el.offsetHeight - window.innerHeight;
                      const targetTop = el.offsetTop + travel * ((i + 0.5) / steps.length);
                      window.scrollTo({ top: targetTop, behavior: "smooth" });
                    }}
                    className="h-1.5 w-10 overflow-hidden rounded-full bg-[#C8A96E]/15"
                  >
                    <motion.div
                      className="bg-gold-gradient h-full rounded-full"
                      animate={{ width: i <= active ? "100%" : "0%", opacity: i === active ? 1 : i < active ? 0.4 : 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: pinned app window, screenshots crossfade */}
            <div className="order-1 lg:order-2 [perspective:1500px]">
              <div style={{ transform: `translateY(${frameY}px) rotateZ(${frameRotate}deg)`, transformStyle: "preserve-3d" }}>
                <div className="relative">
                  <div className="bg-gold-glow pointer-events-none absolute -inset-8 rounded-[2.5rem]" />
                  <AppWindow label={steps[active].label} className="relative">
                    <div className="relative aspect-[16/9.2] w-full overflow-hidden">
                      <AnimatePresence>
                        <motion.img
                          key={active}
                          src={steps[active].img}
                          alt={steps[active].title}
                          className="absolute inset-0 h-full w-full object-cover object-top"
                          initial={{ opacity: 0, scale: 1.04 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.6, ease: EASE }}
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

function Heading() {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#C8A96E]">A live product tour</span>
      <h2 className="mt-4 font-display font-bold leading-tight" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
        <span className="text-[#F5F0E8]">See vousFin </span>
        <span className="text-gold-gradient">in motion.</span>
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-lg text-[#A89B8C]">
        Scroll through the real product — these are actual screens, not mockups.
      </p>
    </motion.div>
  );
}

function Tag({ children }) {
  return (
    <span className="vf-glass-pro inline-flex items-center rounded-full border border-[#C8A96E]/20 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#C8A96E]">
      {children}
    </span>
  );
}
