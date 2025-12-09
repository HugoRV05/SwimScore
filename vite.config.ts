import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages is served from https://<user>.github.io/puntos/
  // so assets must be prefixed with the repo name.
  base: '/puntos/',
})
