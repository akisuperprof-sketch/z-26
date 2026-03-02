import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { pushHistoryMini, getHistoryMini, getDelta } from '../../utils/historyMini';

describe('historyMini Utils', () => {
    beforeEach(() => {
        const localStorageMock = (() => {
            let store: Record<string, string> = {};
            return {
                getItem: (key: string) => store[key] || null,
                setItem: (key: string, value: string) => {
                    store[key] = value.toString();
                },
                clear: () => {
                    store = {};
                }
            };
        })();
        vi.stubGlobal('localStorage', localStorageMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should return empty array initially', () => {
        expect(getHistoryMini()).toEqual([]);
    });

    it('should push a new entry', () => {
        pushHistoryMini({ score: 80, typeLabel: '気虚' });
        const history = getHistoryMini();
        expect(history.length).toBe(1);
        expect(history[0].score).toBe(80);
        expect(history[0].typeLabel).toBe('気虚');
    });

    it('should keep exactly 3 items at most', () => {
        pushHistoryMini({ score: 70, typeLabel: '1' });
        pushHistoryMini({ score: 80, typeLabel: '2' });
        pushHistoryMini({ score: 90, typeLabel: '3' });
        pushHistoryMini({ score: 100, typeLabel: 'LATEST' });

        const history = getHistoryMini();
        expect(history.length).toBe(3);
        expect(history[0].score).toBe(100);
        expect(history[0].typeLabel).toBe('LATEST');
        expect(history[2].score).toBe(80); // oldest kept
    });

    it('should calculate delta correctly', () => {
        expect(getDelta(80, 75)).toBe('↑');
        expect(getDelta(80, 85)).toBe('↓');
        expect(getDelta(80, 80)).toBe('→');
        expect(getDelta(80, 78)).toBe('→');
        expect(getDelta(80, 82)).toBe('→');
        expect(getDelta(80, 83)).toBe('↓');
    });
});
