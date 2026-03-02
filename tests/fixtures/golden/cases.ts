
import { TongueInput, HearingInput } from '../../../services/analyzers/coreEngine';

export interface TestCase {
    id: string;
    description: string;
    tongue: TongueInput;
    hearing: HearingInput;
}

export const TEST_CASES: TestCase[] = [
    {
        id: "Case_01",
        description: "Yin Deficiency (Strong) - Based on Dummy LV4",
        tongue: {
            bodyColor: '絳（深紅）',
            bodyShape: ['裂紋', '痩薄', '舌下静脈怒張'],
            coatThickness: 'なし（無苔寄り）',
            moisture: '少津',
            regionMap: { root: ['絳（深紅）', 'なし（無苔寄り）', '裂紋', '少津'] }
        },
        hearing: {
            Q01: 2, Q02: 2, Q03: 2, Q14: 2, Q15: 2, Q16: 2, Q19: 2, Q20: 2,
            Q06: 0, Q07: 0, Q08: 0, Q09: 0, Q10: 0
        }
    },
    {
        id: "Case_02",
        description: "Qi Stagnation (Liver Qi Stagnation)",
        tongue: {
            bodyColor: "紅",
            bodyShape: ["辺尖紅"],
            coatColor: "白",
            coatThickness: "薄",
            moisture: "正常",
            regionMap: { side: ["紅"] }
        },
        hearing: {
            Q07: 2, Q10: 2, Q12: 1, Q18: 1
        }
    },
    {
        id: "Case_03",
        description: "Neutral / Balanced State",
        tongue: {
            bodyColor: "淡紅",
            bodyShape: [],
            coatColor: "白",
            coatThickness: "薄",
            moisture: "正常",
            regionMap: {}
        },
        hearing: {
            Q01: 0, Q06: 0, Q11: 0, Q14: 0, Q17: 0, Q19: 0
        }
    }
];
