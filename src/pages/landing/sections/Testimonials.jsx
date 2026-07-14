import { motion } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";

const EASE = [0.16, 1, 0.3, 1];

const quotes = [
  { q: "We closed our books in two days instead of two weeks. The AI catches things our old accountant missed.", name: "Ayesha Khan", role: "CFO, Meridian Textiles", initials: "AK" },
  { q: "The cash-flow forecast paid for itself in the first month — we spotted a shortfall 60 days out.", name: "Daniel Roy", role: "Founder, Northwind Logistics", initials: "DR" },
  { q: "Multi-currency used to be a nightmare. Now it just reconciles itself across 14 markets.", name: "Sofia Marín", role: "Controller, Volta Energy", initials: "SM" },
  { q: "Tax season went from dread to a single click. The FBR filing flow is genuinely magic.", name: "Bilal Ahmed", role: "Owner, Crescent Retail", initials: "BA" },
  { q: "Finally a finance tool my non-accountant team actually understands. Plain language everywhere.", name: "Hana Osei", role: "COO, Lumen Studios", initials: "HO" },
  { q: "Audit-ready at all times. The immutable ledger and approval trail saved us during diligence.", name: "Marcus Lee", role: "VP Finance, Apex Foods", initials: "ML" },
  { q: "Onboarding took an afternoon. By evening we had our first AI forecast on screen.", name: "Imran Sheikh", role: "Director, Vertex Pharma", initials: "IS" },
  { q: "The anomaly alerts flagged a duplicate vendor payment before it ever cleared.", name: "Grace Tan", role: "Finance Lead, Orbit Mobility", initials: "GT" },
  { q: "Our board reports build themselves now — clean, current and defensible every time.", name: "Omar Farooq", role: "CEO, Saffron Hospitality", initials: "OF" },
];

// three columns, round-robin distribution
const columns = [0, 1, 2].map((c) => quotes.filter((_, i) => i % 3 === c));
const durations = ["38s", "48s", "43s"];

function Card({ t }) {
  return (
    <figure className="vf-glass-pro rounded-2xl p-6">
      <div className="font-display mb-3 text-3xl leading-none text-[#C8A96E]/40">“</div>
      <blockquote className="text-sm leading-relaxed text-[#E9E2D5]">{t.q}</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="bg-gold-gradient flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-[#12100E]">{t.initials}</span>
        <span>
          <span className="block text-sm font-semibold text-[#F5F0E8]">{t.name}</span>
          <span className="block text-xs text-[#6B6259]">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  const reduced = useReducedMotion();

  return (
    <section id="testimonials" className="relative w-full overflow-hidden bg-[#15120F]">
      <div className="content-max section-padding">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#C8A96E]">Loved by finance teams</span>
          <h2 className="font-display mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            Trusted where the <span className="text-gold-gradient">numbers matter</span>
          </h2>
        </motion.div>

        {reduced ? (
          // Static grid fallback (no motion)
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quotes.map((t) => <Card key={t.name} t={t} />)}
          </div>
        ) : (
          <div className="vf-twall vf-twall-mask grid h-[640px] grid-cols-1 gap-6 overflow-hidden md:grid-cols-2 lg:grid-cols-3">
            {columns.map((col, ci) => (
              <div
                key={ci}
                className={`vf-twall-col flex flex-col gap-6 ${ci === 1 ? "is-reverse" : ""} ${ci === 2 ? "hidden lg:flex" : ci === 1 ? "hidden md:flex" : "flex"}`}
                style={{ "--vf-dur": durations[ci] }}
              >
                {/* duplicated set for a seamless -50% loop */}
                {[...col, ...col].map((t, i) => <Card key={`${t.name}-${i}`} t={t} />)}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
