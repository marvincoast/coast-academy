import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login page renders and shows magic link form', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveTitle(/Coast Academy/i);
    await expect(page.getByText(/Coast/i).first()).toBeVisible();

    const emailInput = page.getByRole('textbox', { name: /e-mail/i });
    await expect(emailInput).toBeVisible();

    const submitBtn = page.getByRole('button', { name: /enviar/i });
    await expect(submitBtn).toBeVisible();
  });

  test('shows validation error for invalid email', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('textbox', { name: /e-mail/i }).fill('not-an-email');
    await page.getByRole('button', { name: /enviar/i }).click();

    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('unauthenticated user is redirected from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain('/login');
  });

  test('public certificate verify page is accessible without auth', async ({ page }) => {
    await page.goto('/verify/nonexistent-hash');
    // Should render the verify page (not redirect to login)
    await expect(page.getByText(/Coast Academy/i)).toBeVisible();
  });
});
