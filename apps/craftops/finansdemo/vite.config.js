import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 1. Canlıdaki Alt Klasör Yolu (ÖNEMLİ)
  base: '/craftops/finansdemo/', 
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  build: {
    // 2. Çıktı Klasörü: Monorepo'nun ana dist klasörüne hedefler
    // apps/craftops/stokdemo -> ../../../dist/craftops/stokdemo
    outDir: '../../../dist/craftops/finansdemo',
    emptyOutDir: true
  }
})