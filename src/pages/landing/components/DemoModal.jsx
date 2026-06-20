import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "../hooks/useReducedMotion";

const EASE = [0.16, 1, 0.3, 1];

// Guided product tour. Drops in an actual <video> if /landing/demo.mp4 exists,
// otherwise plays an auto-advancing, captioned image walkthrough. Open it from
// anywhere via: window.dispatchEvent(new CustomEvent('vf:open-demo')).
const scenes = [
  { img: "/landing/ai-dashboard.jpg", title: "Your finances, at a glance", body: "One living dashboard — cash, revenue, runway, and what needs your attention today." },
  { img: "/landing/feature-ai.jpg", title: "AI that reads your numbers", body: "Anomalies flagged, transactions categorised, and a copilot that answers in plain language." },
  { img: "/landing/feature-reports.jpg", title: "Statements in one click", body: "Income statement, balance sheet and cash flow — always closing-ready, exportable anywhere." },
  { img: "/landing/feature-invoicing.jpg", title: "Invoicing on autopilot", body: "Send, track and reconcile invoices and bills while the ledger keeps itself balanced." },
];
const SCENE_MS = 3200;

export default function DemoModal() {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [hasVideo, setHasVideo] = useState(false);
  const timer = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onOpen = () => { setI(0); setOpen(true); };
    window.addEventListener("vf:open-demo", onOpen);
    return () => window.removeEventListener("vf:open-demo", onOpen);
  }, []);

  // probe for an optional generated demo video without 404-noise blocking the tour
  useEffect(() => {
    let active = true;
    fetch("/landing/demo.mp4", { method: "HEAD" })
      .then((r) => {
        const ct = r.headers.get("content-type") || "";
        if (active && r.ok && ct.startsWith("video")) setHasVideo(true);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!open) { document.body.style.overflow = ""; return; }
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, close]);

  // auto-advance the image tour
  useEffect(() => {
    if (!open || hasVideo || reduced) return;
    timer.current = setTimeout(() => setI((p) => (p + 1) % scenes.length), SCENE_MS);
    return () => clearTimeout(timer.current);
  }, [open, i, hasVideo, reduced]);

  const scene = scenes[i];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.3 }}
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-[#0a0907]/85 backdrop-blur-xl" onClick={close} />

          <motion.div
            className="vf-glass-pro relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl"
            initial={reduced ? false : { scale: 0.94, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { scale: 0.96, y: 10, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.45, ease: EASE }}
          >
            {/* window chrome */}
            <div className="flex items-center gap-2 border-b border-[#C8A96E]/10 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#E0736B]" />
              <span className="h-3 w-3 rounded-full bg-[#D4B87A]" />
              <span className="h-3 w-3 rounded-full bg-[#7EB5A6]" />
              <span className="ml-3 font-mono text-xs text-[#6B6259]">app.vousfin.com — live product tour</span>
              <button onClick={close} aria-label="Close demo" className="ml-auto text-[#A89B8C] hover:text-[#F5F0E8]">✕</button>
            </div>

            {/* stage */}
            <div className="relative aspect-video w-full overflow-hidden bg-[#0d0b09]">
              {hasVideo ? (
                <video src="/landing/demo.mp4" className="h-full w-full object-cover" autoPlay muted loop controls playsInline />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={i}
                    src={scene.img}
                    alt={scene.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={reduced ? false : { opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
                    transition={{ duration: reduced ? 0 : 0.8, ease: EASE }}
                  />
                </AnimatePresence>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0907] via-transparent to-transparent" />

              {/* caption */}
              {!hasVideo && (
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={i}
                      initial={reduced ? false : { opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                      transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
                    >
                      <h3 className="font-display text-2xl font-semibold text-[#F5F0E8]">{scene.title}</h3>
                      <p className="mt-1 max-w-lg text-sm text-[#C8B9A2]">{scene.body}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* controls */}
            <div className="flex items-center gap-4 px-6 py-4">
              {!hasVideo && (
                <div className="flex flex-1 gap-1.5">
                  {scenes.map((s, idx) => (
                    <button
                      key={s.title}
                      onClick={() => setI(idx)}
                      aria-label={`Go to ${s.title}`}
                      className="group relative h-1 flex-1 overflow-hidden rounded-full bg-[#C8A96E]/15"
                    >
                      <span className={`block h-full rounded-full bg-gold-gradient transition-all ${idx === i ? "w-full" : idx < i ? "w-full opacity-40" : "w-0"}`} />
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => { close(); navigate("/register"); }}
                className="bg-gold-gradient ml-auto shrink-0 rounded-full px-6 py-2.5 text-sm font-semibold text-[#12100E]"
              >
                Start free trial
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
