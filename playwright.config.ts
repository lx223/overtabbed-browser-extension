import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Note: E2E tests for Chrome extensions require special setup
  // The extension needs to be loaded in Chrome, not served as a web page
  // For now, we'll skip the webServer config
  // webServer: {
  //   command: 'pnpm build',
  //   port: 5173,
  //   reuseExistingServer: !process.env.CI,
  // },
});

