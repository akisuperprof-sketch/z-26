
import { CoreOutput } from '../../services/analyzers/coreEngine';
import { AnalysisV2Payload } from '../../types';

/**
 * App内の analyzePro.ts と同一のロジックで CoreOutput を v2Payload に変換する
 * これにより、SSOTの構造が不意に変わったことを検知できる
 */
export function mapCoreToV2Payload(coreOutput: CoreOutput, isDummy: boolean = false, preset: string = ""): AnalysisV2Payload {
    return {
        output_version: isDummy ? `Z26_P2_v1-dummy-${preset}` : "Z26_P2_v1",
        guard: {
            level: coreOutput.guard.level,
            band: coreOutput.guard.levelLabel,
            mix: coreOutput.guard.tendency
        },
        diagnosis: {
            top1_id: coreOutput.top3[0]?.id || null,
            top2_id: coreOutput.top3[1]?.id || null, // Note: pro.ts uses top2_id but also includes it in top3_ids
            top3_ids: coreOutput.top3.map(p => p.id)
        },
        display: {
            template_key: coreOutput.guard.level >= 2 ? "standard_pro" : "neutral_pro",
            show: {
                show_pattern_name: coreOutput.guard.level >= 2,
                show_top3_list: coreOutput.guard.level >= 2 && coreOutput.top3.length === 3
            }
        },
        stats: {
            answered: Object.keys(coreOutput.inputs.hearing).length,
            total: 20
        }
    };
}
