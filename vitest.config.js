import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/vitest-setup.js'],
    include: ['tests/unit/**/*.test.js'],
    coverage: {
      include: ['js/**/*.js'],
    },
  },
});
