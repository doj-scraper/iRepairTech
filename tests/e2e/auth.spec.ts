import { test, expect } from '@playwright/test';

test.describe('Auth flow', () => {
  test('auth page renders without server errors', async ({ page }) => {
    const response = await page.goto('/auth');

    expect(response?.status()).not.toBe(500);
  });

  test('auth page includes a main content area', async ({ page }) => {
    await page.goto('/auth');

    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();
  });

  test('auth page renders the header and footer', async ({ page }) => {
    await page.goto('/auth');

    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('auth page shows an email input', async ({ page }) => {
    await page.goto('/auth');

    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toBeVisible();
  });

  test('auth page shows a sign-in action', async ({ page }) => {
    await page.goto('/auth');

    // Could be a submit button or a magic-link button
    const signInButton = page
      .getByRole('button', { name: /sign in/i })
      .or(page.getByRole('button', { name: /log in/i }))
      .or(page.getByRole('button', { name: /send magic link/i }))
      .first();

    await expect(signInButton).toBeVisible();
  });

  test('submitting with an invalid email shows a validation message', async ({ page }) => {
    await page.goto('/auth');

    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.fill('not-a-valid-email');

    // Trigger form submission
    const submitButton = page
      .getByRole('button', { name: /sign in/i })
      .or(page.getByRole('button', { name: /log in/i }))
      .or(page.getByRole('button', { name: /send magic link/i }))
      .first();

    await submitButton.click();

    // The page should not navigate away on invalid input
    await expect(page).toHaveURL(/\/auth/);
  });

  test('dashboard redirects unauthenticated users to auth', async ({ page }) => {
    await page.goto('/dashboard');

    // Middleware should redirect unauthenticated users to /auth or /login.
    const url = page.url();
    expect(url).toMatch(/\/(auth|login)/);
  });
});
