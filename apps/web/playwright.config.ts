import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env['PLAYWRIGHT_BASE_URL'] ?? 'http://localhost:5173';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 2 : undefined,
  reporter: process.env['CI']
    ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list'], ['html', { open: 'on-failure' }]],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
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
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Start Vite preview before running e2e in CI
  webServer: process.env['CI']
    ? {
        command: 'pnpm preview --port 5173',
        url: BASE_URL,
        timeout: 60_000,
        reuseExistingServer: false,
        env: {
          VITE_API_BASE_URL: process.env['VITE_API_BASE_URL'] ?? 'http://localhost/api',
          VITE_SUPABASE_URL: process.env['VITE_SUPABASE_URL'] ?? '',
          VITE_SUPABASE_ANON_KEY: process.env['VITE_SUPABASE_ANON_KEY'] ?? '',
        },
      }
    : undefined,
});
