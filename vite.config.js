import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import process from 'node:process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: Number(process.env.PORT) || 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // Backend CORS allowlist only knows :5173 — present that origin no
        // matter which port this dev server was assigned.
        headers: { origin: 'http://localhost:5173' },
      },
    },
  },
})
