import { test, expect } from '@playwright/test';

test.describe('Research Mode E2E Scenarios (Z-26 Hardened)', () => {
    
    test('Scenario A: research_mode OFF - Agree UI should NOT be visible', async ({ page }) => {
        await page.goto('/');
        await page.addInitScript(() => {
            window.localStorage.clear();
            window.localStorage.setItem('IS_RESEARCH_MODE', 'false');
            window.localStorage.setItem('DUMMY_TONGUE', 'true');
        });
        await page.reload();
        
        // Discard disclaimer if exists
        const agreeHeader = page.locator('text=利用規約への同意');
        if (await agreeHeader.isVisible()) {
            await page.locator('#agree').check();
            await page.getByRole('button', { name: '同意して診断を始める' }).click();
        }

        // Now on UploadWizard
        await expect(page.locator('text=研究モード (任意)')).not.toBeVisible();
    });

    test('Scenario B: research_mode ON but NOT agreed - Should NOT send research log', async ({ page }) => {
        let callCount = 0;
        await page.route('/api/research', async (route) => {
            callCount++;
            await route.fulfill({ status: 200, body: JSON.stringify({ status: 'success' }) });
        });

        await page.goto('/');
        await page.addInitScript(() => {
            window.localStorage.clear();
            window.localStorage.setItem('IS_RESEARCH_MODE', 'true');
            window.localStorage.setItem('RESEARCH_AGREED', 'false');
            window.localStorage.setItem('DUMMY_TONGUE', 'true');
            window.localStorage.setItem('DEBUG_AUTO_TEST', 'v1'); // Auto-submit hearing
        });
        await page.reload();

        const agreeHeader = page.locator('text=利用規約への同意');
        if (await agreeHeader.isVisible()) {
            await page.locator('#agree').check();
            await page.getByRole('button', { name: '同意して診断を始める' }).click();
        }

        // Ensure research checkbox is visible but unchecked
        const researchBox = page.locator('text=研究モード (任意)');
        await expect(researchBox).toBeVisible();
        
        // Proceed to Results
        await page.getByRole('button', { name: '解析を開始する' }).click();
        await expect(page.locator("text=Today's Condition Type")).toBeVisible({ timeout: 15000 });

        expect(callCount).toBe(0);
    });

    test('Scenario C: research_mode ON and agreed - Should send research log once', async ({ page }) => {
        let callCount = 0;
        await page.route('/api/research', async (route) => {
            callCount++;
            await route.fulfill({ status: 200, body: JSON.stringify({ status: 'success' }) });
        });
        await page.route('/api/token', async (route) => {
            await route.fulfill({ status: 200, body: JSON.stringify({ token: 'mock-token' }) });
        });

        await page.goto('/');
        await page.addInitScript(() => {
            window.localStorage.clear();
            window.localStorage.setItem('IS_RESEARCH_MODE', 'true');
            window.localStorage.setItem('RESEARCH_AGREED', 'true');
            window.localStorage.setItem('DUMMY_TONGUE', 'true');
            window.localStorage.setItem('DEBUG_AUTO_TEST', 'v1');
        });
        await page.reload();

        const agreeHeader = page.locator('text=利用規約への同意');
        if (await agreeHeader.isVisible()) {
            await page.locator('#agree').check();
            await page.getByRole('button', { name: '同意して診断を始める' }).click();
        }

        await page.getByRole('button', { name: '解析を開始する' }).click();
        await expect(page.locator("text=Today's Condition Type")).toBeVisible({ timeout: 30000 });

        // Wait for async non-blocking fetch
        await page.waitForTimeout(1500);
        expect(callCount).toBe(1);
    });
});
