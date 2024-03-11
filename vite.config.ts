import { defineConfig } from 'vite'
import path from 'path'
import { node } from '@liuli-util/vite-plugin-node'

export default defineConfig({
  plugins: [node({
    shims: true,
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
