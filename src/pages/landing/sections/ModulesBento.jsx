import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  CreditCard,
  TrendingUp,
  Banknote,
  Package,
  ShoppingCart,
  Receipt,
} from "lucide-react";
import useReducedMotion from "../hooks/useReducedMotion";

const modules = [
  {
    icon: BookOpen,
    title: "General Ledger",
    description:
      "Full double-entry bookkeeping with automated journal entries, chart of accounts, and bank reconciliation.",
    span: "md:col-span-2",
    featured: true,
    img: "/landing/shot-ledger.png",
  },
  {
    icon: Users,
    title: "Accounts Receivable",
    description:
      "Manage customers, invoices, and collections. Track aging and automate reminders.",
    span: "",
    featured: false,
    img: "/landing/shot-transactions.png",
  },
  {
    icon: CreditCard,
    title: "Tax Autopilot",
    description:
      "Live tax position by type, deadline countdowns, and one-click return preparation.",
    span: "",
    featured: false,
    img: "/landing/shot-tax.png",
  },
  {
    icon: TrendingUp,
    title: "AI Forecasting",
    description:
      "ML-powered cash flow forecasting with LSTM neural networks. Predict revenue, expenses, and liquidity 90 days out.",
    span: "md:col-span-2",
    featured: true,
    img: "/landing/shot-forecast.png",
  },
  {
    icon: Banknote,
    title: "Payroll",
    description:
      "Employee management, salary processing, payslip generation, and compliance reporting.",
    span: "",
    featured: false,
    img: "/landing/shot-payroll.png",
  },
  {
    icon: Package,
    title: "Inventory",
    description:
      "Real-time stock tracking, valuation methods (FIFO/LIFO), and low-stock alerts.",
    span: "",
    featured: false,
    img: "/landing/shot-inventory.png",
  },
  {
    icon: ShoppingCart,
    title: "Command Center",
    description:
      "A policy-governed AI finance team that handles routines, drafts work, and asks before it acts.",
    span: "md:col-span-2",
    featured: true,
    img: "/landing/shot-command.png",
  },
  {
    icon: Receipt,
    title: "Multi-Currency",
    description:
      "Live FX rates, automatic IAS 21 gain/loss entries, and reporting in any currency.",
    span: "",
    featured: false,
    img: "/landing/shot-fx.png",
  },
];

const headingVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function ModulesBento() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="modules"
      className="bg-[#12100E] section-padding content-max"
    >
      <div className="mx-auto">
        {/* Heading */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={headingVariants}
        >
          <h2
            className="font-display font-bold leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            <span className="text-[#F5F0E8]">One Platform.</span>
            <br />
            <span className="text-gold-gradient">Every Financial Workflow.</span>
          </h2>
          <p className="mt-5 text-[#A89B8C] text-lg max-w-2xl mx-auto">
            Eight powerful modules that connect seamlessly across your entire
            finance operation.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
        >
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.title}
                className={`
                  glass-card vf-liquidglass rounded-2xl p-6 flex flex-col gap-4
                  ${mod.span}
                  ${
                    mod.featured
                      ? "bg-gradient-to-br from-[#C8A96E]/10 to-transparent border-[#C8A96E]/20"
                      : ""
                  }
                `}
                variants={reducedMotion ? {} : cardVariants}
                whileHover={
                  reducedMotion
                    ? {}
                    : {
                        y: -6,
                        scale: 1.03,
                        borderColor: "rgba(200, 169, 110, 0.2)",
                        boxShadow:
                          "0 0 40px rgba(200, 169, 110, 0.15), 0 0 80px rgba(200, 169, 110, 0.08)",
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        },
                      }
                }
              >
                {/* Icon */}
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C8A96E]/15 to-[#C4886A]/8 flex items-center justify-center"
                  whileHover={
                    reducedMotion
                      ? {}
                      : {
                          rotate: 5,
                          scale: 1.1,
                          transition: {
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          },
                        }
                  }
                >
                  <Icon size={22} className="text-[#C8A96E]" />
                </motion.div>

                {/* Text */}
                <div className="flex flex-col gap-2">
                  <h3 className="font-display text-base font-semibold text-[#F5F0E8]">
                    {mod.title}
                  </h3>
                  <p className="text-sm text-[#A89B8C] leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                {/* Real screenshot preview */}
                {mod.img && (
                  <div className="group mt-auto overflow-hidden rounded-xl border border-[#C8A96E]/10 bg-[#0d0b09]">
                    <div className="flex items-center gap-1.5 border-b border-[#C8A96E]/10 px-3 py-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E0736B]/70" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D4B87A]/70" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#7EB5A6]/70" />
                    </div>
                    <div className={`overflow-hidden ${mod.featured ? "aspect-[16/7]" : "aspect-[16/9]"}`}>
                      <img
                        src={mod.img}
                        alt={`${mod.title} screen`}
                        loading="lazy"
                        draggable={false}
                        className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
