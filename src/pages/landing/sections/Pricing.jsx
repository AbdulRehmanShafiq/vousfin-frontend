import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "../hooks/useReducedMotion";
import MagneticButton from "../components/MagneticButton";

const EASE = [0.16, 1, 0.3, 1];

const tiers = [
  {
    name: "Starter",
    tagline: "For founders doing their own books",
    monthly: 0, yearly: 0,
    cta: "Start free",
    featured: false,
    features: ["Double-entry bookkeeping", "Up to 100 transactions / mo", "1 user", "Income statement & balance sheet", "Community support"],
  },
  {
    name: "Growth",
    tagline: "For growing teams that want the AI edge",
    monthly: 29, yearly: 290,
    cta: "Start free trial",
    featured: true,
    features: ["Everything in Starter", "Unlimited transactions", "AI insights & 90-day forecasting", "Invoicing, bills & payroll", "Multi-currency (150+)", "5 users · priority support"],
  },
  {
    name: "Enterprise",
    tagline: "For finance teams that need control",
    monthly: 99, yearly: 990,
    cta: "Talk to us",
    featured: false,
    features: ["Everything in Growth", "Approval workflows & SoD", "Tax autopilot & FBR filing", "Audit workspace & cost accounting", "Unlimited users · SSO", "Dedicated success manager"],
  },
];

export default function Pricing() {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(true);

  return (
    <section id="pricing" className="relative w-full overflow-hidden">
      <div className="bg-gold-glow pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 opacity-40" />
      <div className="content-max section-padding relative">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#C8A96E]">Pricing</span>
          <h2 className="font-display mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            Simple pricing that <span className="text-gold-gradient">scales with you</span>
          </h2>
          <p className="mt-4 text-[#A89B8C]">Start free. Upgrade when you grow. Cancel anytime.</p>

          {/* billing toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full vf-glass-pro px-2 py-2">
            <button
              onClick={() => setYearly(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${!yearly ? "bg-gold-gradient text-[#12100E]" : "text-[#A89B8C]"}`}
            >Monthly</button>
            <button
              onClick={() => setYearly(true)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${yearly ? "bg-gold-gradient text-[#12100E]" : "text-[#A89B8C]"}`}
            >Yearly <span className="text-xs opacity-80">−17%</span></button>
          </div>
        </motion.div>

        <div className="grid items-stretch gap-6 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={reduced ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: EASE, delay: reduced ? 0 : i * 0.1 }}
              className={`relative flex flex-col rounded-3xl p-8 ${t.featured ? "vf-glass-pro glow-gold-strong border border-[#C8A96E]/40" : "vf-glass-pro"}`}
            >
              {t.featured && (
                <span className="bg-gold-gradient absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#12100E]">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-2xl font-semibold text-[#F5F0E8]">{t.name}</h3>
              <p className="mt-2 text-sm text-[#A89B8C]">{t.tagline}</p>
              <div className="mt-6 flex items-end gap-1">
                <span className="font-display text-5xl font-bold text-[#F5F0E8]">${yearly ? Math.round(t.yearly / 12) : t.monthly}</span>
                <span className="mb-1.5 text-sm text-[#6B6259]">/mo</span>
              </div>
              <p className="mt-1 h-5 text-xs text-[#6B6259]">{t.yearly > 0 ? (yearly ? `$${t.yearly} billed yearly` : "billed monthly") : "free forever"}</p>

              <ul className="my-8 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#A89B8C]">
                    <span className="mt-0.5 text-[#C8A96E]">✓</span> {f}
                  </li>
                ))}
              </ul>

              <MagneticButton
                strength={t.featured ? 0.4 : 0.2}
                onClick={() => navigate("/register")}
                className={`mt-auto inline-flex w-full items-center justify-center rounded-full px-6 py-3.5 font-semibold ${t.featured ? "bg-gold-gradient text-[#12100E] shadow-[0_8px_40px_-8px_rgba(200,169,110,0.6)]" : "border border-[#C8A96E]/30 text-[#C8A96E]"}`}
              >
                {t.cta}
              </MagneticButton>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
