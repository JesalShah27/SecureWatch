import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5174, // run on 5174 so it doesn't clash with sentinel-watch (8080)
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // relay server
        changeOrigin: true,
        ws: true,
      }
    }
  }
})


