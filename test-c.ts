import { analyzeCore } from './services/analyzers/coreEngine';
const tongue = { coatTexture: ['滑'] };
const hearing = { 'Q11': 2 };
const out = analyzeCore(tongue, hearing);
console.log(JSON.stringify(out.top3, null, 2));
console.log('Final Axes:', out.axes);
