import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    css: false,
    // Only run real Vitest suites. A pre-existing src/utils/accountResolver.test.cjs
    // is a standalone node script (no describe/it), not a Vitest suite.
    include: ['src/**/*.test.{js,jsx}'],
  },
})
