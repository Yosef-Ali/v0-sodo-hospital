import { test, expect } from '@playwright/test';

test.describe('Core App Flows', () => {
  test('homepage loads and shows login prompt', async ({ page }) => {
    await page.goto('/');

    // Expect title to contain Sodo Hospital
    await expect(page).toHaveTitle(/Sodo Hospital/);

    // Check for main heading or login button
    // Adjust selector based on actual login page content
    await expect(page.locator('text=Sign In').first()).toBeVisible();
  });

  test('can navigate to dashboard (simulated)', async ({ page }) => {
    // This assumes we might need auth. For now, testing public access or redirect.
    await page.goto('/clinic/dashboard');

    // If redirected to login, that's a pass for security
    // If we have a mock auth, we would use it here.
    // For now, check if we need to sign in
    await expect(page.url()).toContain('sign-in'); // or similar
  });
});
