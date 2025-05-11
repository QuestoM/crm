import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3100,
    strictPort: true,
    open: true
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.cjs', '.mjs']
  }
})
