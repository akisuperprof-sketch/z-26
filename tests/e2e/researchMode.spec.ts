import { test, expect } from '@playwright/test';

test.describe('Research Mode E2E Scenarios (Z-26 Hardened)', () => {
    
    test('Scenario A: research_mode OFF - Agree UI should NOT be visible', async ({ page }) => {
        await page.goto('/app/');
        await page.addInitScript(() => {
            window.localStorage.clear();
            window.localStorage.setItem('IS_RESEARCH_MODE', 'false');
            window.localStorage.setItem('DUMMY_TONGUE', 'true');
        });
        await page.reload();
        await expect(page.getByText(/研究モード/)).not.toBeVisible();
    });

    test('Scenario B: research_mode ON but NOT agreed - Should NOT send research log', async ({ page }) => {
        let callCount = 0;
        await page.route('**/api/research', async (route) => {
            callCount++;
            await route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
        });

        await page.goto('/app/');
        await page.addInitScript(() => {
            window.localStorage.clear();
            window.localStorage.setItem('IS_RESEARCH_MODE', 'true');
            window.localStorage.setItem('RESEARCH_AGREED', 'false');
            window.localStorage.setItem('DUMMY_TONGUE', 'true');
        });
        await page.reload();

        await expect(page.getByText(/研究モード/)).toBeVisible();
        await page.locator('#agree').check();
        await page.getByRole('button', { name: '同意して診断を始める' }).click();
        
        // On UserInfo
        await page.getByRole('button', { name: '男性' }).click();
        await page.getByRole('button', { name: '30-34' }).click(); // MUST SELECT AGE RANGE
        
        await page.evaluate(() => {
            window.localStorage.setItem('DEBUG_AUTO_TEST', 'v1');
        });
        await page.getByRole('button', { name: '次へ進む' }).click();

        await expect(page.locator("text=Analysis Complete").or(page.locator("text=今日の結果"))).toBeVisible({ timeout: 20000 });
        expect(callCount).toBe(0);
    });

    test('Scenario C: research_mode ON and agreed - Should send research log once', async ({ page }) => {
        let callCount = 0;
        await page.route('**/api/research', async (route) => {
            callCount++;
            await route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
        });
        await page.route('**/api/token', async (route) => {
            await route.fulfill({ status: 200, body: JSON.stringify({ token: 'mock-token' }) });
        });

        await page.goto('/app/');
        await page.addInitScript(() => {
            window.localStorage.clear();
            window.localStorage.setItem('IS_RESEARCH_MODE', 'true');
            window.localStorage.setItem('RESEARCH_AGREED', 'true');
            window.localStorage.setItem('DUMMY_TONGUE', 'true');
            window.localStorage.setItem('DEBUG_AUTO_TEST', 'v1');
        });
        await page.reload();

        await expect(page.locator("text=Analysis Complete").or(page.locator("text=今日の結果"))).toBeVisible({ timeout: 20000 });
        await page.waitForTimeout(2000);
        expect(callCount).toBe(1);
    });

    test('Scenario D: Deduplication Guard - Should NOT send twice for same result in short interval', async ({ page }) => {
        let callCount = 0;
        await page.route('**/api/research', async (route) => {
            callCount++;
            await route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
        });
        await page.route('**/api/token', async (route) => {
            await route.fulfill({ status: 200, body: JSON.stringify({ token: 'mock-token' }) });
        });

        await page.goto('/app/');
        await page.addInitScript(() => {
            window.localStorage.clear();
            window.localStorage.setItem('IS_RESEARCH_MODE', 'true');
            window.localStorage.setItem('RESEARCH_AGREED', 'true');
            window.localStorage.setItem('DUMMY_TONGUE', 'true');
            window.localStorage.setItem('DEBUG_AUTO_TEST', 'v1');
        });
        await page.reload();

        await expect(page.locator("text=Analysis Complete").or(page.locator("text=今日の結果"))).toBeVisible({ timeout: 20000 });
        
        await page.evaluate(() => {
            window.localStorage.setItem('DEBUG_AUTO_TEST', 'v1');
        });
        await page.reload();

        await expect(page.locator("text=Analysis Complete").or(page.locator("text=今日の結果"))).toBeVisible({ timeout: 20000 });
        await page.waitForTimeout(2000);
        expect(callCount).toBe(1);
    });
});
