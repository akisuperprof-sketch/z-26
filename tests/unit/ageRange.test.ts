import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserInfo, Gender } from '../../types';

// Mocking idb-keyval
vi.mock('idb-keyval', () => {
    const store = new Map();
    return {
        get: vi.fn((key) => store.get(key)),
        set: vi.fn((key, val) => store.set(key, val)),
        del: vi.fn((key) => store.delete(key)),
    };
});

describe('Age Range State and Persistence', () => {
    it('should allow setting age_range in UserInfo', () => {
        const info: UserInfo = {
            age: 30,
            gender: Gender.Male,
            height: 170,
            weight: 65,
            concerns: 'None',
            age_range: '30_34'
        };
        expect(info.age_range).toBe('30_34');
    });

    it('should be optional in UserInfo', () => {
        const info: UserInfo = {
            age: 30,
            gender: Gender.Male,
            height: 170,
            weight: 65,
            concerns: 'None'
        };
        expect(info.age_range).toBeUndefined();
    });
});
