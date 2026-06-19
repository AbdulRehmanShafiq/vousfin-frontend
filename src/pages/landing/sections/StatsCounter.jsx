import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
} from "framer-motion";
import { animate as animeAnimate } from "animejs";
import useReducedMotion from "../hooks/useReducedMotion";

// ─── Animated Counter Component ──────────────────────────────

function AnimatedCounter({ target, prefix = "", suffix = "", decimals = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const reducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    if (reducedMotion) {
      setDisplayValue(target.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }));
      return;
    }

    const obj = { val: 0 };
    const factor = Math.pow(10, decimals);
    
    const animation = animeAnimate(obj, {
      val: target,
      duration: 2000,
      ease: 'outExpo',
      update: () => {
        const rounded = Math.round(obj.val * factor) / factor;
        setDisplayValue(rounded.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }));
      }
    });

    return () => animation.pause();
  }, [isInView, target, reducedMotion, decimals]);

  return (
    <span ref={ref} className="font-display text-5xl md:text-6xl font-bold text-gold-gradient">
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

// ─── Animation Variants ──────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const statVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// ─── Stats Data ──────────────────────────────────────────────

const stats = [
  { target: 2000, prefix: "", suffix: "+", decimals: 0, label: "Businesses Trust vousFin" },
  { target: 4.2, prefix: "$", suffix: "B+", decimals: 1, label: "Transactions Processed" },
  { target: 99.9, prefix: "", suffix: "%", decimals: 1, label: "Uptime Guarantee" },
  { target: 150, prefix: "", suffix: "+", decimals: 0, label: "Currencies Supported" },
  { target: 50, prefix: "", suffix: "+", decimals: 0, label: "Countries Served" },
];

// ─── Component ───────────────────────────────────────────────

export default function StatsCounter() {
  return (
    <section
      id="stats"
      className="relative w-full py-20 bg-[#6B1D2B] overflow-hidden"
    >
      {/* Subtle radial gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(200, 169, 110, 0.08) 0%, transparent 70%)",
        }}
      />

      <div className="content-max relative z-10">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={statVariants}
              className={`
                flex flex-col items-center justify-center py-8
                ${index < stats.length - 1 ? "lg:border-r lg:border-[#C8A96E]/15" : ""}
              `}
            >
              <AnimatedCounter
                target={stat.target}
                prefix={stat.prefix}
                suffix={stat.suffix}
                decimals={stat.decimals}
              />
              <p className="mt-3 text-xs uppercase tracking-wider text-[#A89B8C]/60 text-center font-body">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
