// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Optional: align with your old Webpack aliases
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    // Match your previous dev port if you care (CRA default was 3000)
    port: 3000,
    open: true,
  },
  build: {
    // Adjust if you want specific output dirs or sourcemaps
    sourcemap: true,
    outDir: 'dist',
  },
})
