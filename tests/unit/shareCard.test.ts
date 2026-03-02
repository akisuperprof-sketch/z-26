import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getShareMessage, generateShareCard } from '../../utils/shareCard';

describe('Share Card Utility', () => {
    describe('getShareMessage', () => {
        it('should return appropriate non-medical messages based on score', () => {
            const highMsg = getShareMessage(85);
            expect(highMsg).toBe("良いバランスを保てているようです。");
            expect(highMsg).not.toMatch(/診断|治療|病/);

            const midMsg = getShareMessage(65);
            expect(midMsg).toBe("少し休息が必要なサインが出ています。");
            expect(midMsg).not.toMatch(/診断|治療|病/);

            const lowMsg = getShareMessage(45);
            expect(lowMsg).toBe("日々の習慣を見直す良い機会かもしれません。");
            expect(lowMsg).not.toMatch(/診断|治療|病/);

            const veryLowMsg = getShareMessage(20);
            expect(veryLowMsg).toBe("心身の声を聴き、無理をせず過ごしましょう。");
            expect(veryLowMsg).not.toMatch(/診断|治療|病/);
        });
    });

    describe('generateShareCard', () => {
        beforeEach(() => {
            const mockContext: any = {
                createLinearGradient: vi.fn().mockReturnValue({
                    addColorStop: vi.fn(),
                }),
                createRadialGradient: vi.fn().mockReturnValue({
                    addColorStop: vi.fn(),
                }),
                fillRect: vi.fn(),
                strokeRect: vi.fn(),
                fillText: vi.fn(),
                beginPath: vi.fn(),
                arc: vi.fn(),
                roundRect: vi.fn(),
                fill: vi.fn(),
                stroke: vi.fn(),
                textAlign: 'left',
                fillStyle: '',
                font: '',
                strokeStyle: '',
                lineWidth: 1
            };

            const mockCanvas = {
                getContext: vi.fn(() => mockContext),
                toDataURL: vi.fn(() => 'data:image/png;base64,mockdata'),
                width: 0,
                height: 0
            } as any;

            vi.stubGlobal('document', {
                createElement: vi.fn().mockImplementation((tagName: string) => {
                    if (tagName === 'canvas') return mockCanvas;
                    return {} as any;
                })
            });
        });

        afterEach(() => {
            vi.unstubAllGlobals();
        });

        it('should generate a canvas data URL successfully', async () => {
            const data = {
                typeName: "気虚タイプ",
                typeDescription: "エネルギー不足のサイン",
                typeCare: "休息と消化の良い食事",
                score: 75,
                plan: "light"
            };

            const result = await generateShareCard(data);
            expect(result).toBe('data:image/png;base64,mockdata');
            expect(document.createElement).toHaveBeenCalledWith('canvas');
        });
    });
});
