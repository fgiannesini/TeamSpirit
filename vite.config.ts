import { defineConfig } from 'vitest/config';

export default defineConfig({
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
  },
});
