import { test, expect } from '@playwright/test';

test.describe('Age Range Feature E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/app/');
        await page.addInitScript(() => {
            window.localStorage.clear();
            window.localStorage.setItem('IS_RESEARCH_MODE', 'true');
            window.localStorage.setItem('RESEARCH_AGREED', 'true');
            window.localStorage.setItem('DUMMY_TONGUE', 'true');
            // DO NOT set DEBUG_AUTO_TEST here, we want to start from Disclaimer
        });
        await page.reload();
    });

    test('Scenario: Select age range and verify research log content', async ({ page }) => {
        await page.route('**/api/token', async (route) => {
            await route.fulfill({ status: 200, body: JSON.stringify({ token: 'mock' }) });
        });
        
        const researchRequestPromise = page.waitForRequest(req => req.url().includes('/api/research') && req.method() === 'POST');

        // 1. Disclaimer
        await page.locator('#agree').check();
        await page.getByRole('button', { name: '同意して診断を始める' }).click();

        // 2. User info
        await expect(page.getByText('基本情報の入力')).toBeVisible();
        await page.getByRole('button', { name: '男性' }).click();
        await page.getByRole('button', { name: '30-34' }).click();
        
        // NOW set it to speed up the rest
        await page.evaluate(() => {
            window.localStorage.setItem('DEBUG_AUTO_TEST', 'v1');
        });
        await page.getByRole('button', { name: '次へ進む' }).click();

        // 3. Wait for log
        const request = await researchRequestPromise;
        const payload = request.postDataJSON();

        expect(payload).not.toBeNull();
        expect(payload.age_range).toBe('30_34');
    });
});
