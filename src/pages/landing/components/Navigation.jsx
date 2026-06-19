import { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import { useReducedMotion } from "../hooks/useReducedMotion";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "AI Power", href: "#ai-power" },
  { label: "Modules", href: "#modules" },
  { label: "Pricing", href: "#pricing" },
];

const handleSmoothScroll = (e, href) => {
  e.preventDefault();
  const id = href.replace("#", "");
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();

  const bgOpacity = useTransform(scrollY, [0, 50], [0, 1]);
  const borderOpacity = useTransform(scrollY, [0, 50], [0, 1]);
  const backdropBlur = useTransform(scrollY, [0, 50], [0, 16]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 100, damping: 20 },
    },
  };

  const logoVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 100, damping: 20, delay: 0.1 },
    },
  };

  const linksContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.06,
        delayChildren: prefersReducedMotion ? 0 : 0.2,
      },
    },
  };

  const linkItemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const ctaVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 80, damping: 20, delay: 0.45 },
    },
  };

  const mobileMenuVariants = {
    hidden: { x: "100%" },
    visible: {
      x: "0%",
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: {
      x: "100%",
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const mobileLinkVariants = {
    hidden: { x: 40, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50"
        variants={navVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: scrolled ? "rgba(18, 16, 14, 0.7)" : "transparent",
            backdropFilter: prefersReducedMotion ? "none" : scrolled ? "blur(16px)" : "none",
            WebkitBackdropFilter: prefersReducedMotion ? "none" : scrolled ? "blur(16px)" : "none",
            borderBottom: scrolled ? "1px solid rgba(200, 169, 110, 0.06)" : "1px solid transparent",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <motion.a
              href="#"
              className="flex items-center gap-0.5 shrink-0"
              variants={logoVariants}
              initial="hidden"
              animate="visible"
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <span className="font-display text-xl font-semibold text-[#F5F0E8]">
                vous
              </span>
              <span className="font-display text-xl font-semibold text-gold-gradient">
                Fin
              </span>
              <span
                className="ml-0.5 w-1.5 h-1.5 rounded-full bg-gold-gradient inline-block"
              />
            </motion.a>

            {/* Desktop Links */}
            <motion.div
              className="hidden lg:flex items-center gap-8"
              variants={linksContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {navLinks.map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="font-body text-sm text-[#A89B8C] hover:text-[#C8A96E] transition-colors duration-300"
                  variants={linkItemVariants}
                  whileHover={prefersReducedMotion ? {} : { y: -1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {link.label}
                </motion.a>
              ))}
            </motion.div>

            {/* Desktop CTA */}
            <motion.a
              href="#pricing"
              onClick={(e) => handleSmoothScroll(e, "#pricing")}
              className="hidden lg:inline-flex items-center bg-gold-gradient text-[#12100E] font-body font-semibold text-sm px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity duration-300"
              variants={ctaVariants}
              initial="hidden"
              animate="visible"
              whileHover={prefersReducedMotion ? {} : { scale: 1.04 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              Get Started
            </motion.a>

            {/* Mobile Hamburger */}
            <motion.button
              className="lg:hidden relative z-50 w-10 h-10 flex items-center justify-center text-[#F5F0E8]"
              onClick={() => setMobileOpen(!mobileOpen)}
              whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                  >
                    <X size={22} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                  >
                    <Menu size={22} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-[#12100E]/60 backdrop-blur-sm"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-40 w-[280px] bg-[#1A1714] border-l border-[rgba(200,169,110,0.08)] flex flex-col pt-20 px-6 pb-8"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Mobile Links */}
              <motion.div
                className="flex flex-col gap-1"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: prefersReducedMotion ? 0 : 0.08,
                      delayChildren: prefersReducedMotion ? 0 : 0.15,
                    },
                  },
                }}
              >
                {navLinks.map((link) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      handleSmoothScroll(e, link.href);
                      setMobileOpen(false);
                    }}
                    className="font-body text-base text-[#A89B8C] hover:text-[#C8A96E] py-3 px-2 rounded-lg hover:bg-[#24201C]/60 transition-colors duration-200"
                    variants={mobileLinkVariants}
                    whileTap={{ scale: 0.98 }}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </motion.div>

              {/* Divider */}
              <div className="my-6 border-t border-[rgba(200,169,110,0.08)]" />

              {/* Mobile CTA */}
              <motion.a
                href="#pricing"
                onClick={(e) => {
                  handleSmoothScroll(e, "#pricing");
                  setMobileOpen(false);
                }}
                className="inline-flex items-center justify-center bg-gold-gradient text-[#12100E] font-body font-semibold text-sm px-5 py-3 rounded-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.4,
                  delay: prefersReducedMotion ? 0 : 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                Get Started
              </motion.a>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
