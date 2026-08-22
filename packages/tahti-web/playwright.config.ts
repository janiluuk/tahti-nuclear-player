import { defineConfig } from '@playwright/test';

const port = 5190;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`,
    headless: true,
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM_PATH ?? '/usr/bin/chromium',
    },
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `VITE_FORCE_MOCK=1 VITE_ENABLE_DIAGNOSTICS=1 pnpm dev --host 127.0.0.1 --port ${port}`,
        url: `http://127.0.0.1:${port}`,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
