"use strict";
import { test, expect } from '@playwright/test';

test.describe('Vehicle CRUD Operations', () => {

  test('Verify Vehicle Creation, View, and Cleanup', async ({ page }) => {
    console.log('Starting Vehicle CRUD Test');

    // 1. Login
    await page.goto('/login');
    await page.fill('input#email', process.env.ADMIN_EMAIL || 'admin@sodohospital.com');
    await page.fill('input#password', process.env.ADMIN_PASSWORD || 'Admin@123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    console.log('✅ Login Successful');

    // 2. Navigate to Vehicles
    await page.goto('/vehicle');
    await expect(page).toHaveURL(/\/vehicle/);
    console.log('✅ Navigated to Vehicle page');

    // 3. Create Test Vehicle
    const uniqueId = Date.now().toString().slice(-4);
    const testPlate = `TEST-${uniqueId}`;
    console.log(`Creating vehicle with plate: ${testPlate}`);

    // Click New Vehicle button
    await page.getByRole('button', { name: /new vehicle/i }).click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    console.log('Sheet opened');

    // Fill Vehicle Info tab
    await page.fill('input[name="plateNumber"]', testPlate);
    await page.fill('input[name="ownerName"]', 'Test Owner');
    await page.fill('input[name="vehicleModel"]', 'Toyota');
    console.log('Filled vehicle info');

    // Click Service & Docs tab
    await page.getByRole('tab', { name: /service/i }).click();
    await page.waitForTimeout(500);
    console.log('Switched to Service tab');

    // Select service type - look for card/button with Inspection
    const serviceCard = page.locator('[role="dialog"]').locator('button, div[class*="cursor-pointer"]').filter({ hasText: /inspection/i }).first();
    await serviceCard.click({ force: true });
    console.log('Selected service type');

    // Click Add Vehicle button
    await page.getByRole('button', { name: /add vehicle/i }).click();
    console.log('Submitted form');

    // Wait for sheet to close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 15000 });
    console.log('✅ Sheet closed');

    // Verify in list
    await page.goto('/vehicle');
    await expect(page.getByText(testPlate)).toBeVisible({ timeout: 10000 });
    console.log('✅ Vehicle Created');

    // 4. View Detail
    await page.locator('a').filter({ hasText: /view details/i }).first().click();
    await page.waitForURL(/\/vehicle\/.+/, { timeout: 15000 });
    await expect(page.getByText(testPlate)).toBeVisible();
    console.log('✅ Detail Page OK');

    // 5. Delete
    await page.getByRole('button', { name: /delete/i }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: /delete|confirm/i }).click();
    await page.waitForTimeout(2000);
    await page.goto('/vehicle');
    await expect(page.getByText(testPlate)).not.toBeVisible({ timeout: 5000 });
    console.log('✅ Deleted');

    console.log('🎉 Vehicle CRUD Test PASSED');
  });

});
