import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useReducedMotion } from "../hooks/useReducedMotion";

const heroWords = "Ready to Transform Your Finances?".split(" ");

/* ---------- sparkle positions (x%, y%) ---------- */
const sparkles = [
  { x: 8, y: 15, size: 16, delay: 0, duration: 2.5 },
  { x: 88, y: 20, size: 20, delay: 0.5, duration: 3 },
  { x: 15, y: 75, size: 14, delay: 1.2, duration: 2.8 },
  { x: 82, y: 70, size: 18, delay: 0.8, duration: 2.2 },
  { x: 5, y: 45, size: 12, delay: 1.5, duration: 3.2 },
  { x: 92, y: 50, size: 15, delay: 2, duration: 2.6 },
];

const wordContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const wordItem = (reduced) => ({
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: reduced
      ? { duration: 0.01 }
      : { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
});

export default function CTA() {
  const reduced = useReducedMotion();

  return (
    <section
      id="cta"
      className="relative w-full overflow-hidden bg-[#12100E] py-32"
    >
      {/* ---- background glow ---- */}
      <div
        className="pointer-events-none absolute inset-0 bg-gold-glow"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(107,29,43,0.18) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* ---- floating sparkles ---- */}
      {sparkles.map((s, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute text-[#C8A96E]"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
          }}
          animate={
            reduced
              ? { opacity: 0.5 }
              : {
                  opacity: [0, 0.7, 0],
                }
          }
          transition={
            reduced
              ? {}
              : {
                  duration: s.duration,
                  repeat: Infinity,
                  delay: s.delay,
                  ease: "easeInOut",
                }
          }
          aria-hidden="true"
        >
          <Sparkles size={s.size} />
        </motion.div>
      ))}

      {/* ---- content ---- */}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6">
        {/* h2 — word by word */}
        <motion.h2
          className="font-display text-[#F5F0E8]"
          style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: 1.15 }}
          variants={wordContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          {heroWords.map((word, i) => (
            <motion.span
              key={i}
              className="mr-[0.3em] inline-block"
              variants={wordItem(reduced)}
            >
              {word}
            </motion.span>
          ))}
        </motion.h2>

        {/* subtext */}
        <motion.p
          className="mt-6 max-w-xl text-lg text-[#A89B8C]"
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={
            reduced
              ? { duration: 0.01 }
              : { duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }
          }
        >
          Join 2,000+ businesses already using vousFin to streamline their
          accounting.
        </motion.p>

        {/* buttons */}
        <motion.div
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={
            reduced
              ? { duration: 0.01 }
              : { duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }
          }
        >
          {/* primary CTA with pulsing ring */}
          <div className="relative">
            {/* pulsing ring */}
            {!reduced && (
              <motion.div
                className="absolute inset-0 rounded-full bg-[#C8A96E]/30"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
            <motion.button
              className="relative z-10 bg-gold-gradient px-10 py-4 font-body font-semibold text-[#12100E] rounded-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              transition={
                reduced
                  ? { duration: 0.01 }
                  : { type: "spring", stiffness: 80, damping: 20 }
              }
            >
              Start Free Trial
            </motion.button>
          </div>

          {/* secondary CTA */}
          <motion.button
            className="glass-card border border-[#C8A96E]/30 px-10 py-4 font-body font-semibold text-[#C8A96E] rounded-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={
              reduced
                ? { duration: 0.01 }
                : { type: "spring", stiffness: 80, damping: 20 }
            }
          >
            Contact Sales
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
