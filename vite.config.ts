import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/F1FantasyCombinator.github.io/",
  plugins: [react()],
})