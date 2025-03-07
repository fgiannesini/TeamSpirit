import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: './src',
  base: '/TeamSpirit/',
  build: {
    rollupOptions: {
      input: {
        main: './src/index.html',
        flow: './src/flow/flow.html',
      },
    },
    outDir: '../dist',
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
