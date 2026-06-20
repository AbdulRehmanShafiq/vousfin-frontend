import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";

const EASE = [0.16, 1, 0.3, 1];

const faqs = [
  { q: "Is vousFin really double-entry under the hood?", a: "Yes. Every transaction posts a balanced journal entry to an immutable ledger — debits equal credits, always. Reports read straight from the general ledger, so your trial balance is correct by construction." },
  { q: "Do I need to be an accountant to use it?", a: "No. The interface speaks plain language — “money in”, “money out”, “take-home pay”. The accounting happens correctly behind the scenes, and the AI copilot answers questions the way a colleague would." },
  { q: "How does the AI forecasting work?", a: "It learns your historical patterns to project cash flow up to 90 days out, detect anomalies, and flag budget breaches in real time. Every insight is explainable — you can see exactly why a number moved." },
  { q: "Is my financial data secure?", a: "Data is encrypted in transit and at rest, access is role-based with full segregation-of-duties controls, and every change is captured in an append-only audit trail. You stay audit-ready at all times." },
  { q: "Can it handle multiple currencies and taxes?", a: "150+ currencies with automatic IAS-21 FX gain/loss, plus a tax engine covering GST/VAT, withholding and income tax — including one-click FBR return preparation and filing." },
  { q: "What happens after the free trial?", a: "Nothing breaks. You drop to the free Starter plan and keep your data. Upgrade whenever you’re ready — no lock-in, cancel anytime." },
];

function Item({ faq, open, onToggle, reduced }) {
  return (
    <div className="vf-glass-pro overflow-hidden rounded-2xl">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={open}
      >
        <span className="font-display text-lg font-medium text-[#F5F0E8]">{faq.q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: reduced ? 0 : 0.25, ease: EASE }}
          className="shrink-0 text-2xl font-light text-[#C8A96E]"
        >+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.32, ease: EASE }}
          >
            <p className="px-6 pb-6 text-[15px] leading-relaxed text-[#A89B8C]">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="relative w-full overflow-hidden">
      <div className="content-max section-padding">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#C8A96E]">Questions</span>
          <h2 className="font-display mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            Everything you <span className="text-gold-gradient">want to know</span>
          </h2>
        </motion.div>

        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {faqs.map((f, i) => (
            <Item key={f.q} faq={f} reduced={reduced} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
