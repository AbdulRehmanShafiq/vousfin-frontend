/** @type {import('tailwindcss').Config} */

/*
 * VousFin design tokens — "Nocturne Ledger"
 *
 * A private bank vault at midnight: deep moss-black canvas under an aurora
 * atmosphere, obsidian-gloss cards lit from above, ONE luminous jade accent
 * (green is money), champagne gold reserved for foil details and highlights.
 * Display type is Fraunces (serif); UI is Schibsted Grotesk; figures are
 * Spline Sans Mono.
 *
 * IMPORTANT: legacy token NAMES (navy, charcoal, cyan, emerald, glass…) are
 * kept so all existing code compiles — only their VALUES changed. Every usage
 * is semantic (text-primary on bg-navy, hairline borders, etc), so the whole
 * app retunes from this file + index.css.
 */

const ACCENT = {
  DEFAULT: '#3DDC97', // luminous jade — interactive elements
  2: '#2BB67C',       // pressed / gradient anchor
  soft: 'rgba(61, 220, 151, 0.12)',
}
const GOLD = {
  DEFAULT: '#D4A94E', // champagne foil
  2: '#B68A33',
}

export default {
  content: ['./index.html', './public/**/*.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ── Surfaces (legacy names, nocturne values) ── */
        navy: {
          DEFAULT: '#070B09', // page canvas — deep moss black
          2: '#0D1411',       // card surface
        },
        charcoal: {
          DEFAULT: '#0A100D', // elevated: sidebar, modals, sheets
        },

        /* ── Accent (legacy: cyan; semantic: accent) ── */
        cyan: ACCENT,
        accent: ACCENT,
        gold: GOLD,
        amber: {
          DEFAULT: '#E0B14B', // attention = candlelight amber
          2: '#C99A38',
        },

        /* ── Money semantics ── */
        emerald: {
          DEFAULT: '#3DDC97',
          2: '#2BB67C',
          3: '#6FE8B4',
        },
        positive: { DEFAULT: '#3DDC97', muted: 'rgba(61, 220, 151, 0.10)' },
        negative: { DEFAULT: '#F2705B', muted: 'rgba(242, 112, 91, 0.10)' },

        /* ── Text hierarchy — moonlit ivory on moss black ── */
        text: {
          primary: '#E9EFEA',
          secondary: '#A3B0A8',
          muted: '#6C7A71',
        },

        /* ── Legacy light tokens (now aligned to nocturne) ── */
        brand: {
          50: '#0a1c14', 100: '#0e2a1d', 200: '#133b29', 300: '#1a5239',
          400: '#22754f', 500: '#2BB67C', 600: '#3DDC97', 700: '#6FE8B4',
          800: '#a3f2cf', 900: '#d2f9e7', 950: '#eefcf5',
        },
        surface: {
          DEFAULT: '#0D1411',
          muted: '#070B09',
          border: 'rgba(233, 239, 234, 0.08)',
        },
      },

      fontFamily: {
        sans: ['Schibsted Grotesk', 'IBM Plex Sans', 'system-ui', 'Segoe UI', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['Spline Sans Mono', 'IBM Plex Mono', 'ui-monospace', 'monospace'],
      },

      /* ── Elevation — deep night shadows + jade/gold bloom ── */
      boxShadow: {
        card: 'inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 10px 30px -14px rgba(0, 0, 0, 0.55)',
        elevated: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 24px 60px -24px rgba(0, 0, 0, 0.75)',
        'glow-cyan': '0 0 0 1px rgba(61, 220, 151, 0.18), 0 8px 28px -10px rgba(61, 220, 151, 0.35)',
        'glow-em': '0 0 0 1px rgba(61, 220, 151, 0.18), 0 8px 28px -10px rgba(61, 220, 151, 0.35)',
      },

      /* Moonlit hairlines */
      borderColor: {
        glass: 'rgba(233, 239, 234, 0.08)',
        'glass-2': 'rgba(233, 239, 234, 0.16)',
      },
      backgroundColor: {
        'glass-panel': 'rgba(233, 239, 234, 0.045)',
        'glass-hover': 'rgba(233, 239, 234, 0.07)',
      },

      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-dot': 'pulseDot 2s infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.3' } },
      },

      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
      },
    },
  },
  plugins: [],
}
