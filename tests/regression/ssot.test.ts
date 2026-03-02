
import { describe, it, expect } from 'vitest';
import { analyzeCore } from '../../services/analyzers/coreEngine';
import { TEST_CASES } from '../fixtures/golden/cases';
import { mapCoreToV2Payload } from '../utils/ssotMapper';

describe('SSOT Golden Regression Tests', () => {
    TEST_CASES.forEach((testCase) => {
        it(`should match golden snapshot for ${testCase.id} (${testCase.description})`, () => {
            // Execute Core Inference
            const coreOutput = analyzeCore(testCase.tongue, testCase.hearing);

            // Map to SSOT Payload (Single Source of Truth)
            const payload = mapCoreToV2Payload(coreOutput);

            // Verify against snapshot
            // Note: .toMatchSnapshot() will create files in tests/regression/__snapshots__
            expect(payload).toMatchSnapshot();
        });
    });
});
