import { test, expect } from '@playwright/test';

test.describe('Share Card Feature (FF_SHARE_CARD_V1)', () => {

    test.beforeEach(async ({ page }) => {
        // Mock API responses for quick test
        await page.route('/api/analyze', async route => {
            const json = {
                results: [],
                heatColdBalance: { score: 2, label: '熱', explanation: '熱証です' },
                patternFlags: {},
                isPro: false,
                result_v2: {
                    output_version: 'dummy-lv4',
                    guard: { level: 4, is_medical: false, mix: 'NONE' },
                    diagnosis: {
                        top1_id: 'YIN_DEF',
                        top3_ids: ['YIN_DEF', 'QI_DEF', 'BLOOD_DEF'],
                        symptoms: [],
                        heat_cold_score: 2,
                        moisture_score: -1
                    }
                }
            };
            await route.fulfill({ json });
        });
    });

    test('should NOT show share buttons when flag is OFF', async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.removeItem('FF_SHARE_CARD_V1');
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
        await expect(page.getByText('解析結果')).toBeVisible({ timeout: 15000 });

        // Ensure share buttons do NOT exist
        await expect(page.getByRole('button', { name: '画像を保存' })).not.toBeVisible();
        await expect(page.getByRole('button', { name: 'リンクコピー' })).not.toBeVisible();
    });


    test('should show share buttons when flag is ON and handle click', async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.setItem('FF_SHARE_CARD_V1', '1');
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
        await expect(page.getByText('解析結果')).toBeVisible({ timeout: 15000 });

        // Ensure share buttons DO exist
        await expect(page.getByRole('button', { name: '画像を保存' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'リンクコピー' })).toBeVisible();

        // Warning: Actually clicking the download button in headless chromium might pop up a file dialog
        // or just quietly download. We will just ensure the button is clickable without throwing error.
        await page.getByRole('button', { name: '画像を保存' }).click();

        // Ensure link copy works (might need clipboard permissions, we mock alert)
        let alertMessage = "";
        page.on('dialog', dialog => {
            alertMessage = dialog.message();
            dialog.accept();
        });

        await page.getByRole('button', { name: 'リンクコピー' }).click();

        // Ensure buttons are still enabled
        await expect(page.getByRole('button', { name: 'リンクコピー' })).toBeEnabled();
    });
});

