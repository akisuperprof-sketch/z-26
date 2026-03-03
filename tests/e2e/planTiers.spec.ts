import { test, expect } from '@playwright/test';

test.describe('Plan Tiers UI Control', () => {
    test('Scenario: Light Plan shows 1D Gauge and hides 2D Radar', async ({ page }) => {
        await page.goto('/app/');
        await page.addInitScript(() => {
            window.localStorage.clear();
            window.localStorage.setItem('PLAN_TYPE', 'light');
            window.localStorage.setItem('DEBUG_AUTO_TEST', 'v1');
            window.localStorage.setItem('DUMMY_TONGUE', 'true');
        });
        await page.reload();

        // Agree disclaimer
        const agreeHeader = page.locator('text=舌診アシスタントへようこそ');
        if (await agreeHeader.isVisible()) {
            await page.locator('#agree').check();
            await page.getByRole('button', { name: '同意して診断を始める' }).click();
        }

        // Shortcut should jump to Results or Hearing
        await expect(page.locator("text=Today's Condition Type")).toBeVisible({ timeout: 15000 });

        // Light Plan: 1D Gauge should be visible, 2D Radar not
        await expect(page.locator('text=寒熱バランス判定')).toBeVisible();
        await expect(page.locator('text=多角的な体質傾向分析')).not.toBeVisible();
    });

    test('Scenario: Pro Personal Plan shows 2D Radar', async ({ page }) => {
        await page.goto('/app/');
        await page.addInitScript(() => {
            window.localStorage.clear();
            window.localStorage.setItem('PLAN_TYPE', 'pro_personal');
            window.localStorage.setItem('DEBUG_AUTO_TEST', 'v1');
            window.localStorage.setItem('DUMMY_TONGUE', 'true');
        });
        await page.reload();

        // Agree disclaimer
        const agreeHeader = page.locator('text=舌診アシスタントへようこそ');
        if (await agreeHeader.isVisible()) {
            await page.locator('#agree').check();
            await page.getByRole('button', { name: '同意して診断を始める' }).click();
        }

        await expect(page.locator("text=Today's Condition Type")).toBeVisible({ timeout: 15000 });

        // Pro Personal: 2D Radar should be visible
        await expect(page.locator('text=多角的な体質傾向分析')).toBeVisible();
        await expect(page.locator('text=寒熱バランス判定')).not.toBeVisible();
        
        // Check for axes info
        await expect(page.locator('text=虚実スコア')).toBeVisible();
        await expect(page.locator('text=寒熱スコア')).toBeVisible();
        await expect(page.locator('text=津液傾向')).toBeVisible();
    });
});
