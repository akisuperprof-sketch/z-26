import { test, expect } from '@playwright/test';

test.describe('Explain Tree v1 (FF_EXPLAIN_TREE_V1)', () => {

    test('should NOT show Explain Tree button in Admin Dashboard when FF is OFF', async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.clear();
            window.localStorage.setItem('IS_ADMIN', 'true'); // Required for dashboard
            window.localStorage.removeItem('FF_EXPLAIN_TREE_V1');
            window.localStorage.setItem('DEV_FEATURES', 'true'); // Optional check
        });
        await page.goto('/app/admin/report');

        // Check button absence
        await expect(page.locator('text=Explain Tree (v1 推論構造の可視化)')).not.toBeVisible();
    });

    test('should show Explain Tree button in Admin Dashboard when FF is ON and it is DEV mode', async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.clear();
            window.localStorage.setItem('IS_ADMIN', 'true');
            window.localStorage.setItem('FF_EXPLAIN_TREE_V1', '1');
            window.localStorage.setItem('DEV_FEATURES', 'true'); // Simulate DEV
            window.localStorage.setItem('DEBUG_PANEL_OPEN', 'true');

            // Seed a dummy last payload (Hardened v1.2 format)
            const dummyLongLastingPayload = {
                payload: {
                    output_version: 'v1.2-e2e',
                    guard: { level: 4, band: 'SAFE', mix: 'NONE' },
                    diagnosis: {
                        top1_id: 'P_LUNG_YIN_DEF',
                        top2_id: null,
                        top3_ids: ['P_LUNG_YIN_DEF']
                    },
                    display: { template_key: 'STANDARD', show: { show_pattern_name: true, show_top3_list: false } }
                },
                expiresAt: Date.now() + 1800000,
                ts: new Date().toISOString()
            };
            window.localStorage.setItem('z26_latest_payload_for_explain', JSON.stringify(dummyLongLastingPayload));
        });

        // Mock API responses to avoid infinite "Loading" in test
        const mockData = JSON.stringify({ total_reviews: 0, exact_rate: 0, group_rate: 0, partial_rate: 0, mismatch_rate: 0, pattern_accuracy: [], matrix: [], ai_totals: {}, doctor_totals: {}, buckets: [] });
        await page.route('/api/report/**', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: mockData,
            });
        });

        await page.goto('/app/admin/report');

        // Check for section
        const sectionHeader = page.locator('text=Explain Tree (v1 推論構造の可視化)');
        await expect(sectionHeader).toBeVisible();

        // Check for generate button (partial text to be robust)
        const generateBtn = page.getByRole('button', { name: /生成/ });
        await expect(generateBtn).toBeVisible();

        // Simulate generate click and ensure no crash (popup blocker usually stops new tab but doesn't crash UI)
        await generateBtn.click();

        // Ensure no error toast appears (or check its absence)
        await expect(page.locator('text=構造生成に失敗しました')).not.toBeVisible();
    });
});
