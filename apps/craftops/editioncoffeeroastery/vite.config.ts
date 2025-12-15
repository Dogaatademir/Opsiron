import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/craftops/editioncoffeeroastery/',
  build: {
    outDir: '../../../dist/craftops/editioncoffeeroastery',
    emptyOutDir: true,
  }
})