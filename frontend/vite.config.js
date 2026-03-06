import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      //'.ngrok-free.app', // Permite TODOS los subdominios de ngrok
    ],
    // HMR (Hot Module Replacement) - resiliente ante navegaciones externas
    hmr: {
      host: 'localhost',
      port: 5173,
      protocol: 'ws',
    },
    middlewareMode: false,
    
    proxy: {
      '/api': {
        target: 'http://api:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/uploads': {
        target: 'http://api:8000',
        changeOrigin: true
      }
    }
  },
  build: {
    sourcemap: false,
    minify: 'esbuild'
  }
})