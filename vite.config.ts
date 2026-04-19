import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  root: './src',
  base: '/TeamSpirit/',
  build: {
    rolldownOptions: {
      input: {
        main: './src/main.html',
        'time-sequence': './src/time-sequence/time-sequence.html',
      },
    },
    outDir: '../dist',
  },
  server: {
    open: '/TeamSpirit/main',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test-setup.ts',
  },
});
