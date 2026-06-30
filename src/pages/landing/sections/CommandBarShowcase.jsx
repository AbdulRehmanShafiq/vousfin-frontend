import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowRight } from 'lucide-react'
import { useReducedMotion } from '../hooks/useReducedMotion'

const EASE = [0.16, 1, 0.3, 1]

// Plain-language queries → the page they resolve to. Mirrors the real command bar.
const EXAMPLES = [
  { q: 'who owes me money', label: 'Receivables', path: 'Sales › Receivables' },
  { q: 'reconcile the bank', label: 'Bank Reconciliation', path: 'Banking › Bank Reconciliation' },
  { q: 'how do I run payroll', label: 'How to run payroll', path: 'AI answer · Payroll › Run Payroll' },
  { q: 'profit and loss', label: 'Financial Statements', path: 'Reports › Financial Statements' },
]

export default function CommandBarShowcase() {
  const reduced = useReducedMotion()
  const [i, setI] = useState(0)

  useEffect(() => {
    if (reduced) return undefined
    const t = setInterval(() => setI((n) => (n + 1) % EXAMPLES.length), 2600)
    return () => clearInterval(t)
  }, [reduced])

  const ex = EXAMPLES[i]

  return (
    <section id="command-bar" className="relative w-full overflow-hidden">
      <div className="content-max section-padding">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#C8A96E]">Find anything, instantly</p>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Just type what you mean</h2>
          <p className="mt-3 text-base text-white/60">
            Press <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-sm">⌘K</kbd> anywhere and search by meaning —
            no menus, no memorising paths. Even &ldquo;how do I…&rdquo; gets a step-by-step answer.
          </p>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          className="mx-auto mt-10 max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur"
          aria-hidden="true"
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <Search className="h-4 w-4 text-white/50" />
            <AnimatePresence mode="wait">
              <motion.span
                key={ex.q}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="text-base text-white/90"
              >
                {ex.q}
                {!reduced && <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-white/70 align-middle" />}
              </motion.span>
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={ex.label}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="flex items-center gap-3 bg-white/[0.06] px-4 py-3"
            >
              <ArrowRight className="h-4 w-4 text-[#C8A96E]" />
              <span className="flex-1 text-left text-white">{ex.label}</span>
              <span className="text-xs text-white/40">{ex.path}</span>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
