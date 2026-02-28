import { DiagnosisResult, UserInfo } from '../../types';

/**
 * Academicプラン 解析ロジック (Stub)
 * 立体解析（五行分類含む）
 */
export const analyzeAcademic = async (
    images: File[],
    userInfo: UserInfo | null
): Promise<DiagnosisResult> => {
    console.log('Running Academic Analyzer...');

    return {
        heatCold: {
            score: 2,
            label: "判定中 (Academic)",
            explanation: "Academicプランでの立体構造解析準備中です。"
        },
        findings: []
    };
};
