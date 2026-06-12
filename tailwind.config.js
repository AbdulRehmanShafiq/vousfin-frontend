/** @type {import('tailwindcss').Config} */

/*
 * VousFin design tokens — "Heritage Ledger"
 *
 * A premium private-banking identity: warm ivory paper canvas, white cards,
 * ink typography, ONE deep forest-green accent (interactive), gold reserved
 * for highlights/badges. Money semantics: green in, warm red out.
 * Display type is Fraunces (serif); UI is IBM Plex Sans; figures IBM Plex Mono.
 *
 * IMPORTANT: legacy token NAMES (navy, charcoal, cyan, emerald, glass…) are
 * kept so all existing code compiles — only their VALUES changed. The app was
 * dark; these same tokens now express the light heritage theme because every
 * usage is semantic (text-primary on bg-navy, hairline borders, etc).
 */

const ACCENT = {
  DEFAULT: '#1E5A3C', // deep forest green — interactive elements
  2: '#143F2A',       // pressed / gradient anchor
  soft: 'rgba(30, 90, 60, 0.10)',
}
const GOLD = {
  DEFAULT: '#B98A2F',
  2: '#9A7226',
}

export default {
  content: ['./index.html', './public/**/*.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ── Surfaces (legacy names, heritage values) ── */
        navy: {
          DEFAULT: '#F6F4EE', // page canvas — warm ivory paper
          2: '#FFFFFF',       // card surface
        },
        charcoal: {
          DEFAULT: '#FCFBF7', // elevated: sidebar, modals, sheets (warm white)
        },

        /* ── Accent (legacy: cyan; semantic: accent) ── */
        cyan: ACCENT,
        accent: ACCENT,
        gold: GOLD,
        amber: {
          DEFAULT: '#B98A2F', // attention = heritage gold
          2: '#9A7226',
        },

        /* ── Money semantics ── */
        emerald: {
          DEFAULT: '#1E7A4A',
          2: '#16613A',
          3: '#2E9960',
        },
        positive: { DEFAULT: '#1E7A4A', muted: 'rgba(30, 122, 74, 0.10)' },
        negative: { DEFAULT: '#B3402A', muted: 'rgba(179, 64, 42, 0.10)' },

        /* ── Text hierarchy — ink on paper ── */
        text: {
          primary: '#20241F',
          secondary: '#54594F',
          muted: '#8A8F83',
        },

        /* ── Legacy light tokens (now aligned to heritage) ── */
        brand: {
          50: '#f0f7f2', 100: '#dcebe1', 200: '#bcd8c6', 300: '#8fbda1',
          400: '#5d9c78', 500: '#3d8059', 600: '#1E5A3C', 700: '#1a4d34',
          800: '#173e2b', 900: '#133324', 950: '#0a1c14',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F6F4EE',
          border: 'rgba(32, 36, 31, 0.10)',
        },
      },

      fontFamily: {
        sans: ['IBM Plex Sans', 'Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      /* ── Elevation — soft warm depth ── */
      boxShadow: {
        card: '0 1px 2px 0 rgb(32 36 31 / 0.05), 0 1px 4px -1px rgb(32 36 31 / 0.06)',
        elevated: '0 12px 32px -12px rgb(32 36 31 / 0.18)',
        'glow-cyan': '0 1px 2px 0 rgb(32 36 31 / 0.06)',
        'glow-em': '0 1px 2px 0 rgb(32 36 31 / 0.06)',
      },

      /* Warm ink hairlines */
      borderColor: {
        glass: 'rgba(32, 36, 31, 0.10)',
        'glass-2': 'rgba(32, 36, 31, 0.18)',
      },
      backgroundColor: {
        'glass-panel': 'rgba(32, 36, 31, 0.04)',
        'glass-hover': 'rgba(32, 36, 31, 0.06)',
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
