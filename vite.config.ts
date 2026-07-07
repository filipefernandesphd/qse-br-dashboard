import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Vercel serves from the root; GitHub Pages serves from /qse-br-dashboard/.
  // Vercel sets VERCEL=1 automatically during the build.
  base: process.env.VITE_BASE_PATH ?? (process.env.VERCEL ? '/' : '/qse-br-dashboard/'),
})
