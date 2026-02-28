import { DiagnosisResult, UserInfo, LiteResult } from '../../types';

/**
 * Liteプラン 解析ロジック
 * 主に「寒熱スペクトラム」の算出を担当します。
 */
export const analyzeLite = async (
    images: File[],
    userInfo: UserInfo | null
): Promise<DiagnosisResult> => {
    console.log('Running Lite Analyzer (v0.2.0)...');

    // 暫定ロジック: ヒアリング回答がある場合、それに基づいてスペクトラム値を算出
    // ヒアリング項目（lite.json）
    // q3: 冷え (0-100), q4: のぼせ (0-100)

    let spectrumValue = 0;
    if (userInfo?.answers) {
        // 簡易計算: のぼせ(熱) - 冷え(寒)
        const coldScore = Number(userInfo.answers['q3']) || 50;
        const heatScore = Number(userInfo.answers['q4']) || 50;
        spectrumValue = heatScore - coldScore; // -100 to +100
    }

    // 舌画像解析のシミュレーション（将来的にここでAI解析を行う）
    const mockLiteResult: LiteResult = {
        spectrumValue: spectrumValue,
        tongueColor: spectrumValue > 30 ? "紅 (熱傾向)" : spectrumValue < -30 ? "淡白 (寒傾向)" : "淡紅",
        coatingColor: "薄白",
        advice: "Liteプランによる簡易判定です。寒熱のバランスを意識した食事を摂りましょう。"
    };

    return {
        heatCold: {
            score: Math.min(Math.max(Math.round(spectrumValue / 25), -3), 4),
            label: spectrumValue > 20 ? "熱傾向" : (spectrumValue < -20 ? "寒傾向" : "正常"),
            explanation: `Liteプランの解析により、寒熱バランスは ${spectrumValue} (-100〜+100) と判定されました。`
        },
        findings: [], // Liteプランでは詳細な所見特定は最小限にする
        liteResult: mockLiteResult
    };
};
