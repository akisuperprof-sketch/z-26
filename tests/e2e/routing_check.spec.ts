import { test, expect } from '@playwright/test';

test.describe('Z-26 Routing & UI Validation', () => {

    test('Navbar and Hero CTA should navigate to /app and show disclaimer', async ({ page }) => {
        // 1. Visit LP
        await page.goto('/');

        // 2. Verify 1000 people notation exists
        // Hero lead text
        await expect(page.locator('p.lead:has-text("1,000名")')).toBeVisible();
        // Stats section (exact match for 1,000)
        await expect(page.locator('.stat-num:has-text("1,000")').first()).toBeVisible();

        // 3. Click CTA
        const startButton = page.locator('button.btn-primary:has-text("無料で診断をはじめる")').first();
        await startButton.click();

        // 4. Verify URL has /app
        await expect(page).toHaveURL(/\/app/);

        // 5. Verify App loads (Disclaimer)
        await expect(page.locator('text=舌診アシスタントへようこそ')).toBeVisible();
        await expect(page.locator('button:has-text("同意して診断を始める")')).toBeVisible();
    });

    test('Direct access to /app should show app and not redirect to LP', async ({ page }) => {
        await page.goto('/app');
        await expect(page).toHaveURL(/\/app/);
        await expect(page.locator('text=舌診アシスタントへようこそ')).toBeVisible();

        // Refresh check
        await page.reload();
        await expect(page).toHaveURL(/\/app/);
        await expect(page.locator('text=舌診アシスタントへようこそ')).toBeVisible();
    });

    test('Query parameters should be preserved or at least not break navigation', async ({ page }) => {
        await page.goto('/app?MOCK_AI=true&DUMMY_TONGUE=true&FORCE_PRO=true');
        await expect(page).toHaveURL(/MOCK_AI=true/);
        await expect(page.locator('text=舌診アシスタントへようこそ')).toBeVisible();
    });

});
