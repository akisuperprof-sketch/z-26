
import { test, expect } from '@playwright/test';

test.describe('ZaoShi (Fluid Balance) Display SSOT verification', () => {
    test('Scenario: Pro Personal plan displays SSOT labels correctly', async ({ page }) => {
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

        await expect(page.locator("text=Analysis Complete").or(page.locator("text=今日の結果"))).toBeVisible({ timeout: 20000 });

        // Ensure "津液傾向" section is visible
        await expect(page.locator('text=津液傾向 (燥湿)')).toBeVisible();

        // Check if one of the SSOT labels is present
        const possibleLabels = ['湿り傾向', 'バランス良好', 'やや乾き傾向', '乾き傾向'];
        let found = false;
        for (const label of possibleLabels) {
            const locator = page.locator(`text=${label}`);
            if (await locator.count() > 0) {
                found = true;
                break;
            }
        }
        expect(found).toBe(true);
    });
});
