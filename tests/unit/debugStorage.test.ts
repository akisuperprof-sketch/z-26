import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveLatestPayloadForDebug, getLatestPayloadForDebug, clearDebugStorage } from '../../utils/debugStorage';
import { AnalysisV2Payload } from '../../types';

describe('Debug Storage Utility (Hardened)', () => {
    const dummyPayload: AnalysisV2Payload = {
        output_version: 'v1.2-harden',
        guard: { level: 4, band: 'SAFE', mix: 'NONE' },
        diagnosis: {
            top1_id: 'P_LUNG_YIN_DEF',
            top2_id: null,
            top3_ids: ['P_LUNG_YIN_DEF']
        },
        display: {
            template_key: 'STANDARD',
            show: { show_pattern_name: true, show_top3_list: true }
        }
    };

    const mockStorage: Record<string, string> = {};

    beforeEach(() => {
        Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
        vi.stubGlobal('localStorage', {
            setItem: vi.fn((k, v) => { mockStorage[k] = v; }),
            getItem: vi.fn((k) => mockStorage[k] || null),
            removeItem: vi.fn((k) => { delete mockStorage[k]; }),
            clear: vi.fn(() => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); })
        });
        vi.stubGlobal('window', {}); // For window check
    });

    it('should save and retrieve payload correctly', () => {
        saveLatestPayloadForDebug(dummyPayload);

        const retrieved = getLatestPayloadForDebug();
        expect(retrieved).not.toBeNull();
        expect(retrieved?.payload.output_version).toBe('v1.2-harden');
        expect(localStorage.getItem('z26_latest_payload_for_explain')).not.toBeNull();
    });

    it('should handle TTL and expire data after 30 mins', () => {
        vi.useFakeTimers();
        saveLatestPayloadForDebug(dummyPayload);

        vi.advanceTimersByTime(31 * 60 * 1000);

        const retrieved = getLatestPayloadForDebug();
        expect(retrieved).toBeNull();
        expect(localStorage.getItem('z26_latest_payload_for_explain')).toBeNull();

        vi.useRealTimers();
    });
});
