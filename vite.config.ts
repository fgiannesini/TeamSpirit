import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: './src',
  build: {
    rollupOptions: {
      input: {
        main: './src/index.html',
        flow: './src/render/flow.html',
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
