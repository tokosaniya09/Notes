import { test, expect } from '@playwright/test';

// Define user credentials (mock or seeded in dev environment)
const USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'Password123!',
  firstName: 'Playwright',
};

test.describe('Critical Path', () => {
  
  test('User can register, create a note, and logout', async ({ page }) => {
    // 1. Register
    await page.goto('/register');
    await page.getByLabel('First Name').fill(USER.firstName);
    await page.getByLabel('Last Name').fill('User');
    await page.getByLabel('Email').fill(USER.email);
    await page.getByLabel('Password').fill(USER.password);
    
    await page.getByRole('button', { name: 'Create Account' }).click();

    // 2. Verify Redirect to Dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('Your Notes')).toBeVisible();

    // 3. Create a Note
    await page.getByRole('button', { name: 'New Note' }).click();
    
    // 4. Edit Note
    // Waiting for editor to load
    await expect(page.getByPlaceholder('Untitled Note')).toBeVisible();
    await page.getByPlaceholder('Untitled Note').fill('My E2E Note');
    await page.getByPlaceholder('Start writing...').fill('This is a test note created by Playwright.');

    // 5. Verify Autosave Indicator
    await expect(page.getByText('Saved')).toBeVisible({ timeout: 10000 });

    // 6. Navigate Back to Dashboard
    await page.getByRole('link', { name: 'Notes SaaS' }).click(); // Or back button icon if available

    // 7. Verify Note in List
    await expect(page.getByText('My E2E Note')).toBeVisible();
    await expect(page.getByText('This is a test note')).toBeVisible();

    // 8. Logout
    // Open user dropdown
    await page.locator('button.rounded-full').click(); // Avatar button
    await page.getByText('Log out').click();

    // 9. Verify Redirect to Home/Login
    await expect(page).toHaveURL('/');
  });
});