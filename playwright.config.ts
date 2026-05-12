import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for iRepair Technologies E2E tests.
 * Tests run against the local Next.js dev server started automatically
 * before the test run.
 *
 * Set BASE_URL env var to override the target origin (e.g. a staging URL).
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: process.env['BASE_URL'] ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  // Automatically start the Next.js dev server before running E2E tests.
  // Requires real env vars to be present (use a .env.test.local file locally).
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env['CI'],
    timeout: 60_000,
  },
});
