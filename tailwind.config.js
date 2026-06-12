/** @type {import('tailwindcss').Config} */

/*
 * VousFin design tokens — "calm terminal luxury"
 *
 * One dark theme, one accent. Surfaces are neutral charcoal (no purple/navy
 * cast), borders are white-alpha hairlines (never tinted), money semantics are
 * honest: emerald = positive, red = negative, amber = attention, azure = brand
 * accent reserved for interactive elements.
 *
 * IMPORTANT: legacy token names (navy, charcoal, cyan, emerald, glass…) are
 * kept so the 26k+ lines referencing them keep compiling — only their VALUES
 * changed. New code should prefer the semantic names (accent, positive,
 * negative) but both map to the same scale.
 */

const ACCENT = {
  DEFAULT: '#4DA8F0', // interactive text/icons on dark
  2: '#2563EB',       // gradient anchor / pressed
  soft: 'rgba(77, 168, 240, 0.12)',
}

export default {
  content: ['./index.html', './public/**/*.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ── Surfaces (legacy names, new neutral values) ── */
        navy: {
          DEFAULT: '#0B0E14', // page canvas
          2: '#10141C',       // card surface
        },
        charcoal: {
          DEFAULT: '#151A23', // elevated: sidebar, modals, sheets
        },

        /* ── Accent (legacy: cyan; semantic: accent) ── */
        cyan: ACCENT,
        accent: ACCENT,

        /* ── Money semantics — emerald is GREEN again ── */
        emerald: {
          DEFAULT: '#34D399',
          2: '#10B981',
          3: '#6EE7B7',
        },
        positive: { DEFAULT: '#34D399', muted: 'rgba(52, 211, 153, 0.12)' },
        negative: { DEFAULT: '#F87171', muted: 'rgba(248, 113, 113, 0.12)' },
        amber: {
          DEFAULT: '#F59E0B',
          2: '#FBBF24',
        },

        /* ── Text hierarchy ── */
        text: {
          primary: '#EDF1F7',
          secondary: '#A9B4C4',
          muted: '#5F6B7C',
        },

        /* ── Legacy light-theme tokens (kept for stragglers) ── */
        brand: {
          50: '#eef7ff', 100: '#d9edff', 200: '#bce0ff', 300: '#8ecdff',
          400: '#58b0ff', 500: '#4DA8F0', 600: '#2563EB', 700: '#1d4fc4',
          800: '#1e42a0', 900: '#1e3a7f', 950: '#16254f',
        },
        surface: {
          DEFAULT: '#10141C',
          muted: '#151A23',
          border: 'rgba(255, 255, 255, 0.07)',
        },
      },

      fontFamily: {
        sans: ['IBM Plex Sans', 'Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      /* ── Elevation — quiet depth, no neon ── */
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.35)',
        elevated: '0 8px 28px -8px rgb(0 0 0 / 0.55)',
        // legacy glow names neutralized: same quiet elevation
        'glow-cyan': '0 1px 2px 0 rgb(0 0 0 / 0.35)',
        'glow-em': '0 1px 2px 0 rgb(0 0 0 / 0.35)',
      },

      /* Hairline borders — neutral, never tinted */
      borderColor: {
        glass: 'rgba(255, 255, 255, 0.07)',
        'glass-2': 'rgba(255, 255, 255, 0.13)',
      },
      backgroundColor: {
        'glass-panel': 'rgba(255, 255, 255, 0.04)',
        'glass-hover': 'rgba(255, 255, 255, 0.07)',
      },

      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-dot': 'pulseDot 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },

      /* Enterprise radius — crisp, not bubbly */
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
      },
    },
  },
  plugins: [],
}
