
import React, { useState, useCallback } from 'react';
import DisclaimerScreen from './components/DisclaimerScreen';
import UserInfoScreen from './components/UserInfoScreen';
import UploadWizard from './components/UploadWizard';
import HearingScreen from './components/HearingScreen';
import AnalysisScreen from './components/AnalysisScreen';
import ResultsScreen from './components/ResultsScreen';
import HistoryScreen from './components/HistoryScreen';
import FindingsDictionaryScreen from './components/FindingsDictionaryScreen';
import SettingsModal from './components/SettingsModal';
import { AnalysisMode, AppState, DiagnosisResult, FindingResult, UploadedImage, UserInfo, Gender } from './types';
import { routeTongueAnalysis } from './services/tongueAnalyzerRouter';
import { saveHistory, getHistoryItem, reconstructFindings, reconstructImages, saveLastUserInfo } from './services/historyService';
import DevSettingsScreen from './components/DevSettingsScreen';
import { isDevEnabled } from './utils/devFlags';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.Disclaimer);
  const [analysisResult, setAnalysisResult] = useState<DiagnosisResult | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Settings & Dev Mode
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [devMode, setDevMode] = useState(isDevEnabled());
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>(AnalysisMode.Standard);

  // ... (Settings & Dev Mode states are above)

  const handleAgree = useCallback(() => {
    setAppState(AppState.UserInfo);
  }, []);

  const handleUserInfoSubmit = useCallback((info: UserInfo) => {
    setUserInfo(info);
    setAppState(AppState.Uploading);
  }, []);

  // URL-based Hidden Routing for Dev Settings (/dev/settings)
  React.useEffect(() => {
    const handleLocationCheck = () => {
      if (window.location.pathname === '/dev/settings') {
        setAppState(AppState.DevSettings);
      } else if (window.location.hash === '#dev-settings') {
        // Redirect hash to pathname for unification
        window.history.replaceState(null, '', '/dev/settings');
        setAppState(AppState.DevSettings);
      }
    };
    window.addEventListener('popstate', handleLocationCheck);
    window.addEventListener('hashchange', handleLocationCheck);
    handleLocationCheck(); // Check on init
    return () => {
      window.removeEventListener('popstate', handleLocationCheck);
      window.removeEventListener('hashchange', handleLocationCheck);
    };
  }, []);

  // History Handlers
  const handleHistoryClick = useCallback(() => {
    setAppState(AppState.History);
  }, []);

  const handleHistoryBack = useCallback(() => {
    if (userInfo) {
      setAppState(AppState.Uploading);
    } else {
      setAppState(AppState.UserInfo);
    }
  }, [userInfo]);

  const handleSelectHistory = useCallback(async (id: string) => {
    try {
      const record = await getHistoryItem(id);
      if (record) {
        const findings = reconstructFindings(record.results);
        const images = reconstructImages(record.images);

        // Adapt old history to new result structure (missing heatCold is fine)
        const result: DiagnosisResult = { findings };

        setUserInfo(record.userInfo);
        setAnalysisResult(result);
        setUploadedImages(images);
        setAppState(AppState.Results);
      }
    } catch (error) {
      console.error("Failed to load history item:", error);
      alert("履歴データの読み込みに失敗しました。");
    }
  }, []);

  // Dictionary Handlers
  const handleOpenDictionary = useCallback(() => {
    setAppState(AppState.Dictionary);
  }, []);

  const handleDictionaryBack = useCallback(() => {
    if (analysisResult) { // Check if not null
      setAppState(AppState.Results);
    } else {
      setAppState(AppState.Uploading);
    }
  }, [analysisResult]);

  const handleStartAnalysis = useCallback(async (images: UploadedImage[]) => {
    setUploadedImages(images);
    setAppState(AppState.Hearing);
  }, []);

  const handleHearingNext = useCallback(async (hearingAnswers: Record<string, number | null>) => {
    setAppState(AppState.Analyzing);

    try {
      setAnalysisError(null);
      const files = uploadedImages.map(img => img.file);
      const currentMode = isDevEnabled() ? analysisMode : AnalysisMode.Standard;

      // In the real integration we would send hearingAnswers to the analyzer.
      // Currently routeTongueAnalysis only takes files and userInfo.
      // E.g., const result = await routeTongueAnalysis(files, userInfo, currentMode, hearingAnswers);
      const result = await routeTongueAnalysis(files, userInfo, currentMode);

      // Store hearing answers in the result state or user info for history if needed.
      if (userInfo) {
        userInfo.answers = { ...userInfo.answers, hearing: hearingAnswers };
      }

      setAnalysisResult(result);
      setAppState(AppState.Results);

      if (userInfo) {
        saveHistory(userInfo, result.findings, uploadedImages).catch(err => console.error("History save failed:", err));
        saveLastUserInfo(userInfo).catch(err => console.error("Last User Info save failed:", err));
      }

    } catch (error) {
      console.error("Analysis failed:", error);
      const errorMessage = error instanceof Error ? error.message : "不明なエラー";
      setAnalysisError(errorMessage);
    }
  }, [uploadedImages, userInfo, analysisMode]);

  const handleRestart = useCallback(() => {
    setAnalysisResult(null);
    setUploadedImages([]);
    setAppState(AppState.Uploading);
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.Disclaimer:
        return <DisclaimerScreen onAgree={handleAgree} />;
      case AppState.UserInfo:
        return <UserInfoScreen onNext={handleUserInfoSubmit} />;
      case AppState.Uploading:
        return <UploadWizard onStartAnalysis={handleStartAnalysis} devMode={devMode} />;
      case AppState.Hearing:
        return <HearingScreen onNext={handleHearingNext} onBack={() => setAppState(AppState.Uploading)} />;
      case AppState.Analyzing:
        return (
          <AnalysisScreen
            error={analysisError}
            onRetry={() => handleStartAnalysis(uploadedImages)}
          />
        );
      case AppState.Results:
        return analysisResult ? (
          <ResultsScreen
            result={analysisResult}
            onRestart={handleRestart}
            uploadedImages={uploadedImages}
            onOpenDictionary={handleOpenDictionary}
          />
        ) : null;
      case AppState.History:
        return <HistoryScreen onSelectHistory={handleSelectHistory} onBack={handleHistoryBack} />;
      case AppState.Dictionary:
        return <FindingsDictionaryScreen onBack={handleDictionaryBack} devMode={devMode} />;
      case AppState.DevSettings:
        return (
          <DevSettingsScreen
            onBack={() => {
              setDevMode(isDevEnabled()); // Sync local state after returning
              setAppState(AppState.Disclaimer);
            }}
          />
        );
      default:
        return <DisclaimerScreen onAgree={handleAgree} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-4xl mb-6 flex items-center justify-between">
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 tracking-tight">舌診アシスタント2025</h1>
          <p className="text-xs text-slate-500 hidden sm:block">Tongue Diagnosis Assistant {isDevEnabled() && <span className="text-orange-500 font-bold">[Dev Mode: {analysisMode === AnalysisMode.HeatCold ? '寒熱' : '通常'}]</span>}</p>
        </div>

        {/* Buttons Group */}
        {appState !== AppState.Disclaimer && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleHistoryClick}
              className="flex flex-col items-center p-2 text-blue-600 bg-white border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
              title="履歴"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[10px] font-bold mt-1">履歴</span>
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex flex-col items-center p-2 text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              title="設定"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[10px] font-bold mt-1">設定</span>
            </button>
          </div>
        )}
      </header>

      <main className="w-full max-w-4xl z-10 flex-1 relative">
        {isDevEnabled() && (
          <div className="absolute -top-4 right-0 text-[10px] text-orange-500 font-mono bg-orange-100 px-2 py-1 rounded">DevMode: ON ({analysisMode === AnalysisMode.HeatCold ? 'Heat/Cold' : 'Std'})</div>
        )}
        {renderContent()}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        devMode={devMode}
        setDevMode={setDevMode}
        analysisMode={analysisMode}
        setAnalysisMode={setAnalysisMode}
      />

      <footer className="w-full max-w-4xl mt-8 pb-4 text-center text-xs text-slate-500">
        <p>本アプリは医療的な診断、治療、または助言を提供するものではありません。健康上の問題については、必ず医師または他の適切な医療従事者にご相談ください。</p>
        <p className="mt-2 opacity-50">v1.2.0 {devMode ? '(Development Build)' : ''}</p>
      </footer>
    </div>
  );
};

export default App;
