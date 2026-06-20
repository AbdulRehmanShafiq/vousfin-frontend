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
];

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

        <div className="columns-1 gap-6 md:columns-2 lg:columns-3 [&>*]:mb-6">
          {quotes.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={reduced ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: EASE, delay: reduced ? 0 : (i % 3) * 0.08 }}
              className="vf-glass-pro break-inside-avoid rounded-2xl p-7"
            >
              <div className="mb-4 text-3xl leading-none text-[#C8A96E]/40 font-display">“</div>
              <blockquote className="text-[15px] leading-relaxed text-[#E9E2D5]">{t.q}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="bg-gold-gradient flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-[#12100E]">{t.initials}</span>
                <span>
                  <span className="block text-sm font-semibold text-[#F5F0E8]">{t.name}</span>
                  <span className="block text-xs text-[#6B6259]">{t.role}</span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
