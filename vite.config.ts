// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Update with your repo name
const repoName = 'rewards'

export default defineConfig({
  base: `/${repoName}/`,
  plugins: [react()],
})