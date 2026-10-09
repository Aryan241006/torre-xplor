import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In development the Express API runs separately (server/dev.js); forward /api calls to it.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
