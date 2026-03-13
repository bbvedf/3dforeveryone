import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'ryzenpc.mooo.com',
      //'.ngrok-free.app', 
    ],
    // HMR (Hot Module Replacement) - resiliente ante navegaciones externas
    hmr: {
      host: 'ryzenpc.mooo.com',
      protocol: 'wss',
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
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  }
})