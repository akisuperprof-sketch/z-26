import { DiagnosisResult, UserInfo, AnalysisMode } from '../types';
import { isDevEnabled, getSelectedPlan } from '../utils/devFlags';
import { analyzeLegacy } from './analyzers/legacy';
import { analyzeLite } from './analyzers/lite';
import { analyzePro } from './analyzers/pro';
import { analyzeAcademic } from './analyzers/academic';

/**
 * 舌診解析ルーター
 * フラグおよびプラン設定に基づき、適切な解析エンジンを選択する
 */
export const routeTongueAnalysis = async (
    images: File[],
    userInfo: UserInfo | null,
    mode: AnalysisMode
): Promise<DiagnosisResult> => {
    // フラグチェック（本番環境ではデフォルトOFF / isDevEnabledを使用）
    if (!isDevEnabled()) {
        // フラグOFF時は常に旧ロジックを使用（本番安全性担保）
        return analyzeLegacy(images, userInfo, mode);
    }

    // フラグON時はプラン設定を確認
    const selectedPlan = getSelectedPlan();

    switch (selectedPlan) {
        case 'lite':
            return analyzeLite(images, userInfo);
        case 'pro':
            return analyzePro(images, userInfo);
        case 'academic':
            return analyzeAcademic(images, userInfo);
        case 'legacy':
            return analyzeLegacy(images, userInfo, mode);
        default:
            return analyzeLegacy(images, userInfo, mode);
    }
};
