
import React from 'react';
import { DiagnosisResult, RiskLevel, UploadedImage } from '../types';
import FindingCard from './FindingCard';

interface ResultsScreenProps {
  result: DiagnosisResult;
  onRestart: () => void;
  uploadedImages: UploadedImage[];
  onOpenDictionary?: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ result, onRestart, uploadedImages, onOpenDictionary }) => {
  const { findings, heatCold } = result;

  const concerningFindings = [...findings].filter(f => f.riskLevel === RiskLevel.Red || f.riskLevel === RiskLevel.Yellow)
    .sort((a, b) => {
      const order = { [RiskLevel.Red]: 0, [RiskLevel.Yellow]: 1, [RiskLevel.Green]: 2 };
      return order[a.riskLevel] - order[b.riskLevel];
    });

  const healthyFindings = findings.filter(f => f.riskLevel === RiskLevel.Green);

  const renderSummaryContent = () => {
    const healthyNames = healthyFindings.map(f => `「${f.name}」`).join('や');

    // Case 1: No findings
    if (findings.length === 0) {
      return (
        <p className="text-slate-600">
          アップロードいただいた画像を拝見しました。全体的に舌の色や形は良好で、特筆すべき懸念点も見当たりませんでした。素晴らしい状態です。引き続きこの調子で健康管理を続けていきましょう。
        </p>
      );
    }

    // Case 2: Both healthy and concerning findings
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

    // Case 3: Only healthy findings
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

    // Case 4: Only concerning findings
    if (concerningFindings.length > 0 && healthyFindings.length === 0) {
      return (
        <p className="text-slate-600">
          アップロードいただいた画像を拝見しました。全体的な舌の色や形から、いくつか注意しておきたい特徴が見られます。不安に思われるかもしれませんが、まずはご自身の状態を正しく把握することが大切です。以下で詳しく見ていきましょう。
        </p>
      );
    }

    return null;
  };


  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">解析結果</h2>
        <p className="text-slate-600 mt-2">これは医学的診断ではありません。あくまで健康管理の参考としてご活用ください。</p>
      </div>

      {/* Heat/Cold Diagnosis Section (shown if data exists) */}
      {heatCold && (
        <div className=" bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <span className="mr-2">🌡️</span> 寒熱バランス判定
          </h3>

          {/* Reference Chart Display - Large */}
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

            {/* Meter Bar */}
            <div className="relative h-4 w-full rounded-full bg-gradient-to-r from-blue-300 via-slate-100 to-red-400 border border-slate-200">
              {/* Balance Markers */}
              <div className="absolute top-0 bottom-0 left-[37.5%] w-[1px] bg-slate-400 opacity-50"></div>
              <div className="absolute top-0 bottom-0 left-[50%] w-[2px] bg-green-500 z-10 opacity-70"></div>
              <div className="absolute top-0 bottom-0 left-[62.5%] w-[1px] bg-slate-400 opacity-50"></div>

              {/* Indicator Dot Only */}
              <div
                className="absolute top-1/2 -mt-2 w-4 h-4 rounded-full bg-slate-800 border-2 border-white shadow-lg transition-all duration-1000 ease-out z-20"
                style={{
                  left: `calc(${((Math.min(Math.max(heatCold.score, -4), 4) + 4) / 8) * 100}% - 8px)`
                }}
              />
            </div>

            {/* Large Score Display */}
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
            <p className="text-sm text-slate-600 leading-relaxed">
              {heatCold.explanation}
            </p>
          </div>
        </div>
      )}

      {/* General Summary Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-8">
        <h3 className="text-xl font-bold text-slate-800 mb-4">総合的な所見</h3>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {uploadedImages.map(img => (
            <div key={img.slot}>
              <img src={img.previewUrl} alt={img.slot} className="rounded-md h-20 w-full object-cover" />
              <p className="text-center text-xs mt-1 text-slate-600">{img.slot}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {renderSummaryContent()}
        </div>
      </div>

      {/* Concerning Findings Section */}
      {concerningFindings.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-slate-800 text-center mb-4">特に注意したい点</h3>
          <div className="space-y-4">
            {concerningFindings.map((finding) => (
              <FindingCard key={finding.key} finding={finding} />
            ))}
          </div>
        </div>
      )}

      {/* Healthy Findings Section (shown only if there are no concerning ones) */}
      {healthyFindings.length > 0 && concerningFindings.length === 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-slate-800 text-center mb-4">見られた所見</h3>
          <div className="space-y-4">
            {healthyFindings.map((finding) => (
              <FindingCard key={finding.key} finding={finding} />
            ))}
          </div>
        </div>
      )}


      {/* Next Steps Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-3">次のステップ</h3>
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


      <div className="mt-8 text-center space-y-4">
        {result.savedId && (
          <div className="text-xs text-slate-400 mb-2">
            履歴ID: {result.savedId}
          </div>
        )}
        {onOpenDictionary && (
          <button
            onClick={onOpenDictionary}
            className="text-blue-600 underline text-sm hover:text-blue-800"
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
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;