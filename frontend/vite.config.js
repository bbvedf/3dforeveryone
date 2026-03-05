import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // HMR (Hot Module Replacement) - resiliente ante navegaciones externas
    hmr: {
      host: 'localhost',
      port: 5173,
      // Configurar para que sea más robusto ante desconexiones
      // (esto que pasa cuando navegas a Stripe y vuelves)
      protocol: 'ws',
    },
    // Aumentar timeouts para que no falle tan rápido
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
    // Optimizaciones para que el build sea más estable
    sourcemap: false,
    minify: 'esbuild'
  }
})
