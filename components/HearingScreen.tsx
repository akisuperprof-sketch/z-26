import React, { useState } from 'react';
import { HEARING_QUESTIONS, HearingSlider } from './HearingSlider';

interface HearingScreenProps {
  onNext: (hearing: Record<string, number | null>) => void;
  onBack: () => void;
}

const HearingScreen: React.FC<HearingScreenProps> = ({ onNext, onBack }) => {
  const [answers, setAnswers] = useState<Record<string, number | null>>({});

  const handleChange = (id: string, value: number | null) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    // Fill un-answered questions with null
    const finalAnswers: Record<string, number | null> = {};
    HEARING_QUESTIONS.forEach(q => {
      finalAnswers[q.id] = answers[q.id] !== undefined ? answers[q.id] : null;
    });
    onNext(finalAnswers);
  };

  const answeredCount = Object.values(answers).filter(v => v !== null && v !== undefined).length;
  const isComplete = answeredCount === HEARING_QUESTIONS.length;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 animate-fade-in relative max-w-2xl w-full mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">追加のヒアリング</h2>
        <p className="text-sm text-slate-500 mt-2">より正確な証判定のため、現在の体調についてお答えください。<br/>（わからない場合は「わからない」を選択してください）</p>
      </div>

      <div className="h-96 overflow-y-auto mb-6 pr-2 custom-scrollbar">
        {HEARING_QUESTIONS.map(q => (
          <HearingSlider 
            key={q.id} 
            question={q} 
            value={answers[q.id] !== undefined ? answers[q.id] : null} 
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
        <button
          onClick={handleNext}
          className="w-full sm:w-2/3 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 shadow-md relative group overflow-hidden"
        >
          {isComplete ? '次へ進む' : '未回答ありのまま進む'}
          {!isComplete && (
            <div className="absolute inset-0 bg-yellow-400 opacity-20 group-hover:opacity-30 transition-opacity" />
          )}
        </button>
      </div>
      
      {!isComplete && (
        <p className="text-center text-xs text-slate-400 mt-3">未回答の設問はAIの判定対象から除外され、舌画像への比重が高まります。</p>
      )}
    </div>
  );
};

export default HearingScreen;
