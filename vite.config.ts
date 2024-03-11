import { defineConfig } from 'vite'
import path from 'path'
import { node } from '@liuli-util/vite-plugin-node'

export default defineConfig({
  plugins: [node({
    outDir: 'bin',
    shims: true,
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})