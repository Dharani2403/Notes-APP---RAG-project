import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist'
  },
  server: {
    proxy: {
      '/chat': 'http://localhost:5000',
      '/upload': 'http://localhost:5000'
    }
  }
})