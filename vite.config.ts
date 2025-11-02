import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

// biome-ignore lint/style/noDefaultExport: Vite configuration
export default defineConfig({
  plugins: [vue()],
  root: './src',
  base: '/TeamSpirit/',
  build: {
    rollupOptions: {
      input: {
        main: './src/index.html',
        flow: './src/flow/flow.html',
        'time-sequence': './src/time-sequence/time-sequence.html',
      },
    },
    outDir: '../dist',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
});
