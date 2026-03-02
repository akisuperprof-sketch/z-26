import { describe, it, expect } from 'vitest';
import { getPhase1Story } from '../../utils/phase1Story';

describe('Phase1 Story V1.5 Utility', () => {

    it('generates a titleLine and subLine for a given key and score', () => {
        const result = getPhase1Story({ typeKey: 'yin_def', score: 85 });
        expect(result.titleLine).toBeTruthy();
        expect(result.subLine).toBeTruthy();
        expect(typeof result.titleLine).toBe('string');
        expect(typeof result.subLine).toBe('string');
    });

    it('changes output based on score rank (HIGH vs LOW)', () => {
        const highResult = getPhase1Story({ typeKey: 'qi_def', score: 90 });
        const lowResult = getPhase1Story({ typeKey: 'qi_def', score: 20 });

        expect(highResult.titleLine).not.toBe(lowResult.titleLine);
    });

    it('never contains forbidden medical words', () => {
        // We will test several combinations
        const keys = ['unknown', 'qi_def', 'blood_stasis', 'neutral'];
        const scores = [10, 50, 90];
        const days = [0, 5, 10];

        const forbiddenRegex = /(診断|治療|病気|治る|疾患|服用|処方|薬|病院|クリニック|医師)/;

        for (const key of keys) {
            for (const score of scores) {
                for (const day of days) {
                    const result = getPhase1Story({ typeKey: key, score, streakDays: day });
                    expect(result.titleLine).not.toMatch(forbiddenRegex);
                    expect(result.subLine).not.toMatch(forbiddenRegex);
                    if (result.hookLine) {
                        expect(result.hookLine).not.toMatch(forbiddenRegex);
                    }
                    expect(result.shareQuestion).not.toMatch(forbiddenRegex);
                }
            }
        }
    });

    it('generates streak hooks on specific days', () => {
        const day0 = getPhase1Story({ typeKey: 'neutral', score: 50, streakDays: 0 });
        expect(day0.hookLine).toBeTruthy();
        expect(day0.hookLine).toContain('3日分');

        const day3 = getPhase1Story({ typeKey: 'neutral', score: 50, streakDays: 3 });
        // Day 3 is when Celebrate Message appears, so hook might be omitted. Wait, in logic hook is null on day 3.
        expect(day3.hookLine).toBeNull();

        const day5 = getPhase1Story({ typeKey: 'neutral', score: 50, streakDays: 5 });
        expect(day5.hookLine).toBeTruthy();
        expect(day5.hookLine).toContain('7日');
    });

    it('returns a valid share question', () => {
        const result = getPhase1Story({ typeKey: 'yang_def', score: 60 });
        expect(result.shareQuestion).toBeTruthy();
        expect(typeof result.shareQuestion).toBe('string');
    });
});
