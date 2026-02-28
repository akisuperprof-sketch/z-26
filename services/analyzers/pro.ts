import { DiagnosisResult, UserInfo } from '../../types';

/**
 * Proプラン 解析ロジック (Stub)
 * 寒熱 × 虚実 4象限判定
 */
export const analyzePro = async (
    images: File[],
    userInfo: UserInfo | null
): Promise<DiagnosisResult> => {
    console.log('Running Pro Analyzer...');

    return {
        heatCold: {
            score: 1,
            label: "判定中 (Pro)",
            explanation: "Proプランでの4象限解析準備中です。"
        },
        findings: []
    };
};
