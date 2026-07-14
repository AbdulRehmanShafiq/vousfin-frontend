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
         warn-level app-wide so entropy is visible; individual rules flip to
         error as migration waves complete. */
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'JSXAttribute[name.name="className"] Literal[value=/text-\\[1[0-9](\\.[0-9])?px\\]/]',
          message: 'Ledger: use the named type scale (text-label/xs/small/body/md/heading/title/display), not arbitrary text-[Npx].',
        },
        {
          selector: 'JSXAttribute[name.name="className"] Literal[value=/(text|bg|border)-(cyan|gold|amber|emerald)/]',
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
