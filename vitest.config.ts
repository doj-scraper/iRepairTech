import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Only pick up files inside src/tests/ — keeps Playwright .spec.ts files
    // in tests/e2e/ from being discovered by Vitest.
    include: ['src/tests/**/*.test.ts'],
    environment: 'node',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/tests/**',
        'src/app/**',
        'src/components/**',
        'src/lib/database.types.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
