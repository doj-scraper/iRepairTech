import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads and shows the main heading', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/iRepair/i);

    // Main landmark is required by the design system for skip-nav
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();
  });

  test('displays the hero heading', async ({ page }) => {
    await page.goto('/');

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/repair/i);
  });

  test('shows a Browse Catalog link', async ({ page }) => {
    await page.goto('/');

    const catalogLink = page.getByRole('link', { name: /browse catalog/i });
    await expect(catalogLink).toBeVisible();
  });

  test('shows a Trade Login link', async ({ page }) => {
    await page.goto('/');

    const loginLink = page.getByRole('link', { name: /trade login/i });
    await expect(loginLink).toBeVisible();
  });

  test('renders the header and footer', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });
});
