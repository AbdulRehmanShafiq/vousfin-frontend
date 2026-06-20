import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";
import {
  BookOpen,
  Brain,
  FileText,
  BarChart3,
  Calculator,
  Globe,
} from "lucide-react";

/* ─── Data ─── */
const features = [
  {
    title: "Double-Entry Bookkeeping",
    icon: BookOpen,
    image: "/landing/feature-bookkeeping.jpg",
    description:
      "Full GAAP-compliant general ledger with automated journal entries, chart of accounts, and trial balance.",
  },
  {
    title: "AI-Powered Insights",
    icon: Brain,
    image: "/landing/feature-ai.png",
    description:
      "Get intelligent anomaly detection, cash flow forecasting, and predictive analytics trained on your data.",
  },
  {
    title: "Invoicing & Bills",
    icon: FileText,
    image: "/landing/feature-invoicing.jpg",
    description:
      "Create professional invoices, track bills, manage AR/AP aging, and automate payment reminders.",
  },
  {
    title: "Financial Reports",
    icon: BarChart3,
    image: "/landing/feature-reports.jpg",
    description:
      "Generate P&L, balance sheets, cash flow statements, and custom reports with one click.",
  },
  {
    title: "Tax Autopilot",
    icon: Calculator,
    image: "/landing/feature-tax.jpg",
    description:
      "Auto-calculate tax liabilities, prepare returns, and never miss a filing deadline.",
  },
  {
    title: "Multi-Currency",
    icon: Globe,
    image: "/landing/feature-currency.jpg",
    description:
      "Support for 150+ currencies with real-time exchange rates and automatic conversion.",
  },
];

/* ─── Animation presets ─── */
const easeOut = [0.16, 1, 0.3, 1];

const headingVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easeOut },
  },
};

const cardsContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: easeOut },
  },
};

/* ─── Components ─── */
function FeatureCard({ feature }) {
  const Icon = feature.icon;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { type: "spring", stiffness: 80, damping: 20 },
      }}
      className="glass-card vf-liquidglass group overflow-hidden rounded-2xl border border-transparent transition-colors duration-300 hover:border-[#C8A96E]/20 hover:shadow-[0_0_30px_rgba(200,169,110,0.12)]"
    >
      {/* Image */}
      <div className="relative h-40 w-full overflow-hidden border-b border-[#C8A96E]/10">
        <img
          src={feature.image}
          alt={feature.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Icon */}
        <motion.div
          whileHover={{ rotate: 5, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#C8A96E]/15 to-[#C4886A]/8"
        >
          <Icon className="h-6 w-6 text-[#C8A96E]" strokeWidth={1.5} />
        </motion.div>

        {/* Title */}
        <h3 className="mb-2 font-display text-lg text-[#F5F0E8]">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="font-body text-sm leading-relaxed text-[#A89B8C]">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Main Section ─── */
export default function Features() {
  const prefersReducedMotion = useReducedMotion();
  const headingRef = useRef(null);
  const cardsRef = useRef(null);

  const headingInView = useInView(headingRef, { once: true, amount: 0.3 });
  const cardsInView = useInView(cardsRef, { once: true, amount: 0.15 });

  return (
    <section id="features" className="relative">
      {/* ── Features ── */}
      <div className="section-padding bg-[#12100E]">
        <div className="content-max mx-auto">
          {/* Heading */}
          <motion.div
            ref={headingRef}
            initial="hidden"
            animate={prefersReducedMotion ? "visible" : headingInView ? "visible" : "hidden"}
            variants={headingVariants}
            className="mb-16 text-center"
          >
            <h2
              className="font-display font-bold leading-tight"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              <span className="text-[#F5F0E8]">Everything You Need </span>
              <span className="text-gold-gradient">to Run Your Finances</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl font-body text-lg text-[#A89B8C]">
              A complete suite of intelligent financial tools designed for modern
              businesses.
            </p>
          </motion.div>

          {/* Cards Grid */}
          <motion.div
            ref={cardsRef}
            initial="hidden"
            animate={prefersReducedMotion ? "visible" : cardsInView ? "visible" : "hidden"}
            variants={cardsContainer}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
