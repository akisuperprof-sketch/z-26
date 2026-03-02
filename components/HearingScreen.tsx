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
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-brand-primary">追加のヒアリング</h2>
        <p className="text-sm text-slate-500 mt-2">より正確な証判定のため、現在の体調についてお答えください。<br />（わからない場合は「わからない」を選択してください）</p>
      </div>

      {validationError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          <p className="font-bold mb-1">未回答の設問があります:</p>
          <p>{validationError.join(', ')}</p>
        </div>
      )}

      <div className="h-96 overflow-y-auto mb-6 pr-2 custom-scrollbar">
        {HEARING_QUESTIONS.map(q => (
          <HearingSlider
            key={q.id}
            question={q}
            value={answers[q.id]}
            onChange={handleChange}
          />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onBack}
          className="w-full sm:w-1/3 bg-white text-slate-700 font-bold py-3 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 shadow-sm"
        >
          戻る
        </button>
        {unansweredCount > 0 && (
          <button
            onClick={handleNext}
            className="w-full sm:w-2/3 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 shadow-sm relative group overflow-hidden transition-opacity"
          >
            未回答ありのまま進む
            <div className="absolute inset-0 bg-yellow-400 opacity-20 group-hover:opacity-30 transition-opacity" />
          </button>
        )}
        {unansweredCount === 0 && (
          <button
            onClick={handleNext}
            className="w-full sm:w-2/3 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 shadow-sm transition-opacity"
          >
            次へ進む
          </button>
        )}
      </div>

      {!isComplete && (
        <p className="text-center text-xs text-slate-400 mt-3">未回答の設問はAIの判定対象から除外され、舌画像への比重が高まります。</p>
      )}
    </div>
  );
};

export default HearingScreen;
