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
  build: {
    // Split the previously-monolithic ~989kB entry into cacheable vendor chunks
    // the browser downloads in parallel and reuses across deploys/pages. Heavy
    // libs only some routes need (charts, 3D) become their own chunks so the
    // landing page never pays for them.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/[\\/](react|react-dom|react-router-dom|react-router|scheduler)[\\/]/.test(id)) return 'react-vendor'
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'framer'
          if (id.includes('@tanstack')) return 'tanstack'
          if (id.includes('lucide-react')) return 'icons'
          if (id.includes('recharts') || id.includes('/d3-') || id.includes('victory')) return 'charts'
          if (id.includes('three') || id.includes('animejs') || id.includes('lenis') || id.includes('@studio-freight')) return 'three'
          if (id.includes('zod') || id.includes('react-hook-form') || id.includes('@hookform')) return 'forms'
          return 'vendor'
        },
      },
    },
    chunkSizeWarningLimit: 700,
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
