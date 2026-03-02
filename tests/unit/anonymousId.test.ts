import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAnonymousUserId } from '../../utils/anonymousId';

describe('Anonymous User ID (Research Mode)', () => {
    beforeEach(() => {
        // Node testing mock
        const mockStorage: Record<string, string> = {};
        globalThis.window = {
            localStorage: {
                getItem: vi.fn((k: string) => mockStorage[k] || null),
                setItem: vi.fn((k: string, v: string) => { mockStorage[k] = v; })
            } as any
        } as any;
    });

    it('generates a new uuid formatted id when empty', () => {
        const id1 = getAnonymousUserId();
        expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('returns the same id consistently on subsequent calls', () => {
        const id1 = getAnonymousUserId();
        const id2 = getAnonymousUserId();
        expect(id1).toBe(id2);

        // Ensure localStorage was set exactly once
        expect(window.localStorage.setItem).toHaveBeenCalledTimes(1);
    });
});
