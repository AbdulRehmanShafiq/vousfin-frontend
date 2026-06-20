import { motion } from "framer-motion";
import useReducedMotion from "../hooks/useReducedMotion";

const EASE = [0.16, 1, 0.3, 1];

// Shared scroll-reveal vocabulary so every section enters with its OWN buttery
// transition while staying cohesive. Transform/opacity (+ clip-path) only — no
// filter:blur. All variants collapse to instant under reduced-motion.
const V = {
  rise:    { hidden: { opacity: 0, y: 40 },                                   show: { opacity: 1, y: 0 } },
  fade:    { hidden: { opacity: 0 },                                          show: { opacity: 1 } },
  scaleIn: { hidden: { opacity: 0, scale: 0.94, y: 24 },                      show: { opacity: 1, scale: 1, y: 0 } },
  left:    { hidden: { opacity: 0, x: -48 },                                  show: { opacity: 1, x: 0 } },
  right:   { hidden: { opacity: 0, x: 48 },                                   show: { opacity: 1, x: 0 } },
  clipUp:  { hidden: { opacity: 0, y: 56, clipPath: "inset(0 0 100% 0)" },    show: { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" } },
};

export default function Reveal({
  variant = "rise",
  delay = 0,
  duration = 0.65,
  amount = 0.2,
  as = "div",
  className,
  children,
  ...rest
}) {
  const reduced = useReducedMotion();
  const M = motion[as] || motion.div;
  if (reduced) return <M className={className} {...rest}>{children}</M>;
  return (
    <M
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={V[variant] || V.rise}
      transition={{ duration, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </M>
  );
}

// Stagger container — children should be <Stagger.Item>.
export function Stagger({ gap = 0.1, delayChildren = 0, amount = 0.2, as = "div", className, children, ...rest }) {
  const reduced = useReducedMotion();
  const M = motion[as] || motion.div;
  if (reduced) return <M className={className} {...rest}>{children}</M>;
  return (
    <M
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren } } }}
      {...rest}
    >
      {children}
    </M>
  );
}

export function StaggerItem({ variant = "rise", duration = 0.6, as = "div", className, children, ...rest }) {
  const reduced = useReducedMotion();
  const M = motion[as] || motion.div;
  if (reduced) return <M className={className} {...rest}>{children}</M>;
  return (
    <M className={className} variants={V[variant] || V.rise} transition={{ duration, ease: EASE }} {...rest}>
      {children}
    </M>
  );
}
