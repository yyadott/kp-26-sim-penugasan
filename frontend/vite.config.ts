/// <reference types="vitest" />
import path from "path"
import { fileURLToPath } from "url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"
import tailwindcss from "@tailwindcss/vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: '/kp-26-sim-penugasan/',
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
  },
})