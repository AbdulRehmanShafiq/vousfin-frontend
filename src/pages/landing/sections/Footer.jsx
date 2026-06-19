import { motion } from "framer-motion";
import { Github, Twitter, Linkedin } from "lucide-react";
import { useReducedMotion } from "../hooks/useReducedMotion";

const productLinks = [
  "Dashboard",
  "Transactions",
  "Reports",
  "AI Assistant",
  "Forecasting",
];
const companyLinks = ["About", "Blog", "Careers", "Contact"];
const legalLinks = ["Privacy", "Terms", "Security", "GDPR"];

const linkContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const linkItem = (reduced) => ({
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: reduced
      ? { duration: 0.01 }
      : { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
});

const socialIcon = (reduced, delay) => ({
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: reduced
      ? { duration: 0.01 }
      : { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
  },
});

export default function Footer() {
  const reduced = useReducedMotion();

  return (
    <footer className="w-full border-t border-[#C8A96E]/[0.08] bg-[#1A1714] py-16">
      <div className="content-max">
        {/* ---- 4-column grid ---- */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* Column 1: Logo + Description */}
          <motion.div
            className="col-span-2 md:col-span-1"
            initial={reduced ? {} : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={
              reduced
                ? { duration: 0.01 }
                : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
            }
          >
            <div className="font-display text-xl font-semibold">
              <span className="text-[#F5F0E8]">vous</span>
              <span className="text-gold-gradient">Fin</span>
            </div>
            <p className="mt-3 text-sm text-[#6B6259] leading-relaxed">
              AI-powered smart accounting for modern businesses.
            </p>
          </motion.div>

          {/* Column 2: Product */}
          <motion.div
            variants={linkContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#A89B8C]">
              Product
            </h3>
            <ul className="space-y-3">
              {productLinks.map((label) => (
                <motion.li key={label} variants={linkItem(reduced)}>
                  <a
                    href="#"
                    className="group inline-flex items-center text-sm text-[#A89B8C] transition-colors hover:text-[#C8A96E]"
                  >
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      {label}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Company */}
          <motion.div
            variants={linkContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#A89B8C]">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((label) => (
                <motion.li key={label} variants={linkItem(reduced)}>
                  <a
                    href="#"
                    className="group inline-flex items-center text-sm text-[#A89B8C] transition-colors hover:text-[#C8A96E]"
                  >
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      {label}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Legal */}
          <motion.div
            variants={linkContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#A89B8C]">
              Legal
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((label) => (
                <motion.li key={label} variants={linkItem(reduced)}>
                  <a
                    href="#"
                    className="group inline-flex items-center text-sm text-[#A89B8C] transition-colors hover:text-[#C8A96E]"
                  >
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      {label}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* ---- bottom bar ---- */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-[#C8A96E]/[0.08] pt-8 sm:flex-row">
          {/* copyright */}
          <motion.p
            className="text-xs text-[#6B6259]"
            initial={reduced ? {} : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={reduced ? { duration: 0.01 } : { duration: 0.6, delay: 0.4 }}
          >
            &copy; 2026 vousFin. All rights reserved.
          </motion.p>

          {/* social icons */}
          <motion.div
            className="flex items-center gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.a
              href="#"
              aria-label="GitHub"
              variants={socialIcon(reduced, 0.6)}
              className="text-[#6B6259] transition-colors hover:text-[#C8A96E]"
            >
              <Github size={18} />
            </motion.a>
            <motion.a
              href="#"
              aria-label="Twitter"
              variants={socialIcon(reduced, 0.7)}
              className="text-[#6B6259] transition-colors hover:text-[#C8A96E]"
            >
              <Twitter size={18} />
            </motion.a>
            <motion.a
              href="#"
              aria-label="LinkedIn"
              variants={socialIcon(reduced, 0.8)}
              className="text-[#6B6259] transition-colors hover:text-[#C8A96E]"
            >
              <Linkedin size={18} />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
