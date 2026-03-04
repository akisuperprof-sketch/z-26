import React, { useState, useEffect } from 'react';
import { getGreeting } from '../utils/userSession';

interface AnalysisScreenProps {
  error?: string | null;
  onRetry?: () => void;
  retryCount?: number;
  isRateLimit?: boolean;
  errorMeta?: { requestId?: string; route?: string; status?: number; sha?: string };
}

const MAX_RETRIES = 3;

const AnalysisScreen: React.FC<AnalysisScreenProps> = ({ error, onRetry, retryCount = 0, isRateLimit = false, errorMeta }) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const isMaxRetries = retryCount >= MAX_RETRIES;
  const greeting = getGreeting();

  useEffect(() => {
    if (error && !isMaxRetries) {
      let waitTime = 0;
      if (isRateLimit) {
        // 429: 15秒 + 0〜5秒のジッター（Thundering Herd対策）
        waitTime = 15 + Math.floor(Math.random() * 6);
      } else {
        // 通常エラー: 2/5/15秒 + 0〜3秒ジッター
        const base = retryCount === 0 ? 2 : retryCount === 1 ? 5 : 15;
        waitTime = base + Math.floor(Math.random() * 4);
      }
      setCountdown(waitTime);
    } else {
      setCountdown(null);
    }
  }, [error, isMaxRetries, isRateLimit, retryCount]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setCountdown(null);
      if (onRetry) onRetry();
      return;
    }
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, onRetry]);

  // === 429 専用UI ===
  if (error && isRateLimit && !isMaxRetries) {
    return (
      <div className="bg-gradient-to-b from-orange-50 to-white p-8 rounded-2xl shadow-sm border border-orange-200 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 flex items-center justify-center bg-orange-100 text-orange-500 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-orange-800 text-center mb-2">現在アクセスが集中しています</h2>
        <p className="text-orange-700 text-center text-sm mb-4 max-w-sm">
          {greeting ? `${greeting}、` : ''}診断AIサーバーが混雑しています。<br />少し待ってから自動再試行します。
        </p>
        <div className="bg-orange-100 rounded-xl px-6 py-3 mb-4">
          <p className="text-2xl font-black text-orange-800 text-center">{countdown ?? '...'}<span className="text-sm font-bold ml-1">秒後に再試行</span></p>
        </div>
        <p className="text-[10px] text-orange-500">試行 {retryCount + 1} / {MAX_RETRIES}</p>
        <button disabled className="mt-4 bg-orange-200 text-orange-400 font-bold py-2 px-6 rounded-lg cursor-not-allowed text-sm">
          カウント中...
        </button>
      </div>
    );
  }

  // === MAX RETRIES: サポート報告 ===
  if (error && isMaxRetries) {
    const subject = encodeURIComponent(`[ZETUSHIN] 解析エラー報告 ${errorMeta?.requestId || ''}`);
    const body = encodeURIComponent(`\nエラー詳細:\n- requestId: ${errorMeta?.requestId || 'N/A'}\n- route: ${errorMeta?.route || 'N/A'}\n- status: ${errorMeta?.status || 'N/A'}\n- sha: ${errorMeta?.sha || 'N/A'}\n- 時刻: ${new Date().toISOString()}\n\n状況:\n${error}\n`);

    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-200 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 flex items-center justify-center bg-red-100 text-red-500 rounded-full mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 text-center mb-2">
          {greeting ? `${greeting}、` : ''}解析に失敗しました
        </h2>
        <p className="text-red-600 text-center max-w-sm font-medium mb-4 text-sm">{error}</p>
        <p className="text-xs text-slate-500 text-center mb-4">再試行回数の上限に達しました（{MAX_RETRIES}回）</p>

        {/* エラー詳細 */}
        {errorMeta && (
          <div className="bg-slate-50 rounded-lg p-3 text-[10px] font-mono text-slate-500 mb-4 w-full max-w-sm">
            {errorMeta.requestId && <p>requestId: {errorMeta.requestId}</p>}
            {errorMeta.route && <p>route: {errorMeta.route}</p>}
            {errorMeta.status && <p>status: {errorMeta.status}</p>}
            {errorMeta.sha && <p>sha: {errorMeta.sha}</p>}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="bg-slate-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-slate-700 transition-colors text-sm"
          >
            もう一度試す
          </button>
          <a
            href={`mailto:support@zetushin.app?subject=${subject}&body=${body}`}
            className="bg-red-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-red-700 transition-colors text-sm inline-flex items-center gap-1"
          >
            サポートに報告
          </a>
        </div>
      </div>
    );
  }

  // === 通常エラー（再試行中） ===
  if (error) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-200 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 flex items-center justify-center bg-red-100 text-red-500 rounded-full mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 text-center mb-2">サーバー接続に失敗しました</h2>
        <p className="text-red-600 text-center max-w-sm font-medium mb-4 text-sm">{error}</p>
        {countdown !== null && (
          <div className="bg-slate-100 rounded-xl px-6 py-3 mb-4">
            <p className="text-lg font-black text-slate-700 text-center">{countdown}<span className="text-xs font-bold ml-1">秒後に自動再試行</span></p>
          </div>
        )}
        <p className="text-[10px] text-slate-500">試行 {retryCount + 1} / {MAX_RETRIES}</p>
        <button disabled={countdown !== null && countdown > 0} onClick={onRetry}
          className="mt-4 bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity text-sm disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {countdown !== null && countdown > 0 ? `${countdown}秒後...` : '再試行する'}
        </button>
      </div>
    );
  }

  // === 解析中（正常） ===
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      <h2 className="text-2xl font-bold text-brand-primary mt-6">
        {greeting ? `${greeting}、` : ''}AIが解析中です...
      </h2>
      <p className="text-slate-600 mt-2 text-center max-w-sm">
        アップロードされた画像を分析しています。結果が表示されるまで、しばらくお待ちください。
      </p>
    </div>
  );
};

export default AnalysisScreen;
