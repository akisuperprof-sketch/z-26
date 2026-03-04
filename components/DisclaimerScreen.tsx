
import React, { useState } from 'react';

interface DisclaimerScreenProps {
  onAgree: () => void;
}

const DisclaimerScreen: React.FC<DisclaimerScreenProps> = ({ onAgree }) => {
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [isResearchChecked, setIsResearchChecked] = useState(false);

  const handleAgree = () => {
    // 研究同意をlocalStorageに保存
    localStorage.setItem('RESEARCH_AGREED', isResearchChecked ? 'true' : 'false');
    onAgree();
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-fade-in max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-brand-primary mb-6 text-center">舌診アシスタントへようこそ</h2>

      {/* 使い方＆メカニズム */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6 space-y-4 shadow-sm">
        <div>
          <h3 className="font-bold text-brand-primary mb-2 flex items-center">
            <span className="bg-brand-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 shadow-sm">1</span>
            使い方
          </h3>
          <p className="text-sm text-slate-600 ml-8 leading-relaxed">
            ガイドに従って舌の写真を撮影するだけで、AIが体調の傾向をチェックします。
          </p>
        </div>
        <div>
          <h3 className="font-bold text-brand-primary mb-2 flex items-center">
            <span className="bg-brand-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 shadow-sm">2</span>
            解析の仕組み
          </h3>
          <p className="text-sm text-slate-600 ml-8 leading-relaxed">
            東洋医学の舌診基準を学習したAIが、舌の「色」「形」「苔の状態」をスキャンし、30種類以上の所見データベースと照合します。
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <h3 className="font-bold text-brand-primary mb-3 text-center text-sm">ご利用の前に（免責事項）</h3>
        <div className="bg-white p-4 rounded-lg text-sm text-slate-600 border border-slate-200 mb-4 h-32 overflow-y-auto shadow-sm">
          <p className="mb-4 font-black text-[#B84C3A]">※本アプリは医療診断を行うものではありません。</p>
          <p className="mb-4">このアプリケーションは、舌の画像から考えられる所見を提示し、一般的な健康情報の提供を目的とした「セルフコンディションチェックツール」です。</p>
          <p className="mb-4">医学的なアドバイス、診断、治療の代わりにはなりません。提示結果はあくまで参考情報です。</p>
          <p className="mb-4">健康に関して不安な点がある場合は、本アプリの結果に関わらず、必ず医師にご相談ください。</p>
          <p>緊急の場合は、直ちに救急医療機関に連絡してください。</p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4">
          {/* 利用規約同意 */}
          <div className="flex items-center">
            <input
              id="terms_agree"
              type="checkbox"
              checked={isTermsChecked}
              onChange={() => setIsTermsChecked(!isTermsChecked)}
              className="h-5 w-5 rounded border-slate-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
            />
            <label htmlFor="terms_agree" className="ml-3 text-sm text-slate-700 cursor-pointer select-none font-bold">
              上記の内容を理解し、同意します
            </label>
          </div>

          {/* 研究同意（最短版） */}
          <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100 w-full max-w-md">
            <label htmlFor="research_agree" className="flex items-start gap-3 cursor-pointer">
              <input
                id="research_agree"
                type="checkbox"
                checked={isResearchChecked}
                onChange={() => setIsResearchChecked(!isResearchChecked)}
                className="mt-0.5 h-5 w-5 rounded border-slate-300 text-[#6FC3B2] focus:ring-[#6FC3B2] cursor-pointer flex-shrink-0"
              />
              <span className="text-[12px] text-slate-600 leading-relaxed font-medium">
                研究協力のお願い：撮影した舌画像と回答は、個人が特定できない形に整えて東洋医学研究に活用します。
              </span>
            </label>
            <p className="text-[10px] text-slate-400 mt-2 ml-8">※同意しない場合でも、アプリの通常機能はそのままご利用いただけます。</p>
          </div>
        </div>

        <button
          onClick={handleAgree}
          disabled={!isTermsChecked}
          className="mt-6 w-full bg-brand-primary text-white font-bold py-4 px-6 rounded-2xl hover:opacity-90 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
        >
          同意して診断を始める
        </button>
      </div>
    </div>
  );
};

export default DisclaimerScreen;
