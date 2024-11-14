import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCommonjs({
      // include: ['react-swipeable-views-react-18-fix']
    }),
  ],
})
