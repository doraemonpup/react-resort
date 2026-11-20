import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Vite 8: enable JSX transformation in .js files
  oxc: {
    include: /\.(js|jsx|ts|tsx)$/,
  },

  server: {
    host: true,
    port: 3000,
    strictPort: true,
  },

  build: {
    outDir: 'build',
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
  },
})
