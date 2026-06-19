import { motion } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";

const Github = ({ size, className }) => (
  <svg width={size} height={size} className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"></path></svg>
);

const Twitter = ({ size, className }) => (
  <svg width={size} height={size} className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
);

const Linkedin = ({ size, className }) => (
  <svg width={size} height={size} className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path><circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2"></circle></svg>
);

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
              {productLinks.map((label) => {
                const targetId = label === "Dashboard" ? "hero" :
                                 label === "Transactions" ? "modules" :
                                 label === "Reports" ? "features" :
                                 label === "AI Assistant" ? "ai-power" :
                                 label === "Forecasting" ? "modules" : "hero";
                return (
                  <motion.li key={label} variants={linkItem(reduced)}>
                    <a
                      href={`#${targetId}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById(targetId);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className="group inline-flex items-center text-sm text-[#A89B8C] transition-colors hover:text-[#C8A96E]"
                    >
                      <span className="transition-transform duration-200 group-hover:translate-x-1">
                        {label}
                      </span>
                    </a>
                  </motion.li>
                );
              })}
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
                    href="#" onClick={(e) => e.preventDefault()}
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
                    href="#" onClick={(e) => e.preventDefault()}
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
              href="#" onClick={(e) => e.preventDefault()}
              aria-label="GitHub"
              variants={socialIcon(reduced, 0.6)}
              className="text-[#6B6259] transition-colors hover:text-[#C8A96E]"
            >
              <Github size={18} />
            </motion.a>
            <motion.a
              href="#" onClick={(e) => e.preventDefault()}
              aria-label="Twitter"
              variants={socialIcon(reduced, 0.7)}
              className="text-[#6B6259] transition-colors hover:text-[#C8A96E]"
            >
              <Twitter size={18} />
            </motion.a>
            <motion.a
              href="#" onClick={(e) => e.preventDefault()}
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
