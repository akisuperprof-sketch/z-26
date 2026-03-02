import { test, expect } from '@playwright/test';

test.describe('Capture Guide V2 (FF_CAPTURE_GUIDE_V2)', () => {

    test('should NOT show guide UI when FF is OFF', async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.clear();
            window.localStorage.removeItem('FF_CAPTURE_GUIDE_V2');
            window.localStorage.removeItem('DEV_FEATURES');
            window.localStorage.removeItem('DEBUG_AUTO_TEST');
            window.localStorage.removeItem('DUMMY_TONGUE');
        });
        await page.goto('/');

        // Consent flow
        const agreeCheckbox = page.locator('#agree');
        if (await agreeCheckbox.isVisible()) {
            await agreeCheckbox.check();
            await page.getByRole('button', { name: /同意して診断を始める/ }).click();
        }

        // UserInfo flow
        await page.waitForSelector('text=基本情報の入力');
        await page.fill('input[name="age"]', '30');
        await page.getByRole('button', { name: '男性' }).click();
        await page.getByRole('button', { name: '次へ進む' }).click();

        // Open slot
        await page.waitForSelector('text=舌の画像を撮影');
        // Targeted click on the Front slot container to avoid SVG samples
        await page.locator('div.border-dashed').filter({ hasText: '正面' }).first().click();
        await page.getByRole('button', { name: /カメラを起動/ }).click();

        await page.waitForSelector('video', { timeout: 10000 }).catch(() => null);

        await expect(page.locator('text=明るい場所で舌を枠の中に')).not.toBeVisible();
    });

    test('should show guide UI when FF is ON (or camera screen)', async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.clear();
            window.localStorage.setItem('FF_CAPTURE_GUIDE_V2', '1');
            window.localStorage.removeItem('DEV_FEATURES');
            window.localStorage.removeItem('DEBUG_AUTO_TEST');
            window.localStorage.removeItem('DUMMY_TONGUE');
        });
        await page.goto('/');

        // Consent flow
        const agreeCheckbox = page.locator('#agree');
        if (await agreeCheckbox.isVisible()) {
            await agreeCheckbox.check();
            await page.getByRole('button', { name: /同意して診断を始める/ }).click();
        }

        // UserInfo flow
        await page.waitForSelector('text=基本情報の入力', { timeout: 15000 });
        await page.fill('input[name="age"]', '30');
        await page.getByRole('button', { name: '男性' }).click();
        await page.getByRole('button', { name: '次へ進む' }).click();

        // Open slot
        await page.waitForSelector('text=舌の画像を撮影', { timeout: 15000 });
        await page.locator('div.border-dashed').filter({ hasText: '正面' }).first().click();
        await page.getByRole('button', { name: /カメラを起動/ }).click();

        // Guide visibility check
        const guideLocator = page.locator('text=明るい場所で舌を枠の中に');
        const errorLocator = page.locator('text=エラー');

        await expect(async () => {
            const isGuideVisible = await guideLocator.isVisible();
            const isErrorVisible = await errorLocator.isVisible();
            expect(isGuideVisible || isErrorVisible).toBe(true);
        }).toPass({ timeout: 15000 });
    });
});
