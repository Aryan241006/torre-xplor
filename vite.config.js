import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://torre.ai',
        changeOrigin: true,
        secure: true,
        // Don't rewrite the path since Torre API expects /api/ prefix
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/search-api': {
        target: 'https://search.torre.co',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/search-api/, '/api'),
      }
    }
  }
})
