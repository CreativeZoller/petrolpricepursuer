import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/sprit-proxy': {
        target: 'https://api.e-control.at',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sprit-proxy/, '/sprit'),
      },
    },
  },
  preview: {
    proxy: {
      '/sprit-proxy': {
        target: 'https://api.e-control.at',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sprit-proxy/, '/sprit'),
      },
    },
  },
})
