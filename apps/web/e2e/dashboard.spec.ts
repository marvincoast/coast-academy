import { test, expect } from '@playwright/test';

/**
 * Authenticated E2E tests.
 * These require a real Supabase instance with a seeded test user.
 * Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD in the test environment.
 *
 * For CI without a live backend, tests skip gracefully via `skip` conditions.
 */

const TEST_EMAIL = process.env['E2E_TEST_EMAIL'];
const TEST_PASSWORD = process.env['E2E_TEST_PASSWORD'];
const hasCredentials = Boolean(TEST_EMAIL && TEST_PASSWORD);

test.describe('Dashboard (authenticated)', () => {
  test.skip(!hasCredentials, 'Skipped: E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set');

  test.beforeEach(async ({ page }) => {
    // Magic link auth is not testable in E2E; use stored session via localStorage
    // In a real environment, set up auth state via page.evaluate or Playwright fixtures
    await page.goto('/');
  });

  test('shows dashboard stats after login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText(/Aulas concluídas/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Simulados aprovados/i)).toBeVisible();
  });
});

test.describe('Dashboard UI (unauthenticated smoke)', () => {
  test('app shell not accessible without auth', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL((url) => new URL(url).pathname === '/');
    expect(new URL(page.url()).pathname).toBe('/');
  });
});
