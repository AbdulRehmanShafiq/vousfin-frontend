import { motion } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";

const EASE = [0.16, 1, 0.3, 1];

const steps = [
  {
    no: "01",
    title: "Connect your business",
    body: "Import your chart of accounts or start from our IFRS-ready template. Link banks, customers, and vendors in minutes — no spreadsheets, no migration headaches.",
    points: ["Guided setup wizard", "78 pre-built accounts", "Bank-statement import"],
  },
  {
    no: "02",
    title: "Let the AI do the books",
    body: "Every transaction is categorised, matched, and posted with double-entry precision. Our engine flags anomalies and reconciles as you go, so the ledger is always closing-ready.",
    points: ["Auto-categorisation", "Anomaly detection", "Real-time reconciliation"],
  },
  {
    no: "03",
    title: "Decide with foresight",
    body: "Forecasts, variance alerts, and a plain-language AI copilot turn your numbers into decisions — cash 90 days out, budget breaches the moment they happen.",
    points: ["90-day cash forecast", "Budget vs actual", "Ask-anything copilot"],
  },
];

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } };
const item = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

export default function HowItWorks() {
  const reduced = useReducedMotion();
  return (
    <section id="how-it-works" className="relative w-full overflow-hidden">
      <div className="content-max section-padding">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#C8A96E]">How it works</span>
          <h2 className="font-display mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            From chaos to clarity in <span className="text-gold-gradient">three steps</span>
          </h2>
        </motion.div>

        <motion.div
          variants={reduced ? undefined : container}
          initial={reduced ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="relative grid gap-6 md:grid-cols-3"
        >
          {/* connecting hairline */}
          <div className="vf-hairline pointer-events-none absolute left-0 right-0 top-[3.25rem] hidden md:block" />
          {steps.map((s) => (
            <motion.div
              key={s.no}
              variants={reduced ? undefined : item}
              className="vf-glass-pro relative rounded-2xl p-8"
            >
              <div className="bg-gold-gradient mb-6 flex h-14 w-14 items-center justify-center rounded-2xl font-display text-xl font-bold text-[#12100E] shadow-[0_8px_30px_-8px_rgba(200,169,110,0.6)]">
                {s.no}
              </div>
              <h3 className="font-display mb-3 text-2xl font-semibold text-[#F5F0E8]">{s.title}</h3>
              <p className="mb-6 text-[15px] leading-relaxed text-[#A89B8C]">{s.body}</p>
              <ul className="space-y-2.5">
                {s.points.map((p) => (
                  <li key={p} className="flex items-center gap-2.5 text-sm text-[#C8A96E]">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#C8A96E]" />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
