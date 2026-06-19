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
  },
  {
    icon: Users,
    title: "Accounts Receivable",
    description:
      "Manage customers, invoices, and collections. Track aging and automate reminders.",
    span: "",
    featured: false,
  },
  {
    icon: CreditCard,
    title: "Accounts Payable",
    description:
      "Vendor management, bill tracking, and payment scheduling.",
    span: "",
    featured: false,
  },
  {
    icon: TrendingUp,
    title: "AI Forecasting",
    description:
      "ML-powered cash flow forecasting with LSTM neural networks. Predict revenue, expenses, and liquidity 90 days out.",
    span: "md:col-span-2",
    featured: true,
  },
  {
    icon: Banknote,
    title: "Payroll",
    description:
      "Employee management, salary processing, payslip generation, and compliance reporting.",
    span: "",
    featured: false,
  },
  {
    icon: Package,
    title: "Inventory",
    description:
      "Real-time stock tracking, valuation methods (FIFO/LIFO), and low-stock alerts.",
    span: "",
    featured: false,
  },
  {
    icon: ShoppingCart,
    title: "Procurement",
    description:
      "Purchase orders, goods receipts, and three-way matching with vendor portals.",
    span: "",
    featured: false,
  },
  {
    icon: Receipt,
    title: "Tax Engine",
    description:
      "Multi-tax support, auto-calculation, return preparation, and deadline management.",
    span: "",
    featured: false,
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
                  glass-card rounded-2xl p-6 flex flex-col gap-4
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
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
