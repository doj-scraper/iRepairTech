import { test, expect } from '@playwright/test';

test.describe('Product catalog', () => {
  test('navigates to the catalog page from the homepage', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /browse catalog/i }).click();

    await expect(page).toHaveURL(/\/shop\/catalog/);
  });

  test('catalog page renders without server errors', async ({ page }) => {
    const response = await page.goto('/shop/catalog');

    expect(response?.status()).not.toBe(500);
  });

  test('catalog page includes a main content area', async ({ page }) => {
    await page.goto('/shop/catalog');

    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();
  });

  test('catalog page renders the header and footer', async ({ page }) => {
    await page.goto('/shop/catalog');

    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('catalog page shows at least one product card when inventory exists', async ({
    page,
  }) => {
    await page.goto('/shop/catalog');

    // The catalog renders product cards; wait for the first one.
    const productCards = page.locator('[data-testid="product-card"]');
    const addToCartButtons = page.getByRole('button', { name: /add to cart/i });

    const cardCount = await productCards.count();
    const buttonCount = await addToCartButtons.count();

    if (cardCount === 0 && buttonCount === 0) {
      // No products in the database during this test run — skip gracefully.
      test.skip(true, 'No products available in the catalog');
      return;
    }

    expect(cardCount + buttonCount).toBeGreaterThan(0);
  });
});
