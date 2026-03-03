
import { describe, it, expect } from 'vitest';
import { mapZaoShiToLabel, ZAO_SHI_LABELS } from '../../constants/zaoShiLabels';

describe('ZaoShi Mapping Logic', () => {
    it('should map scores > 15 to WET', () => {
        expect(mapZaoShiToLabel(20).type).toBe('WET');
        expect(mapZaoShiToLabel(16).type).toBe('WET');
    });

    it('should map scores < -25 to DRY', () => {
        expect(mapZaoShiToLabel(-30).type).toBe('DRY');
        expect(mapZaoShiToLabel(-26).type).toBe('DRY');
    });

    it('should map scores between -25 and -10 to SLIGHT_DRY', () => {
        expect(mapZaoShiToLabel(-15).type).toBe('SLIGHT_DRY');
        expect(mapZaoShiToLabel(-11).type).toBe('SLIGHT_DRY');
        expect(mapZaoShiToLabel(-25).type).toBe('SLIGHT_DRY');
    });

    it('should map middle scores to BALANCED', () => {
        expect(mapZaoShiToLabel(0).type).toBe('BALANCED');
        expect(mapZaoShiToLabel(-10).type).toBe('BALANCED');
        expect(mapZaoShiToLabel(15).type).toBe('BALANCED');
    });

    it('should return correct labels and subLabels from SSOT', () => {
        const wetLabel = ZAO_SHI_LABELS.WET;
        expect(wetLabel.label).toBe('湿り傾向');
        expect(wetLabel.subLabel).toBe('むくみや重だるさが出やすい傾向');
    });
});
