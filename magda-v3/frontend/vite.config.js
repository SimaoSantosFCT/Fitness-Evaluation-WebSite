import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Em desenvolvimento o Vite encaminha /api para o Spring Boot local
    proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } }
  },
  build: {
    // O Dockerfile copia este output para dentro do JAR Spring Boot
    outDir: 'dist',
  }
})
