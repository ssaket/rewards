// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Update with your repo name
const repoName = 'task-reward-app'

export default defineConfig({
  base: `/${repoName}/`,
  plugins: [react()],
})