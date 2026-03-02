import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ALL_FLAGS, setLatestDevFlags, clearAllDevFlags, isFlagEnabled, FLAGS_LATEST_VERSION } from '../../utils/featureFlags';

describe('Feature Flags SSOT', () => {

    beforeEach(() => {
        // Mock window.localStorage for Node environment
        const mockStorage: Record<string, string> = {};

        globalThis.window = {
            localStorage: {
                getItem: vi.fn((key: string) => mockStorage[key] || null),
                setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
                removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
                clear: vi.fn(() => {
                    for (const key in mockStorage) {
                        delete mockStorage[key];
                    }
                })
            } as any
        } as any;
    });

    it('ALL_FLAGS contains required core keys', () => {
        const keys = ALL_FLAGS.map(f => f.key);
        expect(keys).toContain('FF_SHARE_CARD_V1');
        expect(keys).toContain('DEBUG_PANEL_OPEN');
        expect(keys).toContain('FF_PHASE1_STORY_V1');
    });

    it('setLatestDevFlags sets devDefaults and DEV_FLAGS_PROFILE', () => {
        setLatestDevFlags();

        // Flags with devDefault !== null should be set
        const expectedCount = ALL_FLAGS.filter(f => f.devDefault !== null).length;

        let actualSetCount = 0;
        ALL_FLAGS.forEach(flag => {
            if (flag.devDefault !== null) {
                expect(window.localStorage.getItem(flag.key)).toBe(flag.devDefault);
                actualSetCount++;
            } else {
                expect(window.localStorage.getItem(flag.key)).toBeNull();
            }
        });

        // Assert at least something was set
        expect(actualSetCount).toBeGreaterThan(0);
        expect(window.localStorage.getItem('DEV_FLAGS_PROFILE')).toBe(FLAGS_LATEST_VERSION);
    });

    it('clearAllDevFlags removes all predefined flags', () => {
        // Setup
        setLatestDevFlags();
        expect(window.localStorage.getItem('DEV_FLAGS_PROFILE')).toBe(FLAGS_LATEST_VERSION);

        // Action
        clearAllDevFlags();

        // Assert
        ALL_FLAGS.forEach(flag => {
            expect(window.localStorage.getItem(flag.key)).toBeNull();
        });
        expect(window.localStorage.getItem('DEV_FLAGS_PROFILE')).toBeNull();
    });

    it('isFlagEnabled is a robust checker', () => {
        expect(isFlagEnabled('TEST_FLAG')).toBe(false);

        window.localStorage.setItem('TEST_FLAG', '1');
        expect(isFlagEnabled('TEST_FLAG')).toBe(true);

        window.localStorage.setItem('TEST_FLAG_STR', 'true');
        expect(isFlagEnabled('TEST_FLAG_STR', 'true')).toBe(true);
        expect(isFlagEnabled('TEST_FLAG_STR')).toBe(false); // default expects '1'
    });

});
