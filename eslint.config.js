import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      /* ══ Ledger governance ratchet (2026-07-14 redesign spec §9.2) ══
         Phase 10 sweep complete: both rules are now ERRORS — the legacy
         vocabulary is un-writable. Baselines were 976 arbitrary sizes /
         646 palette classes; both are zero. */
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXAttribute[name.name="className"] Literal[value=/text-\\[1[0-9](\\.[0-9])?px\\]/]',
          message: 'Ledger: use the named type scale (text-label/xs/small/body/md/heading/title/display), not arbitrary text-[Npx].',
        },
        {
          /* Boundary after the hue so scoped landing classes (text-gold-gradient,
             bg-gold-glow — the brand exterior's own CSS) don't false-positive. */
          selector: 'JSXAttribute[name.name="className"] Literal[value=/(text|bg|border|ring)-(cyan|gold|amber|emerald)(?![\\w-])/]',
          message: 'Ledger: use semantic roles (accent, ink-*, money-*, status-*), never palette hue names.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: '@/components/common/Button', message: 'Deleted primitive — use @/components/ui/Button.' },
            { name: '@/components/common/Input', message: 'Deleted primitive — use @/components/ui/Input.' },
            { name: '@/components/ui/Drawer', message: 'Deleted — use the Sheet/Modal surface.' },
          ],
        },
      ],
    },
  },
])
