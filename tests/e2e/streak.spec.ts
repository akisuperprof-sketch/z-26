
import { test, expect } from '@playwright/test';

test.describe('Streak Feature (FF_STREAK_V1)', () => {

    test('should NOT show streak badge when flag is OFF', async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.removeItem('FF_STREAK_V1');
            window.localStorage.setItem('z26_streak_days', '5');
        });
        await page.goto('/app/');

        // Consent flow
        const agreeCheckbox = page.locator('#agree');
        if (await agreeCheckbox.isVisible()) {
            await agreeCheckbox.check();
            await page.getByRole('button', { name: /同意して診断を始める/ }).click();
        }

        await expect(page.getByText(/STREAK/)).not.toBeVisible();
    });

    test('should show streak badge when flag is ON', async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.setItem('FF_STREAK_V1', '1');
            window.localStorage.setItem('z26_streak_days', '5');
        });
        await page.goto('/app/');

        // Consent flow
        const agreeCheckbox = page.locator('#agree');
        if (await agreeCheckbox.isVisible()) {
            await agreeCheckbox.check();
            await page.getByRole('button', { name: /同意して診断を始める/ }).click();
        }

        await expect(page.getByText('STREAK 5 DAYS')).toBeVisible();
    });

    test('should update streak and show celebration on Results screen', async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.setItem('FF_STREAK_V1', '1');
            window.localStorage.setItem('DEBUG_AUTO_TEST', 'v1');
            window.localStorage.setItem('DUMMY_TONGUE', 'true');
            // Mock yesterday
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const formatDate = (date: Date) => {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            };
            window.localStorage.setItem('z26_last_done_date', formatDate(yesterday));
            window.localStorage.setItem('z26_streak_days', '2'); // Today will be 3
        });

        await page.goto('/app/');

        // Consent flow
        const agreeCheckbox = page.locator('#agree');
        if (await agreeCheckbox.isVisible()) {
            await agreeCheckbox.check();
            await page.getByRole('button', { name: /同意して診断を始める/ }).click();
        }

        // Wait for Results screen
        await expect(page.locator("text=Today's Condition Type")).toBeVisible({ timeout: 30000 });

        // Check for Streak 3
        await expect(page.getByText(/STREAK 3 DAYS/).first()).toBeVisible();
        // Check for celebration message
        await expect(page.getByText(/3日連続ですね/)).toBeVisible();
    });
});
