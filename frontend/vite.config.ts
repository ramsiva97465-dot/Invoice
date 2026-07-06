import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration for production (Vercel)
export default defineConfig({
  base: '/', // ensure assets are served from root
  plugins: [react()],
  build: {
    // allow larger chunks for the bundled UI
    chunkSizeWarningLimit: 2000,
  },
})
