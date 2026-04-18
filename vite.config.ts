/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // VITE_HASH_ROUTING is automatically available via import.meta.env.VITE_HASH_ROUTING
  // Set VITE_HASH_ROUTING=true in .env to enable hash-based routing for static hosts
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
  },
})
