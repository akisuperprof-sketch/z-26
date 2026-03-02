
import React, { useState } from 'react';
import { DiagnosisResult, RiskLevel, UploadedImage } from '../types';
import FindingCard from './FindingCard';
import { YIN_DEF_IDS } from '../constants/patternGroups';
import DoctorReviewForm from './DoctorReviewForm';
import { getConditionType } from '../utils/typeMapper';
import { getStreakData, getCelebrateMessage } from '../utils/streak';
import StreakBadge from './StreakBadge';
import { ShareCardData, generateShareCard } from '../utils/shareCard';
import { getHistoryMini, getDelta } from '../utils/historyMini';
import { getPhase1Story } from '../utils/phase1Story';

interface ResultsScreenProps {
  result: DiagnosisResult;
  onRestart: () => void;
  uploadedImages: UploadedImage[];
  onOpenDictionary?: () => void;
  plan?: string;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ result, onRestart, uploadedImages, onOpenDictionary, plan }) => {
  const { findings, heatCold, result_v2 } = result;
  const isPro = plan === 'pro';
  const [selectedGridKey, setSelectedGridKey] = useState<string | null>(null);

  // Single Source of Truth (SSoT) Definition
  const v2 = result_v2?.output_payload;

  // Streak & Celebration
  const streak = getStreakData();
  const celebrateMsg = getCelebrateMessage(streak.streakDays);

  // マッピングの取得
  const conditionType = getConditionType(v2?.diagnosis.top1_id || result.top3?.[0]?.id || null);

  const isMockActive = import.meta.env.DEV && typeof window !== 'undefined' && localStorage.getItem('MOCK_AI') === 'true';
  const isDummyActive = import.meta.env.DEV && typeof window !== 'undefined' && localStorage.getItem('DUMMY_TONGUE') === 'true';
  const isForcedPro = import.meta.env.DEV && typeof window !== 'undefined' && localStorage.getItem('FORCE_PRO') === 'true';
  const isShareCardEnabled = typeof window !== 'undefined' && localStorage.getItem('FF_SHARE_CARD_V1') === '1';
  const isHistoryMiniEnabled = typeof window !== 'undefined' && localStorage.getItem('FF_HISTORY_MINI_V1') === '1';
  const isPhase1StoryEnabled = typeof window !== 'undefined' && localStorage.getItem('FF_PHASE1_STORY_V1') === '1';

  const historyMini = isHistoryMiniEnabled ? getHistoryMini() : [];

  // Story & Hooks
  const dummyScore = 50 + (conditionType.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 45); // Used for share and story rank
  const story = isPhase1StoryEnabled ? getPhase1Story({ typeKey: conditionType.key, score: dummyScore, streakDays: streak.streakDays }) : null;

  // SSoT Metrics for Inspector
  const dataPathUsed = v2 ? "V2" : (result.guard ? "LEGACY" : "NONE");
  const hasV2 = !!v2;
  const v2Incomplete = hasV2 && (!v2.diagnosis.top1_id || v2.diagnosis.top3_ids.length === 0 || v2.guard.level === undefined);

  // Step E: Quick Test Verification (DEV ONLY)
  const isAutoTest = import.meta.env.DEV && v2?.output_version.includes('dummy-lv4');
  const isDebugPanelOpen = typeof window !== 'undefined' && localStorage.getItem('DEBUG_PANEL_OPEN') === 'true';

  const stepEPassed = isAutoTest &&
    dataPathUsed === "V2" &&
    (v2?.guard.level === 3 || v2?.guard.level === 4) &&
    v2?.diagnosis.top1_id !== null &&
    YIN_DEF_IDS.includes(v2?.diagnosis.top1_id || "") &&
    v2?.diagnosis.top3_ids.length === 3;

  const stepEFailures = [];
  if (isAutoTest) {
    if (dataPathUsed !== "V2") stepEFailures.push("NOT V2 PATH");
    if (!(v2?.guard.level === 3 || v2?.guard.level === 4)) stepEFailures.push(`LEVEL NOT 3-4 (GOT: ${v2?.guard.level})`);
    if (v2?.diagnosis.top1_id === null) stepEFailures.push("TOP1_ID IS NULL");
    else if (!YIN_DEF_IDS.includes(v2?.diagnosis.top1_id || "")) stepEFailures.push(`NOT YIN DEFICIENCY (GOT: ${v2?.diagnosis.top1_id})`);
    if (v2?.diagnosis.top3_ids.length !== 3) stepEFailures.push(`TOP3_IDS COUNT NOT 3 (GOT: ${v2?.diagnosis.top3_ids.length})`);
  }

  // Development Logging
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.group("🔍 Analysis Single Source of Truth (ResultsScreen)");
      const logs = {
        dataPathUsed,
        output_version: v2?.output_version || (result.result_v2 as any)?.output_version || "LEGACY",
        "guard.level": v2?.guard.level ?? result.guard?.level ?? "N/A",
        "diagnosis.top1": v2?.diagnosis.top1_id ?? result.top3?.[0]?.id ?? "null",
        dummy: isDummyActive,
        mock_active: isMockActive,
        v2Incomplete
      };
      console.table(logs);
      if (v2) console.log("[V2 FULL PAYLOAD]", v2);
      console.groupEnd();
    }
  }, [v2, result.guard, isMockActive, isDummyActive, dataPathUsed, v2Incomplete]);

  const concerningFindings = [...findings].filter(f => f.riskLevel === RiskLevel.Red || f.riskLevel === RiskLevel.Yellow)
    .sort((a, b) => {
      const order = { [RiskLevel.Red]: 0, [RiskLevel.Yellow]: 1, [RiskLevel.Green]: 2 };
      return order[a.riskLevel] - order[b.riskLevel];
    });

  const healthyFindings = findings.filter(f => f.riskLevel === RiskLevel.Green);

  const renderSummaryContent = () => {
    const healthyNames = healthyFindings.map(f => `「${f.name}」`).join('や');
    if (findings.length === 0) {
      return (
        <p className="text-slate-600">
          アップロードいただいた画像を拝見しました。全体的に舌の色や形は良好で、特筆すべき懸念点も見当たりませんでした。素晴らしい状態です。引き続きこの調子で健康管理を続けていきましょう。
        </p>
      );
    }
    if (healthyFindings.length > 0 && concerningFindings.length > 0) {
      return (
        <>
          <p className="text-slate-600">
            アップロードいただいた画像を拝見しました。まず、{healthyNames}といった特徴が見られます。これらは体質や日常のわずかな変化で現れることが多く、健康上すぐに問題となる可能性は低いでしょう。
          </p>
          <p className="text-slate-700 font-medium mt-2">
            一方で、今後の健康管理のために、いくつか注意しておきたい点もあります。以下で詳しく見ていきましょう。
          </p>
        </>
      );
    }
    if (healthyFindings.length > 0 && concerningFindings.length === 0) {
      return (
        <>
          <p className="text-slate-600">
            アップロードいただいた画像を拝見しました。{healthyNames}といった特徴が見られますが、これらは体質や日常のわずかな変化で現れることが多く、健康上すぐに問題となる可能性は低いでしょう。
          </p>
          <p className="text-slate-700 font-medium mt-2">
            全体的に見て、大きな懸念点は見当たりませんでした。以下に詳細を示しますので、ご自身の状態を把握する参考としてください。
          </p>
        </>
      );
    }
    if (concerningFindings.length > 0 && healthyFindings.length === 0) {
      return (
        <>
          <p className="text-slate-600">
            アップロードいただいた画像を拝見しました。いくつか気になるサインが見受けられます。
            健康管理の見直しが必要かもしれません。以下の詳細な所見と推奨アクションをご確認ください。
          </p>
        </>
      );
    }
    return null;
  };

  const handleShareCard = async () => {
    try {
      // Dummy hash for score based on ID for phase 1 demo
      const hash = conditionType.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const score = 50 + (hash % 45); // 50-95

      const data: ShareCardData = {
        typeName: conditionType.name,
        typeDescription: conditionType.description,
        typeCare: conditionType.care,
        score,
        plan: isPro ? 'pro' : 'light',
        shareQuestion: isPhase1StoryEnabled && story?.shareQuestion ? story.shareQuestion : undefined
      };

      const dataUrl = await generateShareCard(data);

      const link = document.createElement('a');
      link.href = dataUrl;
      const d = new Date();
      const dateStr = `${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}`;
      link.download = `tongue_share_${dateStr}.png`;
      link.click();
    } catch (e) {
      console.error("Failed to generate Share Card:", e);
      // Fail silently without blocking UX
    }
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText("https://app.tongue-ai.com/");
      alert("招待リンクをコピーしました");
    } catch (e) {
      console.error(e);
    }
  };

  const renderPatternSection = () => {
    // ------------------------------------------------------------------
    // v2 SSoT Logic (Priority)
    // ------------------------------------------------------------------
    if (dataPathUsed === "V2" && v2) {
      const { guard, diagnosis, display, stats } = v2;
      const showPatternName = display.show.show_pattern_name;
      const showTop3List = display.show.show_top3_list;

      const top3Patterns = (result.top3 || []).filter(p => diagnosis.top3_ids.includes(p.id));

      return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8 overflow-hidden relative text-left">
          <div className="absolute top-0 right-0 px-4 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-bl-lg">
            証判定 ({v2.output_version})
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <span className="mr-2">🧩</span> {isPro ? '詳細な証の分析' : '現在の主証と傾向'}
          </h3>

          {guard.level === 1 || (!showPatternName && !showTop3List) ? (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="text-slate-400 text-3xl mb-2">⚖️</div>
              <p className="text-slate-600 font-bold">{guard.band}</p>
              <div className="text-[10px] font-mono p-2 bg-slate-100 rounded text-slate-400 mt-4">
                tmpl: {display.template_key} | mix: {guard.mix}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className={`flex flex-col md:flex-row gap-6 items-center ${isPro ? 'border-b border-slate-100 pb-6' : ''}`}>
                <div className={`w-full ${isPro ? 'md:w-1/2' : 'md:w-1/3'} flex flex-col items-center justify-center p-6 bg-blue-50 rounded-xl border border-blue-100 text-center shadow-inner`}>
                  <span className="text-[10px] text-blue-600 font-bold mb-1 uppercase tracking-widest">【 主証判定 】</span>
                  <span className={`${isPro ? 'text-3xl' : 'text-2xl'} font-black text-blue-900 leading-tight mb-2 px-2`}>
                    {result.guard?.primaryPatternName || result.top3?.[0]?.name || "特定中"}
                  </span>
                </div>
                <div className="flex-1">
                  <div className={`p-4 ${isPro ? 'bg-slate-50 border-l-4 border-blue-400' : 'bg-slate-50 border border-slate-100'} rounded-lg shadow-sm`}>
                    <h4 className="text-[10px] font-bold text-slate-400 mb-1 uppercase">AI解析メッセージ</h4>
                    <p className={`${isPro ? 'text-base' : 'text-sm'} text-slate-700 leading-relaxed font-medium`}>
                      「{result.guard?.message || "身体のバランスを整えましょう。"}」
                    </p>
                  </div>
                </div>
              </div>

              {isPro && showTop3List && (
                <div className="mt-2 text-left">
                  <h4 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2">併存パターン（Top 3）</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {top3Patterns.map((p, idx) => (
                      <div key={idx} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                        <span className="font-black text-slate-700 text-sm">{idx + 1}. {p.name} (Score: {p.score})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (dataPathUsed === "LEGACY" && result.guard) {
      return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-400 mb-8 overflow-hidden relative grayscale opacity-70 text-left">
          <div className="absolute top-0 right-0 px-4 py-1 bg-slate-500 text-white text-[10px] font-black rounded-bl-lg">
            LEGACY CONTENT
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-4 opacity-50">🧩 証判定 (旧Ver / Fallback)</h3>
          <p className="text-sm font-medium">{result.guard.primaryPatternName || "特定中"}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="animate-fade-in">
      {/* 🎰 継続演出 (Streak) & 🪝 フック */}
      {((streak.active && streak.streakDays > 0) || (isPhase1StoryEnabled && story?.hookLine)) && (
        <div className="flex flex-col items-center mb-6">
          {streak.active && streak.streakDays > 0 && <StreakBadge className="scale-125 hover:scale-125 border-blue-200" />}

          {celebrateMsg ? (
            <div className="mt-4 px-6 py-2 bg-blue-50 border border-blue-100 text-blue-700 font-bold rounded-full text-xs shadow-sm shadow-blue-100/50 animate-bounce-subtle">
              🎉 {celebrateMsg}
            </div>
          ) : (
            isPhase1StoryEnabled && story?.hookLine && (
              <div className="mt-4 px-6 py-2 bg-slate-50 border border-slate-200 text-slate-600 font-bold rounded-full text-xs shadow-sm shadow-slate-200/50 animate-fade-in-up flex items-center gap-1.5">
                <span className="text-jade-500 text-sm">💡</span> {story.hookLine}
              </div>
            )
          )}
        </div>
      )}

      {import.meta.env.DEV && isDebugPanelOpen && (
        <div className="mb-6 p-3 bg-slate-900 text-[10px] font-mono rounded-lg border border-slate-700 shadow-xl overflow-hidden text-left">
          <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-700">
            <span className="text-amber-400 font-bold">📡 PAYLOAD INSPECTOR (DEV ONLY)</span>
            <span className={`px-2 py-0.5 rounded ${dataPathUsed === 'V2' ? 'bg-jade-900 text-jade-300' : 'bg-red-900 text-red-300'}`}>
              PATH: <span className="font-black">{dataPathUsed}</span>
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-slate-400">
            <div>hasV2: <span className={hasV2 ? 'text-jade-400' : 'text-red-400'}>{hasV2 ? 'TRUE' : 'FALSE'}</span></div>
            <div>version: <span className="text-white">{v2?.output_version || 'N/A'}</span></div>
            <div>level: <span className="text-white">{v2?.guard.level ?? 'N/A'}</span></div>
            <div>top1_id: <span className="text-white">{v2?.diagnosis.top1_id || 'null'}</span></div>
            <div>top3_count: <span className="text-white">{v2?.diagnosis.top3_ids.length ?? 0}</span></div>
            <div>is_dummy: <span className="text-white">{isDummyActive ? 'TRUE' : 'FALSE'}</span></div>
          </div>

          {isAutoTest && (
            <div className={`mt-3 p-2 rounded border font-bold ${stepEPassed ? 'bg-jade-900/40 border-jade-600 text-jade-300' : 'bg-red-900 border-red-500 text-red-200'}`}>
              <div className="flex justify-between items-center">
                <span>{stepEPassed ? '✅' : '❌'} STEP E: {stepEPassed ? 'PASSED (QUICK TEST MATCH)' : 'FAILED'}</span>
              </div>
              {!stepEPassed && (
                <div className="mt-1 text-[9px] font-normal opacity-90 space-y-0.5">
                  <p>Reason: {stepEFailures.join(', ')}</p>
                  <p className="bg-black/20 p-1 rounded mt-1 border border-white/10">
                    Expected: YIN_DEF (One of: {YIN_DEF_IDS.join(', ')})
                    <br />
                    Received: <span className="font-bold underline">{v2?.diagnosis.top1_id || 'null'}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {(v2Incomplete || !hasV2) && !isAutoTest && (
            <div className="mt-3 p-2 bg-red-900/30 border border-red-900/50 rounded text-red-300">
              <p className="font-bold flex items-center gap-1">
                <span className="text-base">⚠️</span>
                {!hasV2 ? 'CRITICAL: V2 Payload missing (Router returned legacy result?)' : 'INCOMPLETE: V2 data points are missing'}
              </p>
              <p className="mt-1 opacity-80 leading-relaxed">
                Check Analyzer Router and specific analyzer (lite/pro) return values.
                {v2 && !v2.diagnosis.top1_id && " Reason: top1_id is null."}
                {v2 && v2.diagnosis.top3_ids.length === 0 && " Reason: top3_ids is empty."}
                {!hasV2 && " Path: Rendering is falling back to legacy structure."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 🚀 今日のコンディションタイプ (Hero Upgrade v1) */}
      <div className="bg-gradient-to-br from-[#1F3A5F] via-[#162a44] to-[#0F1C2E] rounded-[12px] p-8 sm:p-12 mb-10 text-white shadow-xl relative overflow-hidden text-center border border-white/10 animate-fade-in">
        {/* decorative mesh gradient */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-jade-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <p className="text-jade-400 text-[11px] font-black uppercase tracking-[0.2em] mb-4 drop-shadow-sm">Today's Condition Type</p>
          <div className="mb-6">
            <span className="text-[10px] font-black bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 uppercase tracking-widest text-blue-200">
              Analysis Complete
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black mb-5 tracking-tighter leading-tight drop-shadow-md">
            {conditionType.name}
          </h2>

          {isPhase1StoryEnabled && story ? (
            <div className="mb-8 animate-fade-in-up">
              <p className="text-lg sm:text-xl font-bold text-white mb-2 tracking-wide leading-relaxed">
                {story.titleLine}
              </p>
              <p className="text-sm text-blue-100/90 font-medium">
                {story.subLine}
              </p>
            </div>
          ) : (
            <p className="text-sm sm:text-base text-blue-100/90 font-medium mb-10 max-w-lg mx-auto leading-relaxed">
              {conditionType.description.slice(0, 15)}（今日の傾向です）
            </p>
          )}

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 text-left border border-white/10 shadow-inner max-w-xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-jade-400 uppercase tracking-widest px-3 py-1 bg-jade-400/10 rounded-md border border-jade-400/20">
                Recommended Care
              </span>
            </div>
            <p className="text-sm sm:text-base leading-relaxed font-bold text-white/95">
              {conditionType.care}
            </p>
          </div>
        </div>
      </div>

      {/* 📊 9分類の視覚化 (9 Classifications Visualizer) */}
      <div className="bg-white rounded-[12px] p-6 mb-10 border border-slate-200 shadow-sm animate-fade-in-up">
        <div className="flex flex-col gap-1 items-start mb-6 w-full">
          <h3 className="text-[11px] font-black text-slate-400 flex items-center tracking-[0.2em] uppercase">
            <span className="w-1 h-3 bg-brand-primary mr-2 rounded-full"></span>
            Constitutional Patterns / 9分類
          </h3>
          <div className="text-sm font-bold text-slate-700 font-sans tracking-wide">現在のタイプ：{conditionType.name}</div>
          {import.meta.env.DEV && conditionType.key === 'neutral' && !['HEALTHY', 'NEUTRAL'].includes(result.top1_id) && (
            <div className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded w-full">
              ⚠️ [DEV ONLY] マッピング不一致 (top1_id: {result.top1_id}) -&gt; Neutral にフォールバックしています
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-9 gap-3">
          {[
            { key: 'qi_def', name: '気虚', icon: '🔋' },
            { key: 'yang_def', name: '陽虚', icon: '☀️' },
            { key: 'yin_def', name: '陰虚', icon: '💧' },
            { key: 'qi_stag', name: '気滞', icon: '🍃' },
            { key: 'blood_stasis', name: '血お', icon: '🔄' },
            { key: 'phlegm_damp', name: '痰湿', icon: '☁️' },
            { key: 'damp_heat', name: '湿熱', icon: '🌡️' },
            { key: 'blood_def', name: '血虚', icon: '🍇' },
            { key: 'neutral', name: '平和', icon: '✨' },
          ].map((t) => {
            const isCurrent = conditionType.key === t.key;
            const isSelected = selectedGridKey === t.key;
            return (
              <div
                key={t.key}
                onClick={() => setSelectedGridKey(isSelected ? null : t.key)}
                className={`relative flex flex-col items-center p-3 sm:py-4 rounded-xl border transition-all cursor-pointer select-none ${isCurrent
                  ? 'bg-jade-50/80 border-jade-300 shadow-md ring-2 ring-jade-400 z-10'
                  : 'bg-white border-slate-100 hover:bg-slate-50'
                  } ${isSelected && !isCurrent ? 'bg-blue-50/50 border-brand-primary/50 shadow-sm scale-105' : ''}`}
              >
                {isCurrent && (
                  <span className="absolute -top-2.5 -right-2.5 bg-[#E64A19] text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full border border-white shadow-sm z-20">
                    現在
                  </span>
                )}
                <span className={`text-2xl sm:text-3xl mb-1.5 transition-all ${isCurrent || isSelected ? 'scale-110' : 'opacity-40 grayscale'}`}>{t.icon}</span>
                <span className={`text-[11px] sm:text-xs font-black truncate w-full text-center transition-colors ${isCurrent ? 'text-brand-primary text-base sm:text-lg' : (isSelected ? 'text-brand-primary' : 'text-slate-400')}`}>
                  {t.name}
                </span>
                {isCurrent && (
                  <div className="mt-2 flex gap-1 items-center">
                    {/* Visual indicator of level could go here in future natively, for now dots */}
                    <div className="h-1.5 w-1.5 bg-jade-500 rounded-full animate-pulse"></div>
                    <div className="h-1.5 w-1.5 bg-jade-500 rounded-full"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {selectedGridKey && (
          <div className="mt-4 p-4 bg-blue-50/80 border border-blue-200/50 rounded-xl text-left animate-fade-in text-slate-700 text-sm font-medium">
            <span className="text-brand-primary text-[10px] font-black uppercase tracking-widest block mb-1">
              【{['気虚', '陽虚', '陰虚', '気滞', '血お', '痰湿', '湿熱', '血虚', '平和'][['qi_def', 'yang_def', 'yin_def', 'qi_stag', 'blood_stasis', 'phlegm_damp', 'damp_heat', 'blood_def', 'neutral'].indexOf(selectedGridKey)]}タイプ】
            </span>
            このタイプは体質傾向の目安です。医学的な診断や病気を特定するものではありません。
          </div>
        )}

        <p className="mt-6 text-[10px] text-slate-400 font-medium text-center bg-slate-50 py-2 rounded-lg border border-dashed border-slate-200">
          ※本分析は医学的診断ではありません。日々のバランスを確認する指標としてご活用ください。
        </p>
      </div>

      {/* 📅 ヒストリーミニ表示 (History Mini v1) */}
      {isHistoryMiniEnabled && historyMini.length > 0 && (
        <div className="mb-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-[13px] font-bold text-slate-500 mb-4 flex items-center tracking-widest uppercase">
            <span className="mr-2">📈</span> 過去の変化
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
            {historyMini.map((h, i) => {
              const delta = i < historyMini.length - 1 ? getDelta(h.score, historyMini[i + 1].score) : '→';
              const date = new Date(h.ts);
              const dateStr = `${(date.getMonth() + 1)}/${date.getDate()}`;
              return (
                <div key={i} className={`flex-shrink-0 w-32 p-3 rounded-xl border ${i === 0 ? 'border-brand-primary/40 bg-blue-50/50' : 'border-slate-100 bg-slate-50'} snap-center shadow-sm`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-slate-400">{dateStr}</span>
                    {i === 0 && <span className="text-[9px] bg-brand-primary text-white px-2 py-0.5 rounded-full font-bold">LATEST</span>}
                  </div>
                  <div className="text-sm font-black text-slate-800 truncate">{h.typeLabel}</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-brand-primary font-bold text-lg">{h.score}</span>
                    <span className={`text-sm font-black ${delta === '↑' ? 'text-green-500' : delta === '↓' ? 'text-red-500' : 'text-slate-400'}`}>{delta}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-brand-primary">解析結果</h2>
        <p className="text-slate-600 mt-2">これは医学的診断ではありません。あくまで健康管理の参考としてご活用ください。</p>
      </div>

      {heatCold && (
        <div className=" bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <h3 className="text-xl font-bold text-brand-primary mb-4 flex items-center">
            <span className="mr-2">🌡️</span> 寒熱バランス判定
          </h3>
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-500 mb-2">▼ 判定基準チャート（左：寒 〜 右：熱）</p>
            <div className="w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm">
              <img src="/tongue_scale_chart.jpg" alt="寒熱基準チャート" className="w-full object-contain max-h-48" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
              <span>寒（Cold）</span>
              <span>正常（Normal）</span>
              <span>熱（Heat）</span>
            </div>
          </div>
          <div className="mb-6 relative pt-2">
            <div className="relative h-4 w-full rounded-full bg-gradient-to-r from-blue-300 via-slate-100 to-red-400 border border-slate-200">
              <div className="absolute top-0 bottom-0 left-[37.5%] w-[1px] bg-slate-400 opacity-50"></div>
              <div className="absolute top-0 bottom-0 left-[50%] w-[2px] bg-green-500 z-10 opacity-70"></div>
              <div className="absolute top-0 bottom-0 left-[62.5%] w-[1px] bg-slate-400 opacity-50"></div>
              <div
                className="absolute top-1/2 -mt-2 w-4 h-4 rounded-full bg-slate-800 border-2 border-white shadow-lg transition-all duration-1000 ease-out z-20"
                style={{
                  left: `calc(${((Math.min(Math.max(heatCold.score, -4), 4) + 4) / 8) * 100}% - 8px)`
                }}
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-500 font-bold mb-1">判定スコア</p>
              <div className="text-4xl font-extrabold text-slate-800 tracking-tight">
                {heatCold.score > 0 ? `+${heatCold.score}` : heatCold.score}
                <span className="text-lg ml-2 font-medium text-slate-600">
                  / {heatCold.label}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-sm font-bold text-slate-700 mb-1">AI判定理由:</p>
            <p className="text-sm text-slate-600 leading-relaxed text-left">
              {heatCold.explanation}
            </p>
          </div>
        </div>
      )}

      {renderPatternSection()}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <h3 className="text-xl font-bold text-brand-primary mb-4">総合的な所見</h3>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {uploadedImages.map((img, idx) => (
            <div key={idx}>
              <img src={img.previewUrl} alt={img.slot} className="rounded-md h-20 w-full object-cover" />
              <p className="text-center text-xs mt-1 text-slate-600">{img.slot}</p>
            </div>
          ))}
        </div>
        <div className="space-y-3 text-left">
          {renderSummaryContent()}
        </div>
      </div>

      {concerningFindings.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-brand-primary text-center mb-4">特に注意したい点</h3>
          <div className="space-y-4">
            {concerningFindings.map((finding) => (
              <FindingCard key={finding.key} finding={finding} />
            ))}
          </div>
        </div>
      )}

      {healthyFindings.length > 0 && concerningFindings.length === 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-brand-primary text-center mb-4">見られた所見</h3>
          <div className="space-y-4">
            {healthyFindings.map((finding) => (
              <FindingCard key={finding.key} finding={finding} />
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-left">
        <h3 className="text-xl font-bold text-brand-primary mb-3">次のステップ</h3>
        <p className="text-slate-600 mb-4">
          今回の結果は、撮影時の光の加減や体調によっても変わることがあります。より正確な状態を把握するために、以下のことをお勧めします。
        </p>
        <ul className="list-disc list-inside space-y-3 text-slate-700">
          <li>
            <strong>再撮影を試す：</strong>
            <span className="text-sm">数日後に、改めて撮影のポイントを守って再度チェックしてみてください。体調の良い日中に撮影するのがおすすめです。</span>
          </li>
          <li>
            <strong>専門家への相談：</strong>
            <span className="text-sm">もし再撮影しても同様の結果が表示される場合や、自覚症状がありご不安な場合は、速やかに医師や歯科医師へ相談しましょう。</span>
          </li>
        </ul>
      </div>

      {isShareCardEnabled && (
        <div className="mt-8 bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 text-center animate-fade-in transition-all">
          <p className="text-sm font-bold text-slate-700 mb-4">今日の記録をSNSでシェアしてみよう 📢</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={handleShareCard}
              className="flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 shadow-sm transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              画像を保存
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 bg-white text-slate-700 font-bold py-3 px-6 rounded-xl border border-slate-300 hover:bg-slate-50 shadow-sm transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              リンクコピー
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 text-center space-y-4 font-sans">
        {result.savedId && (
          <div className="text-xs text-slate-400 mb-2">
            履歴ID: {result.savedId}
          </div>
        )}
        {onOpenDictionary && (
          <button
            onClick={onOpenDictionary}
            className="text-brand-primary underline text-sm hover:opacity-80"
          >
            他の所見の例を見る（舌所見図鑑）
          </button>
        )}
        <div className="pt-2">
          <button
            onClick={onRestart}
            className="bg-slate-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            もう一度診断する
          </button>
          {typeof window !== 'undefined' && localStorage.getItem('FF_CAPTURE_GUIDE_V2') === '1' && (
            <p className="mt-3 text-[11px] text-slate-500 font-medium">📸 撮影ガイドは撮影画面で自動的に表示されます</p>
          )}
        </div>

        {import.meta.env.DEV && isDebugPanelOpen && (
          <>
            <div className="mt-10 p-4 bg-slate-100/50 border border-slate-200 rounded text-[9px] font-mono text-slate-400 text-left">
              <div className="font-bold border-b border-slate-200 mb-2 pb-1 text-slate-500 uppercase tracking-widest flex justify-between">
                <span>TECHNICAL DEBUG SUMMARY (DEV ONLY)</span>
                {localStorage.getItem("DUMMY_TONGUE") === "true" && <span className="text-red-500 font-black animate-pulse">DUMMY MODE ACTIVE</span>}
              </div>
              <div className="grid grid-cols-2 gap-y-1">
                <div>guard.level: <span className="text-slate-600 font-bold">{v2?.guard.level ?? "N/A"}</span></div>
                <div>top1_id: <span className="text-slate-600 font-bold">{v2?.diagnosis.top1_id || "null"}</span></div>
                <div>top3_ids: <span className="text-slate-600 font-bold">{JSON.stringify(v2?.diagnosis.top3_ids || [])}</span></div>
                <div>top1_score: <span className="text-slate-600 font-bold">{result.top3?.[0]?.score || "N/A"}</span></div>
                <div>mix: <span className="text-slate-600 font-bold">{v2?.guard.mix || "N/A"}</span></div>
                <div>version: <span className="text-slate-600 font-bold">{v2?.output_version || "LEGACY"}</span></div>
              </div>
            </div>

            {result.savedId && (
              <DoctorReviewForm analysisId={result.savedId} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResultsScreen;