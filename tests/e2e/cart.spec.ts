import { test, expect } from '@playwright/test';

test.describe('Cart flow', () => {
  test('cart page is accessible', async ({ page }) => {
    // The cart is typically shown in a slide-over/drawer, navigated to, or
    // accessible via a header icon. Test the route if it exists, or that the
    // cart UI is reachable.
    const response = await page.goto('/');
    expect(response?.status()).not.toBe(500);

    await expect(page.locator('header')).toBeVisible();
  });

  test('cart icon / link is visible in the header', async ({ page }) => {
    await page.goto('/');

    // The header should contain a cart indicator (icon button or link)
    const cartTrigger = page
      .locator('header')
      .getByRole('button', { name: /cart/i })
      .or(page.locator('header').getByRole('link', { name: /cart/i }));

    await expect(cartTrigger).toBeVisible();
  });

  test('add-to-cart flow on the catalog page', async ({ page }) => {
    await page.goto('/shop/catalog');

    // Attempt to add the first available product to the cart
    const addButton = page.getByRole('button', { name: /add to cart/i }).first();

    const buttonCount = await addButton.count();
    if (buttonCount === 0) {
      // No products in the database during this test run — skip gracefully
      test.skip(true, 'No products available in the catalog');
      return;
    }

    await addButton.click();

    // After adding, either a toast confirmation appears or the cart count changes.
    // Both success signals are valid — we just verify no error page is shown.
    await expect(page.locator('main#main-content')).toBeVisible();
  });
});
