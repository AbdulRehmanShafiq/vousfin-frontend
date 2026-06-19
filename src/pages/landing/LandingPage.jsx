import { lazy, Suspense } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import './landing.css'
import Navigation from './components/Navigation'
import Hero from './sections/Hero'
import { useReducedMotion } from './hooks/useReducedMotion'

const Features = lazy(() => import('./sections/Features'))
const AIPower = lazy(() => import('./sections/AIPower'))
const ModulesBento = lazy(() => import('./sections/ModulesBento'))
const StatsCounter = lazy(() => import('./sections/StatsCounter'))
const CTA = lazy(() => import('./sections/CTA'))
const Footer = lazy(() => import('./sections/Footer'))

function SectionFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="border-2 border-[#C8A96E]/20 border-t-[#C8A96E] rounded-full w-8 h-8 animate-spin" />
    </div>
  )
}

export default function LandingPage() {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })

  return (
    <div className="vf-landing relative min-h-[100dvh] overflow-x-hidden">
      {!reduced && (
        <motion.div
          className="bg-gold-gradient fixed left-0 right-0 top-0 z-[60] h-[3px] origin-left"
          style={{ scaleX }}
          aria-hidden="true"
        />
      )}
      <Navigation />
      <main>
        <Hero />
        <Suspense fallback={<SectionFallback />}><Features /></Suspense>
        <Suspense fallback={<SectionFallback />}><AIPower /></Suspense>
        <Suspense fallback={<SectionFallback />}><ModulesBento /></Suspense>
        <Suspense fallback={<SectionFallback />}><StatsCounter /></Suspense>
        <Suspense fallback={<SectionFallback />}><CTA /></Suspense>
        <Suspense fallback={<SectionFallback />}><Footer /></Suspense>
      </main>
    </div>
  )
}
