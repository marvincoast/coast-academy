import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility (WCAG AA)', () => {
  test('login page has no critical a11y violations', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('#vite-plugin-checker-error-overlay') // dev-only overlay
      .analyze();

    // Allow known informational rules; fail only on critical/serious
    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    expect(critical, `A11y violations:\n${JSON.stringify(critical, null, 2)}`).toHaveLength(0);
  });

  test('verify page is accessible without auth', async ({ page }) => {
    await page.goto('/verify/test-hash-placeholder');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    expect(critical, `A11y violations:\n${JSON.stringify(critical, null, 2)}`).toHaveLength(0);
  });
});
