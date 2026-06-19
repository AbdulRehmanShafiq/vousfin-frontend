import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "../hooks/useReducedMotion";

const features = [
  "Anomaly detection with 99.2% accuracy",
  "90-day cash flow forecasting",
  "Natural language financial queries",
  "Automated transaction categorization",
];

export default function AIPower() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  const prefersReduced = useReducedMotion();
  const navigate = useNavigate();

  const showContent = prefersReduced || isInView;

  return (
    <section
      id="ai-power"
      className="relative w-full bg-[#12100E] overflow-hidden"
    >
      {/* Subtle pulsing gold orb behind the image */}
      <div className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#C8A96E]/20 blur-3xl animate-pulse-glow pointer-events-none" />

      <div
        ref={ref}
        className="content-max section-padding flex flex-col lg:flex-row items-center gap-12 lg:gap-16 py-24 lg:py-32"
      >
        {/* LEFT COLUMN */}
        <motion.div
          className="flex-1 max-w-xl"
          initial="hidden"
          animate={showContent ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.12,
                delayChildren: 0,
              },
            },
          }}
        >
          {/* Label */}
          <motion.span
            variants={{
              hidden: { x: -30, opacity: 0 },
              visible: {
                x: 0,
                opacity: 1,
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className="font-mono text-xs tracking-[0.25em] text-[#C8A96E] uppercase inline-block"
          >
            Artificial Intelligence
          </motion.span>

          {/* H2 */}
          <motion.h2
            variants={{
              hidden: { x: -30, opacity: 0 },
              visible: {
                x: 0,
                opacity: 1,
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className="font-display font-bold mt-4 leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            <span className="text-[#F5F0E8]">Your </span>
            <span className="text-gold-gradient">AI</span>
            <span className="text-[#F5F0E8]"> Finance Copilot</span>
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={{
              hidden: { x: -30, opacity: 0 },
              visible: {
                x: 0,
                opacity: 1,
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className="text-[#A89B8C] text-lg leading-relaxed max-w-lg mt-6"
          >
            vousFin's AI engine learns your business patterns to deliver
            proactive insights. Detect anomalies before they become problems,
            forecast cash flow with machine learning, and get natural language
            answers to any financial question.
          </motion.p>

          {/* Feature List */}
          <motion.ul
            className="mt-8 space-y-4"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.12 },
              },
            }}
          >
            {features.map((feature, i) => (
              <motion.li
                key={i}
                variants={{
                  hidden: { x: -30, opacity: 0 },
                  visible: {
                    x: 0,
                    opacity: 1,
                    transition: {
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  },
                }}
                className="flex items-center gap-3"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#C8A96E]/20 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-[#C8A96E]" strokeWidth={2.5} />
                </span>
                <span className="text-[#A89B8C] text-sm font-medium">
                  {feature}
                </span>
              </motion.li>
            ))}
          </motion.ul>

          {/* CTA */}
          <motion.div
            variants={{
              hidden: { x: -30, opacity: 0 },
              visible: {
                x: 0,
                opacity: 1,
                transition: {
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                  type: "spring",
                  stiffness: 80,
                  damping: 20,
                },
              },
            }}
            className="mt-10"
          >
            <button 
              className="bg-gold-gradient text-[#12100E] px-7 py-3.5 rounded-full font-semibold text-sm transition-transform duration-200 hover:scale-105 active:scale-95"
              onClick={() => navigate('/register')}
            >
              Explore AI Features
            </button>
          </motion.div>
        </motion.div>

        {/* RIGHT COLUMN */}
        <motion.div
          initial={{ x: 50, opacity: 0, scale: 0.95 }}
          animate={
            isInView && !prefersReduced
              ? { x: 0, opacity: 1, scale: 1 }
              : { x: 50, opacity: 0, scale: 0.95 }
          }
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.3,
          }}
          className="flex-1 w-full max-w-2xl relative"
        >
          <div className="glass-card rounded-2xl p-2 border-gold-subtle">
            <img
              src="/landing/ai-dashboard.jpg"
              alt="vousFin AI Dashboard"
              className="w-full h-auto rounded-xl object-cover"
              loading="lazy"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
