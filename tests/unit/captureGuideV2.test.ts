import { describe, it, expect } from 'vitest';
import { getCaptureGuideV2 } from '../../utils/captureGuideV2';

describe('captureGuideV2 Utils', () => {
    it('should return initial message when no metrics available', () => {
        const result = getCaptureGuideV2(null, 'FREE');
        expect(result.isOk).toBe(false);
        expect(result.message).toContain('枠の中に収めてください');
    });

    it('should return dark condition advice when brightness is low', () => {
        const metrics = { blur_score: 30, brightness_mean: 50, saturation_mean: 50 };
        const result = getCaptureGuideV2(metrics, 'FREE');
        expect(result.isOk).toBe(false);
        expect(result.message).toContain('明るい場所で');
        expect(result.message).not.toMatch(/診断|病気|治療|悪化/); // forbidden words test
    });

    it('should return blur advice when blur score is low', () => {
        const metrics = { blur_score: 10, brightness_mean: 100, saturation_mean: 50 };
        const result = getCaptureGuideV2(metrics, 'FREE');
        expect(result.isOk).toBe(false);
        expect(result.message).toContain('手ブレに注意して');
        expect(result.message).not.toMatch(/診断|病気|治療|悪化/);
    });

    it('should append student guidance message when role is STUDENT and not ok', () => {
        const metrics = { blur_score: 10, brightness_mean: 100, saturation_mean: 50 };
        const result = getCaptureGuideV2(metrics, 'STUDENT');
        expect(result.isOk).toBe(false);
        expect(result.message).toContain('研究に使える品質に近づけるため');
    });

    it('should return ok when metrics are optimal', () => {
        const metrics = { blur_score: 30, brightness_mean: 100, saturation_mean: 50 };
        const result = getCaptureGuideV2(metrics, 'FREE');
        expect(result.isOk).toBe(true);
        expect(result.message).toContain('撮影しやすい状態です');
    });

    it('should not append student guidance when metrics are optimal for student', () => {
        const metrics = { blur_score: 30, brightness_mean: 100, saturation_mean: 50 };
        const result = getCaptureGuideV2(metrics, 'STUDENT');
        expect(result.isOk).toBe(true);
        expect(result.message).not.toContain('研究に使える品質に近づけるため');
    });
});
