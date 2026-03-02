import { test, expect } from '@playwright/test';

test.describe('History Mini V1 (FF_HISTORY_MINI_V1)', () => {

    test('should NOT show history mini on results screen when FF is OFF', async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.clear();
            window.localStorage.removeItem('FF_HISTORY_MINI_V1');
            window.localStorage.removeItem('FF_STREAK_V1');
            window.localStorage.setItem('DEBUG_AUTO_TEST', 'v1');
            window.localStorage.setItem('DUMMY_TONGUE', 'true');
        });
        await page.goto('/');

        // Consent flow
        const agreeCheckbox = page.locator('#agree');
        if (await agreeCheckbox.isVisible()) {
            await agreeCheckbox.check();
            await page.getByRole('button', { name: /同意して診断を始める/ }).click();
        }

        // Wait for results
        await page.waitForSelector('text=解析結果', { timeout: 30000 });

        // Ensure "過去の変化" is NOT visible
        await expect(page.locator('text=過去の変化')).not.toBeVisible();
    });

    test('should show history mini on results screen and persist a record when FF is ON', async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.clear();
            window.localStorage.setItem('FF_HISTORY_MINI_V1', '1');
            // Seed initial 1 history entry
            const seed = [
                { score: 60, typeLabel: '気虚', ts: new Date(Date.now() - 86400000).toISOString() }
            ];
            window.localStorage.setItem('z26_history_mini_v1', JSON.stringify(seed));

            // DEBUG_AUTO_TEST=v1 to skip to results quickly
            window.localStorage.setItem('DEBUG_AUTO_TEST', 'v1');
            window.localStorage.setItem('DUMMY_TONGUE', 'true');
        });
        await page.goto('/');

        // Consent flow
        const agreeCheckbox = page.locator('#agree');
        if (await agreeCheckbox.isVisible()) {
            await agreeCheckbox.check();
            await page.getByRole('button', { name: /同意して診断を始める/ }).click();
        }

        // Wait for results
        await page.waitForSelector('text=過去の変化', { timeout: 30000 });

        // Wait for item to appear in storage (in case AI analysis is slow)
        await expect(async () => {
            const data = await page.evaluate(() => window.localStorage.getItem('z26_history_mini_v1'));
            const count = data ? JSON.parse(data).length : 0;
            expect(count).toBeGreaterThanOrEqual(2);
        }).toPass({ timeout: 15000 });

        // Assert we have multiple items in history UI now
        const latestBadge = page.locator('text=LATEST');
        await expect(latestBadge).toBeVisible();
    });
});
