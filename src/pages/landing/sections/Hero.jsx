import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useReducedMotion from "../hooks/useReducedMotion";
import ParticleCanvas from "../components/ParticleCanvas";
import InteractiveTilt from "../components/InteractiveTilt";
import { lazy, Suspense } from "react";

const GoldTorusScene = lazy(() => import("../components/GoldTorusScene"));

// ─── Animation Variants ──────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};


const imageVariants = {
  hidden: { opacity: 0, x: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const ctaContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.8,
    },
  },
};

const ctaVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

// ─── Trust Bar Placeholder Data ──────────────────────────────

const trustLogos = [
  { name: "Acme Corp", abbr: "AC" },
  { name: "Globex", abbr: "GL" },
  { name: "Initech", abbr: "IN" },
  { name: "Hooli", abbr: "HO" },
  { name: "Massive", abbr: "MV" },
];

// ─── H1 Word Splitter ────────────────────────────────────────

const splitWords = (text) => text.split(" ");

// ─── Hero Section ────────────────────────────────────────────

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();

  const reduced = {
    initial: "visible",
    animate: "visible",
    whileInView: undefined,
    viewport: undefined,
  };

  const animated = {
    initial: "hidden",
    animate: "visible",
    whileInView: undefined,
    viewport: undefined,
  };

  const animProps = prefersReducedMotion ? reduced : animated;
  const imageAnimProps = prefersReducedMotion ? reduced : {
    initial: "hidden",
    animate: "visible",
    whileInView: undefined,
    viewport: undefined,
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-[100dvh] items-center overflow-hidden"
    >
      {/* ─── Background Effects ─────────────────────────── */}

      {/* Radial glow */}
      <div className="bg-hero-glow pointer-events-none absolute inset-0" />

      {/* Particle Canvas */}
      {!prefersReducedMotion && <ParticleCanvas />}

      {/* Gold orb — top-right */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full bg-[#C8A96E]/[0.15] blur-[120px] animate-float"
        style={{ willChange: "transform" }}
      />

      {/* Teal orb — bottom-left */}
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-[250px] w-[250px] rounded-full bg-[#7EB5A6]/[0.10] blur-[100px] animate-float"
        style={{ animationDelay: "3s", willChange: "transform" }}
      />

      {/* Dot grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #F5F0E8 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ─── Main Content ──────────────────────────────── */}

      <div className="content-max section-padding relative z-10 mx-auto grid w-full grid-cols-1 gap-12 py-20 lg:grid-cols-2 lg:gap-16 lg:py-0">
        {/* ─── LEFT COLUMN: Text ─────────────────────── */}

        <div className="flex flex-col justify-center">
          {/* Badge */}
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="glass-card border-gold-subtle mb-8 inline-flex w-fit items-center gap-2.5 rounded-full px-4 py-2"
          >
            {/* Pulsing gold dot */}
            <span className="relative flex h-2 w-2">
              <span className="bg-[#C8A96E] absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="bg-[#C8A96E] relative inline-flex h-2 w-2 rounded-full" />
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#C8A96E]">
              AI-Powered Fintech Solutions
            </span>
          </motion.div>

          {/* H1 — Staggered Word Reveal */}
          <motion.h1
            {...animProps}
            variants={containerVariants}
            className="mb-6 font-display"
          >
            {/* Line 1: "Intelligence Meets" */}
            <span className="mb-2 block leading-[1.05]">
              {splitWords("Intelligence Meets").map((word, i) => (
                <motion.span
                  key={`l1-${i}`}
                  variants={wordVariants}
                  className="mr-[0.25em] inline-block font-bold text-[#F5F0E8]"
                  style={{
                    fontSize: "clamp(3rem, 7vw, 5.5rem)",
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </span>

            {/* Line 2: "Accounting" */}
            <span className="block leading-[1.05]">
              {splitWords("Accounting").map((word, i) => (
                <motion.span
                  key={`l2-${i}`}
                  variants={wordVariants}
                  className="text-gold-gradient mr-[0.25em] inline-block font-bold"
                  style={{
                    fontSize: "clamp(3rem, 7vw, 5.5rem)",
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
            className="mb-10 max-w-lg text-lg leading-relaxed text-[#A89B8C]"
          >
            vousFin combines double-entry bookkeeping, AI-driven insights, and
            automated forecasting to transform how SMEs manage their finances.
          </motion.p>

          {/* CTA Row */}
          <motion.div
            {...ctaContainerVariants}
            className="mb-12 flex flex-wrap gap-4"
          >
            {/* Start Free Trial */}
            <motion.button
              variants={ctaVariants}
              whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.97 }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
              className="bg-gold-gradient rounded-full px-8 py-4 font-semibold text-[#12100E] shadow-lg"
              onClick={() => navigate("/register")}
            >
              Start Free Trial
            </motion.button>

            {/* Watch Demo */}
            <motion.button
              variants={ctaVariants}
              whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.97 }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
              className="glass-card rounded-full border border-[#C8A96E]/30 px-8 py-4 font-semibold text-[#C8A96E]"
              onClick={() => {
                const el = document.getElementById("ai-power");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Trust mini-bar */}
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex flex-wrap items-center gap-4"
          >
            <span className="text-sm text-[#6B6259]">
              Trusted by 2,000+ businesses
            </span>
            <div className="flex items-center gap-3">
              {trustLogos.map((logo, i) => (
                <div
                  key={i}
                  className="flex h-8 w-12 items-center justify-center rounded-md bg-[#1A1714] text-[0.6rem] font-bold uppercase tracking-wider text-[#6B6259]"
                  title={logo.name}
                >
                  {logo.abbr}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ─── RIGHT COLUMN: Image ────────────────────── */}

        <motion.div
          {...imageAnimProps}
          variants={imageVariants}
          className="flex items-center justify-center relative"
        >
          {/* Gold Torus 3D Scene */}
          {!prefersReducedMotion && (
            <Suspense fallback={null}>
              <GoldTorusScene />
            </Suspense>
          )}

          <InteractiveTilt className="relative w-full max-w-xl lg:max-w-none">
            {/* Gold glow behind image */}
            <div className="bg-gold-glow pointer-events-none absolute -inset-4 rounded-[2rem]" />

            {/* Image */}
            <img
              src="/landing/hero-visual.jpg"
              alt="vousFin AI-powered financial dashboard visualization showing neural network analytics and automated bookkeeping insights"
              className="relative z-10 h-auto w-full rounded-2xl object-cover shadow-2xl"
              loading="eager"
            />

            {/* Subtle gold border overlay */}
            <div className="pointer-events-none absolute inset-0 z-20 rounded-2xl border border-[#C8A96E]/20 shadow-[inset_0_0_60px_rgba(200,169,110,0.05)]" />
          </InteractiveTilt>
        </motion.div>
      </div>
    </section>
  );
}
