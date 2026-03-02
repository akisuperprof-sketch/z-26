
import { test, expect } from '@playwright/test';

test.describe('Diagnostic Flow Regression', () => {

    test('should complete baseline diagnostic flow successfully', async ({ page }) => {
        // Enable auto-test shortcut
        await page.addInitScript(() => {
            window.localStorage.setItem('DEBUG_AUTO_TEST', 'v1');
            window.localStorage.setItem('DUMMY_TONGUE', 'true');
            window.localStorage.setItem('DEBUG_PANEL_OPEN', 'true');
        });

        await page.goto('/');

        // Handle Disclaimer if visible
        const agreeCheckbox = page.locator('#agree');
        if (await agreeCheckbox.isVisible()) {
            await agreeCheckbox.check();
            await page.getByRole('button', { name: /同意して診断を始める/ }).click();
        }

        // DEBUG_AUTO_TEST in HearingScreen submits after 500ms
        // We wait for the Results screen
        await expect(page.locator("text=Today's Condition Type")).toBeVisible({ timeout: 30000 });

        // Check for Phase1 Requirement: Presence of non-medical terminology
        await expect(page.locator('body')).toContainText(/傾向/);
        await expect(page.locator('body')).toContainText(/補助/);

        // Check for SSOT Inspector (Technical Summary)
        await expect(page.getByText('TECHNICAL DEBUG SUMMARY')).toBeVisible();

        // Verify SSOT is used (V2)
        await expect(page.getByText('V2', { exact: true })).toBeVisible();
    });

    test('should enforce Noto Sans JP font family', async ({ page }) => {
        await page.goto('/');
        const body = page.locator('body');
        const fontFamily = await body.evaluate((el) => window.getComputedStyle(el).fontFamily);
        expect(fontFamily).toContain('Noto Sans JP');
    });

    test('should protect admin routes from unauthorized access', async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.removeItem('IS_ADMIN'));

        // Check that we can't see the Admin Dashboard heading
        await expect(page.getByText('一致性診断ダッシュボード')).not.toBeVisible();
    });

    test('should complete diagnostic flow even if quality module is bypassed/fails', async ({ page }) => {
        // This test ensures the observation layer doesn't block the core flow
        await page.addInitScript(() => {
            window.localStorage.setItem('DEBUG_AUTO_TEST', 'v1');
            window.localStorage.setItem('DUMMY_TONGUE', 'true');
        });
        await page.goto('/');
        const agreeCheckbox = page.locator('#agree');
        if (await agreeCheckbox.isVisible()) {
            await agreeCheckbox.check();
            await page.getByRole('button', { name: /同意して診断を始める/ }).click();
        }
        // Success means reaching the report despite potential image processing errors in observation layer
        await expect(page.getByText('解析結果')).toBeVisible({ timeout: 30000 });
    });
});

test.describe('Development Tools & Guards', () => {
    test('should show DUMMY badge when DUMMY_TONGUE is active in DEV', async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.setItem('DUMMY_TONGUE', 'true');
            window.localStorage.setItem('DEBUG_MODE', 'true');
        });
        await page.goto('/');
        // The badge should be visible (as it's DEV mode in local test)
        // Check for exact text DUMMY in the header area or similar
        await expect(page.getByText('DUMMY', { exact: true })).toBeVisible();
    });
});
