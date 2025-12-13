import { test, expect } from '@playwright/test';

test.describe('Billing Flow', () => {
  test('Public pricing page renders correctly', async ({ page }) => {
    await page.goto('/pricing');
    
    await expect(page.getByText('Free')).toBeVisible();
    await expect(page.getByText('Pro')).toBeVisible();
    await expect(page.getByText('Team')).toBeVisible();
    
    await expect(page.getByText('$0')).toBeVisible();
    await expect(page.getByText('$12')).toBeVisible();
  });

  test('Upgrade button redirects to register for unauthenticated user', async ({ page }) => {
    await page.goto('/pricing');
    
    // Click "Get Started" on Pro plan
    // Assuming the text is "Get Started" for unauth users
    const proButton = page.locator('.border-primary button'); 
    await proButton.click();

    await expect(page).toHaveURL(/\/register\?from=\/pricing/);
  });
});