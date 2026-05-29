import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Vite configuration
 * - `react()` enables React + Fast Refresh
 * - `tailwindcss()` enables Tailwind CSS v4 without a separate PostCSS config
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5175,
    /**
     * Optional convenience proxy (not required because Flask enables CORS).
     * If you set `VITE_API_BASE_URL=` empty in `.env`, you can call `/api/...` on the same origin.
     */
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
