
import React from 'react';

import { AnalysisMode } from '../types';
import { isDevToolsAllowed } from '../utils/prodGuard';
import { getSession } from '../utils/userSession';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    devMode: boolean;
    setDevMode: (enabled: boolean) => void;
    analysisMode?: AnalysisMode;
    setAnalysisMode?: (mode: AnalysisMode) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, devMode, setDevMode, analysisMode, setAnalysisMode }) => {
    if (!isOpen) return null;

    // 本番では DEV 機能を完全に隠蔽（復元可能：isDevToolsAllowed条件を外せば元に戻る）
    const showDevTools = isDevToolsAllowed();
    const session = getSession();

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">設定</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                        &times;
                    </button>
                </div>
                <div className="p-6">
                    {/* === 本番ユーザー向け：アプリ情報・ユーザー情報 === */}
                    {!showDevTools && (
                        <div className="space-y-4">
                            {session && (
                                <div className="flex items-center gap-3 p-3 bg-brand-primary/5 rounded-xl">
                                    <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {session.nickname.slice(0, 1)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{session.nickname}さん</p>
                                        <p className="text-[10px] text-slate-400">
                                            {session.role === 'student' ? '🎓 学生' : session.role === 'staff' ? '👩‍🏫 先生・事務' : '👤 一般'}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div>
                                <p className="font-bold text-slate-800 text-sm">アプリ情報</p>
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                    舌神 -ZETUSHIN- は東洋医学に基づくセルフコンディション観測ツールです。医療診断を行うものではありません。
                                </p>
                            </div>
                            <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-400 space-y-1">
                                <p>• 利用規約・プライバシーポリシー</p>
                                <p>• 研究データは同意がある場合のみ匿名で保存されます</p>
                            </div>
                        </div>
                    )}

                    {/* === DEV限定：開発者ツール一式（復元可能な非表示） === */}
                    {showDevTools && (
                        <>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-800">開発者モード</p>
                                    <p className="text-xs text-slate-500 mt-1">詳細なデバッグ情報を表示したり、<br />実験的な機能を試したりできます。</p>
                                </div>
                                <button
                                    onClick={() => setDevMode(!devMode)}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${devMode ? 'bg-blue-600' : 'bg-slate-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${devMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            {devMode && (
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800 space-y-3">
                                    <div>
                                        <strong>開発者モード有効中:</strong><br />
                                        全ての機能制限が解除され、デバッグログが表示されます。
                                    </div>

                                    {setAnalysisMode && (
                                        <div className="border-t border-yellow-200 pt-3">
                                            <label className="block font-bold mb-1">診断ロジック（実験的）:</label>
                                            <select
                                                value={analysisMode}
                                                onChange={(e) => setAnalysisMode(e.target.value as AnalysisMode)}
                                                className="w-full p-2 rounded border border-yellow-300 bg-white text-slate-700"
                                            >
                                                <option value={AnalysisMode.Standard}>通常モード（標準）</option>
                                                <option value={AnalysisMode.HeatCold}>寒熱スコアリング（開発中）</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="border-t border-yellow-200 pt-3 flex flex-col gap-2">
                                        <button
                                            onClick={() => {
                                                const current = localStorage.getItem('FORCE_PRO') === 'true';
                                                localStorage.setItem('FORCE_PRO', current ? 'false' : 'true');
                                                window.location.reload();
                                            }}
                                            className={`w-full py-2 font-bold rounded transition-colors ${localStorage.getItem('FORCE_PRO') === 'true'
                                                ? 'bg-[#0F1C2E] text-[#2E6F5E] border border-[#2E6F5E]'
                                                : 'bg-[#2E6F5E] text-white hover:bg-[#255a4d]'
                                                }`}
                                        >
                                            {localStorage.getItem('FORCE_PRO') === 'true' ? 'Proモードを解除する' : 'Proでお試し体験する'}
                                        </button>
                                    </div>

                                    <div className="border-t border-yellow-200 pt-3">
                                        <button
                                            onClick={() => {
                                                localStorage.removeItem('MOCK_AI');
                                                window.location.reload();
                                            }}
                                            className="w-full py-2 bg-yellow-600 text-white font-bold rounded hover:bg-yellow-700 transition-colors"
                                        >
                                            MOCKモードをOFFにする
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 text-right">
                    <button onClick={onClose} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                        完了
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
