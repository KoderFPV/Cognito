import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local'), quiet: true });

const testLocale = process.env.TEST_LOCALE;

if (!testLocale) {
  throw new Error(
    'TEST_LOCALE environment variable must be set to run E2E tests. ' +
    'Supported values: en, pl'
  );
}

if (!['en', 'pl'].includes(testLocale)) {
  throw new Error(
    `Invalid TEST_LOCALE="${testLocale}". Supported values: en, pl`
  );
}

console.log(`\n✓ Running E2E tests for locale: ${testLocale}\n`);

/**
 * Playwright configuration for Desktop and Mobile Chrome testing
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { open: 'never' }]],

  /* Global timeout for the entire test run (5 minutes) */
  globalTimeout: 5 * 60 * 1000,

  /* Timeout for each test (1 minute) */
  timeout: 60 * 1000,

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:2137',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for Desktop and Mobile Chrome */
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  /* Run your local dev server before starting the tests - only if TEST_LOCALE is set */
  webServer: process.env.TEST_LOCALE ? {
    command: process.env.CI ? 'npm run start' : 'npm run dev',
    url: 'http://localhost:2137',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  } : undefined,
});
