import { test, expect } from '@playwright/test';

test.describe('Task Workflow Automation', () => {
  
  test.beforeEach(async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input#email', 'admin@example.org');
    await page.fill('input#password', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    // 2. Navigate to Tasks
    await page.goto('/tasks');
    await expect(page).toHaveURL(/\/tasks/);
  });

  test('Smartly selects Entity Type based on Workflow Category', async ({ page }) => {
    // Open "Create Task" sheet
    await page.getByRole('button', { name: 'New Task' }).click();
    await expect(page.getByText('Create New Task')).toBeVisible();

    // Helper to select category and check entity type
    const checkSmartSelection = async (categoryName: string, expectedEntityType: string) => {
      // Open Category Select
      const categoryLabel = page.getByText('Workflow Category');
      const categorySelect = page.locator('button[role="combobox"]').filter({ hasText: 'Select category' }).first(); 
      // Note: There are multiple selects. We need to be specific.
      // The label is "Workflow Category", the select is likely the next sibling or contained nearby.
      // Using locator by label is safer if labels are correctly associated.
      // But Radix UI Selects use a hidden input with label association, the trigger is a button.
      
      // Let's use specific finding by surrounding text if possible, or order.
      // Context & Subject section has Category and Type.
      
      // Select Category
      // Locate the container that has the label "Workflow Category"
      await page.locator('div.space-y-2').filter({ has: page.locator('label', { hasText: 'Workflow Category' }) }).getByRole('combobox').click();
      await page.getByRole('option', { name: categoryName }).click();

      // Check Entity Type
      // The Entity Type select should now show the expected text value
      const entityTypeSelect = page.locator('div.space-y-2').filter({ has: page.locator('label', { hasText: 'Entity Type' }) }).getByRole('combobox');
      await expect(entityTypeSelect).toContainText(expectedEntityType);
    };

    // Test Cases
    await checkSmartSelection('Work Permit', 'Foreigner / Person');
    await checkSmartSelection('Vehicle Bolo & Insurance', 'Vehicle');
    await checkSmartSelection('Customs / PIP / ESW', 'Import Permit');
    await checkSmartSelection('Company Registration', 'Company');
    await checkSmartSelection('Residence ID', 'Foreigner / Person');
  });

  test('Create a full Work Permit task', async ({ page }) => {
    await page.getByRole('button', { name: 'New Task' }).click();

    // 1. Select Category: Work Permit
    await page.locator('div.space-y-2').filter({ has: page.locator('label', { hasText: 'Workflow Category' }) }).getByRole('combobox').click();
    await page.getByRole('option', { name: 'Work Permit' }).first().click();

    // 2. Select Sub-Type: New Work Permit
    await page.locator('div.space-y-2').filter({ has: page.locator('label', { hasText: 'Specific Type' }) }).getByRole('combobox').click();
    await page.getByRole('option', { name: 'New Work Permit' }).click();

    // 3. Entity Type should be Person (verified above), now Select Record
    // Wait for People to load (Select might be disabled initially?)
    const recordSelect = page.locator('div.space-y-2').filter({ has: page.locator('label', { hasText: 'Select Record' }) }).getByRole('combobox');
    await expect(recordSelect).toBeEnabled();
    await recordSelect.click();
    // Select the first person available
    await page.getByRole('option').first().click();

    // 4. Task Title (Quick Select)
    await page.locator('div.space-y-2').filter({ has: page.locator('label', { hasText: 'Task Title' }) }).getByRole('combobox').click();
    await page.getByRole('option').first().click(); // Pick first suggestion

    // 5. Description
    await page.fill('textarea[name="description"]', 'E2E Test Description for Work Permit');

    // 6. Assignee
    await page.locator('div.space-y-2').filter({ has: page.locator('label', { hasText: 'Assign To' }) }).getByRole('combobox').click();
    await page.getByRole('option').first().click(); // Pick first user

    // 7. Submit
    // Using a more specific selector for the submit button inside the sheet
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: 'Create Task' });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // 8. Verify Success
    // Wait for the success toast
    await expect(page.getByText('Task Created', { exact: true })).toBeVisible({ timeout: 15000 });
    
    // The sheet should close
    await expect(page.getByText('Create New Task')).not.toBeVisible();
    
    // Verify it appears in the list
    await expect(page.getByText('E2E Test Description for Work Permit').first()).toBeVisible();
  });

});