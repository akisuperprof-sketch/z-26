import React, { useState } from 'react';
import { HEARING_QUESTIONS, HearingSlider } from './HearingSlider';

interface HearingScreenProps {
  onNext: (hearing: Record<string, number | null>) => void;
  onBack: () => void;
}

const HearingScreen: React.FC<HearingScreenProps> = ({ onNext, onBack }) => {
  const [answers, setAnswers] = useState<Partial<Record<string, number>>>({});
  const [validationError, setValidationError] = useState<string[] | null>(null);

  const handleChange = (id: string, value: number) => {
    setValidationError(null);
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  React.useEffect(() => {
    if (import.meta.env.DEV && localStorage.getItem("DEBUG_AUTO_TEST") === "v1") {
      console.warn("🚀 DEBUG_AUTO_TEST: v1 - Auto filling hearing answers...");
      const autoAnswers: Partial<Record<string, number>> = {};
      HEARING_QUESTIONS.forEach(q => {
        autoAnswers[q.id] = 1; // Mild answer for all
      });
      setAnswers(autoAnswers);
      // Delay a bit to show user the fill, then submit
      setTimeout(() => {
        localStorage.removeItem("DEBUG_AUTO_TEST"); // Clear flag
        handleNextInternal(autoAnswers);
      }, 500);
    }
  }, []);

  const handleNextInternal = (currentAnswers: Partial<Record<string, number>>) => {
    const finalAnswers: Record<string, number | null> = {};
    const ALLOWED = new Set([0, 1, 2, 3]);

    HEARING_QUESTIONS.forEach(q => {
      const v = currentAnswers[q.id];
      if (v === undefined) {
        finalAnswers[q.id] = null;
      } else {
        finalAnswers[q.id] = ALLOWED.has(v) ? v : null;
      }
    });

    console.log("Submitting Hearing Answers (AUTO-TEST):", finalAnswers);
    onNext(finalAnswers);
  };

  const handleNext = () => {
    handleNextInternal(answers);
  };

  const answeredCount = HEARING_QUESTIONS.filter(q => answers[q.id] !== undefined).length;
  const unansweredCount = HEARING_QUESTIONS.length - answeredCount;
  const isComplete = unansweredCount === 0;

  console.log("answered:", answeredCount, "unanswered:", unansweredCount);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-fade-in relative max-w-2xl w-full mx-auto">
      {/* Progress Bar Header */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">体調ヒアリング</h2>
          <span className="text-xs font-bold text-brand-primary bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            進捗: {answeredCount} / {HEARING_QUESTIONS.length}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-primary transition-all duration-500 ease-out"
            style={{ width: `${(answeredCount / HEARING_QUESTIONS.length) * 100}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-3 font-medium">※現在の体質バランスをより正確に観測するため、可能な範囲でお答えください。</p>
      </div>

      {validationError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          <p className="font-bold mb-1">未回答の設問があります:</p>
          <p>{validationError.join(', ')}</p>
        </div>
      )}

      <div className="h-96 overflow-y-auto mb-6 pr-2 custom-scrollbar space-y-2" id="hearing-list">
        {HEARING_QUESTIONS.map(q => (
          <HearingSlider
            key={q.id}
            question={q}
            value={answers[q.id]}
            onChange={handleChange}
          />
        ))}
      </div>

      {/* Helper for long lists: jump to next unanswered */}
      {unansweredCount > 0 && answeredCount > 0 && (
        <button
          onClick={() => {
            const nextUnanswered = HEARING_QUESTIONS.find(q => answers[q.id] === undefined);
            if (nextUnanswered) {
              const el = document.getElementById(`q-${nextUnanswered.id}`);
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
          className="w-full mb-6 py-2 border border-dashed border-slate-200 rounded-lg text-[10px] font-bold text-slate-400 hover:bg-slate-50 transition-colors"
        >
          ↓ 未回答の設問へジャンプ
        </button>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onBack}
          className="w-full sm:w-1/3 bg-white text-slate-500 font-bold py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          戻る
        </button>
        {unansweredCount > 0 && (
          <button
            onClick={handleNext}
            className="w-full sm:w-2/3 bg-slate-800 text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 shadow-sm transition-opacity flex items-center justify-center gap-2"
          >
            一部未回答のまま次へ
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        )}
        {unansweredCount === 0 && (
          <button
            onClick={handleNext}
            className="w-full sm:w-2/3 bg-brand-primary text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            解析を開始する
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        )}
      </div>

      {!isComplete && (
        <p className="text-center text-[10px] text-slate-400 mt-4 leading-relaxed font-medium">未回答の項目は、舌画像からの観測データで補完されます。<br />可能な限り回答することで、より多角的な分析結果が得られます。</p>
      )}
    </div>
  );
};

export default HearingScreen;
