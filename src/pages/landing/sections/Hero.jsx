import { lazy, Suspense, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useReducedMotion from "../hooks/useReducedMotion";
import ParticleCanvas from "../components/ParticleCanvas";
import InteractiveTilt from "../components/InteractiveTilt";
import MagneticButton from "../components/MagneticButton";
import AppWindow from "../components/AppWindow";

const GoldTorusScene = lazy(() => import("../components/GoldTorusScene"));

const EASE = [0.16, 1, 0.3, 1];

// Per-letter mask reveal: letters rise from behind a clip line.
const lineContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.035, delayChildren: 0.15 } },
};
const letterVar = {
  hidden: { y: "115%" },
  visible: { y: "0%", transition: { duration: 0.9, ease: EASE } },
};

const ctaContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 1.0 } },
};
const ctaVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};
const imageVariants = {
  hidden: { opacity: 0, x: 60, scale: 0.95 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 1, ease: EASE, delay: 0.3 } },
};

const trustLogos = [
  { name: "Acme Corp", abbr: "AC" }, { name: "Globex", abbr: "GL" },
  { name: "Initech", abbr: "IN" }, { name: "Hooli", abbr: "HO" }, { name: "Massive", abbr: "MV" },
];

// Render a headline line as masked, per-letter animated spans.
function RevealLine({ text, className, reduced }) {
  if (reduced) return <span className={`block leading-[1.02] ${className}`}>{text}</span>;
  return (
    <motion.span variants={lineContainer} className="block overflow-hidden pb-[0.12em] leading-[1.02]">
      {text.split("").map((ch, i) => (
        <motion.span key={i} variants={letterVar} className={`vf-letter ${className}`}>
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </motion.span>
  );
}

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : -90]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.85], [1, prefersReducedMotion ? 1 : 0]);
  const imageY = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 60]);

  const headlineSize = { fontSize: "clamp(3.25rem, 8vw, 6rem)" };
  const initial = prefersReducedMotion ? "visible" : "hidden";

  return (
    <section ref={sectionRef} id="hero" className="relative flex min-h-[100dvh] items-center overflow-hidden">
      {/* Background effects */}
      <div className="bg-hero-glow pointer-events-none absolute inset-0" />
      {!prefersReducedMotion && <ParticleCanvas />}
      <div className="pointer-events-none absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full bg-[#C8A96E]/[0.15] blur-[120px] animate-float" style={{ willChange: "transform" }} />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-[250px] w-[250px] rounded-full bg-[#7EB5A6]/[0.10] blur-[100px] animate-float" style={{ animationDelay: "3s", willChange: "transform" }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "radial-gradient(circle, #F5F0E8 1px, transparent 1px)", backgroundSize: "42px 42px" }} />

      {/* Main content */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="content-max section-padding relative z-10 mx-auto grid w-full grid-cols-1 gap-12 py-20 lg:grid-cols-2 lg:gap-16 lg:py-0"
      >
        {/* LEFT: Text */}
        <div className="flex flex-col justify-center">
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
            className="vf-glass-pro border-gold-subtle mb-8 inline-flex w-fit items-center gap-2.5 rounded-full px-4 py-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="bg-[#C8A96E] absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="bg-[#C8A96E] relative inline-flex h-2 w-2 rounded-full" />
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#C8A96E]">AI-Powered Fintech Solutions</span>
          </motion.div>

          <motion.h1 variants={lineContainer} initial={initial} animate="visible" style={headlineSize} className="mb-6 font-display font-bold tracking-[-0.02em]">
            <RevealLine text="Intelligence Meets" reduced={prefersReducedMotion} className="inline-block text-[#F5F0E8]" />
            <RevealLine text="Accounting" reduced={prefersReducedMotion} className="text-gold-gradient inline-block" />
          </motion.h1>

          <motion.p
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.7 }}
            className="mb-10 max-w-lg text-lg leading-relaxed text-[#A89B8C]"
          >
            vousFin combines double-entry bookkeeping, AI-driven insights, and automated forecasting to transform how SMEs manage their finances.
          </motion.p>

          <motion.div variants={ctaContainerVariants} initial={initial} animate="visible" className="mb-12 flex flex-wrap gap-4">
            <motion.div variants={ctaVariants}>
              <MagneticButton
                onClick={() => navigate("/register")}
                className="bg-gold-gradient inline-flex items-center rounded-full px-8 py-4 font-semibold text-[#12100E] shadow-[0_8px_40px_-8px_rgba(200,169,110,0.6)]"
              >
                Start Free Trial
              </MagneticButton>
            </motion.div>
            <motion.div variants={ctaVariants}>
              <MagneticButton
                strength={0.25}
                onClick={() => window.dispatchEvent(new CustomEvent("vf:open-demo"))}
                className="vf-glass-pro inline-flex items-center gap-2 rounded-full border border-[#C8A96E]/30 px-8 py-4 font-semibold text-[#C8A96E]"
              >
                <span className="text-base">▷</span> Watch Demo
              </MagneticButton>
            </motion.div>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1 }}
            transition={{ duration: 1, delay: 1.3 }}
            className="flex flex-wrap items-center gap-4"
          >
            <span className="text-sm text-[#6B6259]">Trusted by 2,000+ businesses</span>
            <div className="flex items-center gap-3">
              {trustLogos.map((logo) => (
                <div key={logo.abbr} className="flex h-8 w-12 items-center justify-center rounded-md bg-[#1A1714] text-[0.6rem] font-bold uppercase tracking-wider text-[#6B6259]" title={logo.name}>
                  {logo.abbr}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT: Image + 3D */}
        <motion.div
          variants={imageVariants}
          initial={initial}
          animate="visible"
          style={{ y: imageY }}
          className="relative flex items-center justify-center"
        >
          {!prefersReducedMotion && (
            <Suspense fallback={null}>
              <GoldTorusScene />
            </Suspense>
          )}
          <InteractiveTilt className="relative w-full max-w-xl lg:max-w-none">
            <div className="bg-gold-glow pointer-events-none absolute -inset-6 rounded-[2rem]" />
            <AppWindow
              src="/landing/shot-dashboard.png"
              alt="vousFin live financial dashboard showing revenue, expenses, profit, cash balance and AI business-intelligence alerts"
              label="app.vousfin.com / dashboard"
              className="relative z-10"
            />
          </InteractiveTilt>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      {!prefersReducedMotion && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 1 }}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        >
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-[#C8A96E]/40 p-1.5">
            <motion.span
              className="h-2 w-1 rounded-full bg-[#C8A96E]"
              animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </section>
  );
}
