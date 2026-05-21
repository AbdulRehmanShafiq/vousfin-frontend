/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './public/**/*.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1020',
          2: '#111827',
        },
        charcoal: {
          DEFAULT: '#1E293B',
        },
        cyan: {
          DEFAULT: '#06B6D4',
          2: '#2563EB',
        },
        emerald: {
          DEFAULT: '#06B6D4',
          2: '#2563EB',
          3: '#38BDF8',
        },
        amber: {
          DEFAULT: '#F59E0B',
          2: '#FBBF24',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#CBD5E1',
          muted: '#64748B',
        },
        brand: {
          50: '#eef9ff',
          100: '#d9f0ff',
          200: '#bce5ff',
          300: '#8ed4ff',
          400: '#58b8ff',
          500: '#3296f5',
          600: '#1a78e8',
          700: '#1560c4',
          800: '#1751a0',
          900: '#19457f',
          950: '#122b4f',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafc',
          border: '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        elevated: '0 10px 40px -10px rgb(15 23 42 / 0.12)',
        'glow-cyan': '0 0 24px rgba(6, 182, 212, 0.22)',
        'glow-em': '0 0 24px rgba(37, 99, 235, 0.18)',
      },
      borderColor: {
        glass: 'rgba(6, 182, 212, 0.15)',
        'glass-2': 'rgba(37, 99, 235, 0.20)',
      },
      backgroundColor: {
        'glass-panel': 'rgba(255, 255, 255, 0.03)',
        'glass-hover': 'rgba(255, 255, 255, 0.06)',
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
      borderRadius: {
        sm: '9px',
        DEFAULT: '14px',
      },
    },
  },
  plugins: [],
}
