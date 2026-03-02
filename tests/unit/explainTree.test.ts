import { describe, it, expect } from 'vitest';
import { getExplainTreeV1, FORBIDDEN_WORDS } from '../../utils/explainTree';
import { explainTreeToHtml } from '../../utils/explainTreeToHtml';
import { AnalysisV2Payload } from '../../types';

describe('Explain Tree v1 Utility (Hardened)', () => {
    const dummyPayload: AnalysisV2Payload = {
        output_version: 'dummy-lv4',
        guard: { level: 4, band: 'SAFE', mix: 'NONE' },
        diagnosis: {
            top1_id: 'P_LUNG_YIN_DEF',
            top2_id: 'P_QI_DEF',
            top3_ids: ['P_LUNG_YIN_DEF', 'P_QI_DEF', 'P_BLOOD_DEF']
        },
        display: {
            template_key: 'STANDARD',
            show: { show_pattern_name: true, show_top3_list: true }
        }
    };

    it('should generate a tree structure including Condition Type (9-type mapping)', () => {
        const tree = getExplainTreeV1(dummyPayload, 'PRO');

        // Find Condition Node
        const conditionNode = tree.children?.find(c => c.id === 'condition-type');
        expect(conditionNode).toBeDefined();
        // P_LUNG_YIN_DEF maps to "陰虚（いんきょ）タイプ"
        expect(conditionNode?.title).toContain('陰虚');
    });

    it('should ABSOLUTELY NOT contain forbidden medical words (Sanitization Check)', () => {
        const tree = getExplainTreeV1(dummyPayload, 'LIGHT');

        // Simple serialization check for forbidden words
        const serialized = JSON.stringify(tree);

        FORBIDDEN_WORDS.forEach(word => {
            expect(serialized).not.toContain(word);
        });

        // Essential neutral keywords check
        expect(serialized).toContain('分析');
        expect(serialized).toContain('傾向');
    });

    it('should generate valid HTML with mandatory metadata and no external scripts', () => {
        const tree = getExplainTreeV1(dummyPayload, 'PRO');
        const meta = {
            build: '2026.03.02.02',
            role: 'PRO',
            generatedAt: '2026/03/02 12:00:00'
        };
        const html = explainTreeToHtml(tree, meta);

        expect(html).toContain('Explain Tree');
        expect(html).toContain(meta.build);
        expect(html).toContain('陰虚');
        expect(html).toContain('Copy HTML');

        // Ensure no external scripts for security
        expect(html).not.toContain('<script src=');

        // Verify sanitization in HTML too
        FORBIDDEN_WORDS.forEach(word => {
            expect(html).not.toContain(word);
        });
    });
});
