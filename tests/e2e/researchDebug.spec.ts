
import { test, expect } from '@playwright/test';

test.describe('Research Debug Panel Visibility Guard', () => {

    test('Panel should be VISIBLE in development mode', async ({ page }) => {
        // We know we are in dev in E2E unless process.env is set to production
        await page.goto('/app/');

        // Open Dev Control Center
        const btn = page.locator('button[title="開発者用コントロールセンターを開く"]');
        await btn.click();

        // Check for Research Debug Panel text
        await expect(page.locator('text=Research Debug Panel')).toBeVisible();
    });

    // In a regular playwright setup, we don't easily mock import.meta.env.DEV to false
    // but we can check for its presence easily.
});
