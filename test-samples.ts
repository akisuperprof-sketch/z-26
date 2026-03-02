import { analyzeCore } from './services/analyzers/coreEngine';

console.log("=== Sample 1: Healthy ===");
const out1 = analyzeCore(
  { bodyColor: '淡紅', coatColor: '白', coatThickness: '薄', moisture: '正常', regionMap: {} },
  { 'Q01':0,'Q02':0,'Q03':0,'Q04':0,'Q05':0,'Q06':0,'Q07':0,'Q08':0,'Q09':0,'Q10':0,'Q11':0,'Q12':0,'Q13':0,'Q14':0,'Q15':0,'Q16':0,'Q17':0,'Q18':0,'Q19':0,'Q20':0 }
);
console.log(JSON.stringify(out1, null, 2));

console.log("\n=== Sample 2: Blood Stasis + Missing Audio ===");
const out2 = analyzeCore(
  { bodyColor: '紫', bodyShape: ['瘀点'], coatColor: '灰黒', moisture: '乾', regionMap: { 'tip': ['紫'] } },
  { 'Q01':null,'Q02':null,'Q03':null,'Q04':1,'Q05':null,'Q06':null,'Q07':2,'Q08':0,'Q09':null,'Q10':2,'Q11':null,'Q12':null,'Q13':null,'Q14':null,'Q15':null,'Q16':2,'Q17':1,'Q18':null,'Q19':null,'Q20':null }
);
console.log(JSON.stringify(out2, null, 2));

console.log("\n=== Sample 3: Liver Stagnation (Aux Rule) ===");
const out3 = analyzeCore(
  { regionMap: { 'side': ['紅'] } },
  { 'Q07': 2, 'Q10': 2 }
);
console.log(JSON.stringify(out3.top3, null, 2));

