import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updateStreak, getStreakData, getCelebrateMessage } from '../../utils/streak';

describe('Streak Utility', () => {
    let mockStorage: Record<string, string> = {};

    beforeEach(() => {
        mockStorage = {};
        vi.stubGlobal('window', {});
        vi.stubGlobal('localStorage', {
            getItem: vi.fn((key: string) => mockStorage[key] || null),
            setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value }),
            clear: vi.fn(() => { mockStorage = {} }),
            removeItem: vi.fn((key: string) => { delete mockStorage[key] })
        });

        // Default to active
        localStorage.setItem('FF_STREAK_V1', '1');
        vi.useFakeTimers();
    });

    it('should not be active if feature flag is missing', () => {
        localStorage.removeItem('FF_STREAK_V1');
        const data = getStreakData();
        expect(data.active).toBe(false);
    });

    it('should initialize streak to 1 on first update', () => {
        vi.setSystemTime(new Date('2026-03-02T12:00:00Z'));
        const result = updateStreak();
        expect(result.streakDays).toBe(1);
        expect(result.totalDays).toBe(1);
        expect(result.lastDate).toBe('2026-03-02');
    });

    it('should not increment streak if updated on the same day', () => {
        vi.setSystemTime(new Date('2026-03-02T12:00:00Z'));
        updateStreak();
        const result = updateStreak();
        expect(result.streakDays).toBe(1);
        expect(result.justUpdated).toBe(false);
    });

    it('should increment streak if updated on the next day', () => {
        vi.setSystemTime(new Date('2026-03-02T12:00:00Z'));
        updateStreak();

        vi.setSystemTime(new Date('2026-03-03T12:00:00Z'));
        const result = updateStreak();
        expect(result.streakDays).toBe(2);
        expect(result.lastDate).toBe('2026-03-03');
    });

    it('should reset streak if a day is skipped', () => {
        vi.setSystemTime(new Date('2026-03-02T12:00:00Z'));
        updateStreak();

        // Skip March 3rd, go to March 4th
        vi.setSystemTime(new Date('2026-03-04T12:00:00Z'));
        const result = updateStreak();
        expect(result.streakDays).toBe(1);
        expect(result.totalDays).toBe(2);
        expect(result.lastDate).toBe('2026-03-04');
    });

    it('should provide celebration messages at milestones', () => {
        expect(getCelebrateMessage(3)).toContain('3日連続');
        expect(getCelebrateMessage(7)).toContain('1週間継続');
        expect(getCelebrateMessage(30)).toContain('1ヶ月継続');
        expect(getCelebrateMessage(1)).toBeNull();
    });
});
