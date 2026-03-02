import { test, expect } from '@playwright/test';
import { ALL_FLAGS, FLAGS_LATEST_VERSION } from '../../utils/featureFlags';

test.describe('Dev Control Center', () => {

    test('renders only in development environment', async ({ page }) => {
        await page.goto('/');
        const devButton = page.locator('button[title="開発者用コントロールセンターを開く"]');
        await expect(devButton).toBeVisible();
    });

    test('opens the panel and lists current flags', async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            window.localStorage.clear();
            window.localStorage.setItem('FF_PHASE1_STORY_V1', '1');
            window.localStorage.setItem('DEBUG_PANEL_OPEN', 'false');
        });

        // Re-open since state might affect conditionals if any, though here just visual.
        await page.locator('button[title="開発者用コントロールセンターを開く"]').click();

        await expect(page.locator('text=Dev Control')).toBeVisible();
        await expect(page.locator('text=NONE (Custom or Empty)')).toBeVisible();
    });

    test('sets all latest flags when "Enable Latest Features" is clicked', async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            window.localStorage.clear();
        });

        await page.locator('button[title="開発者用コントロールセンターを開く"]').click();

        // Promise.all to wait for navigation because it calls window.location.reload()
        await Promise.all([
            page.waitForNavigation(),
            page.locator('button', { hasText: 'Enable Latest Features (v1)' }).click()
        ]);

        const localStorageState = await page.evaluate(() => {
            return {
                storyFlag: window.localStorage.getItem('FF_PHASE1_STORY_V1'),
                rewardFlag: window.localStorage.getItem('FF_CAPTURE_REWARD_V1'),
                profile: window.localStorage.getItem('DEV_FLAGS_PROFILE'),
            };
        });

        expect(localStorageState.storyFlag).toBe('1');
        expect(localStorageState.rewardFlag).toBe('1');
        expect(localStorageState.profile).toBe(FLAGS_LATEST_VERSION);
    });

    test('clears all flags when "Clear All Flags" is clicked', async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            window.localStorage.setItem('FF_PHASE1_STORY_V1', '1');
            window.localStorage.setItem('DUMMY_TONGUE', 'true');
            window.localStorage.setItem('DEV_FLAGS_PROFILE', 'FLAGS_LATEST_V1');
            window.localStorage.setItem('CUSTOM_OTHER_FLAG', 'keep');
        });

        await page.locator('button[title="開発者用コントロールセンターを開く"]').click();

        // Wait for page to reload
        await Promise.all([
            page.waitForNavigation(),
            page.locator('button', { hasText: 'Clear All Flags' }).click()
        ]);

        const localStorageState = await page.evaluate(() => {
            return {
                storyFlag: window.localStorage.getItem('FF_PHASE1_STORY_V1'),
                dummyFlag: window.localStorage.getItem('DUMMY_TONGUE'),
                profile: window.localStorage.getItem('DEV_FLAGS_PROFILE'),
                otherFlag: window.localStorage.getItem('CUSTOM_OTHER_FLAG'),
            };
        });

        expect(localStorageState.storyFlag).toBeNull();
        expect(localStorageState.dummyFlag).toBeNull();
        expect(localStorageState.profile).toBeNull();
        expect(localStorageState.otherFlag).toBe('keep');
    });

});
