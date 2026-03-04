import React, { useState } from 'react';
import { createSession, UserRole } from '../utils/userSession';

interface NicknameSetupProps {
    onComplete: () => void;
}

const ROLES: { value: UserRole; label: string; emoji: string }[] = [
    { value: 'student', label: '学生', emoji: '🎓' },
    { value: 'staff', label: '先生・事務', emoji: '👩‍🏫' },
    { value: 'general', label: '一般', emoji: '👤' },
];

const NicknameSetup: React.FC<NicknameSetupProps> = ({ onComplete }) => {
    const [nickname, setNickname] = useState('');
    const [role, setRole] = useState<UserRole>('general');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        const trimmed = nickname.trim();
        if (!trimmed) {
            setError('ニックネームを入力してください');
            return;
        }
        if (trimmed.length > 12) {
            setError('12文字以内で入力してください');
            return;
        }
        try {
            createSession(trimmed, role);
            onComplete();
        } catch (e) {
            setError('設定に失敗しました');
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-fade-in max-w-md mx-auto">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-brand-primary">はじめまして！</h2>
                <p className="text-sm text-slate-500 mt-1">ニックネームを教えてください</p>
            </div>

            <div className="space-y-5">
                {/* ニックネーム入力 */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        ニックネーム <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => {
                            setNickname(e.target.value);
                            setError('');
                        }}
                        maxLength={12}
                        placeholder="例：たろう"
                        className={`w-full p-3 border rounded-xl text-base font-bold focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all ${error ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                        autoFocus
                    />
                    <div className="flex justify-between mt-1">
                        {error ? (
                            <p className="text-red-500 text-xs font-bold">{error}</p>
                        ) : (
                            <p className="text-slate-400 text-[10px]">1〜12文字（絵文字OK）</p>
                        )}
                        <p className="text-slate-400 text-[10px]">{nickname.trim().length}/12</p>
                    </div>
                </div>

                {/* 役割選択 */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">あなたの立場</label>
                    <div className="grid grid-cols-3 gap-2">
                        {ROLES.map((r) => (
                            <button
                                key={r.value}
                                onClick={() => setRole(r.value)}
                                className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${role === r.value
                                        ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-brand-primary/30'
                                    }`}
                            >
                                <span className="text-lg block mb-0.5">{r.emoji}</span>
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 送信ボタン */}
                <button
                    onClick={handleSubmit}
                    disabled={!nickname.trim()}
                    className="w-full bg-brand-primary text-white font-bold py-3.5 px-6 rounded-2xl hover:opacity-90 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
                >
                    はじめる
                </button>

                <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                    ※ この情報はアプリ内の表示にのみ使用されます。<br />
                    いつでも設定から変更できます。
                </p>
            </div>
        </div>
    );
};

export default NicknameSetup;
