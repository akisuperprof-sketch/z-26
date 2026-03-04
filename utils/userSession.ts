/**
 * userSession.ts — L1ログイン（最小識別）のユーティリティ
 * 
 * - anon_id: ランダム生成UUID（localStorageに永続化）
 * - nickname: ユーザーが決めた表示名（1〜12文字、絵文字OK）
 * - role: student / staff / general
 */

const KEY_ANON_ID = 'ZETUSHIN_ANON_ID';
const KEY_NICKNAME = 'ZETUSHIN_NICKNAME';
const KEY_ROLE = 'ZETUSHIN_ROLE';

export type UserRole = 'student' | 'staff' | 'general';

export interface UserSession {
    anonId: string;
    nickname: string;
    role: UserRole;
}

/** Generate a simple UUID v4 */
function generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/** セッションが既にセットアップ済みか */
export function hasSession(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
        localStorage.getItem(KEY_ANON_ID) &&
        localStorage.getItem(KEY_NICKNAME)
    );
}

/** セッション情報を取得 */
export function getSession(): UserSession | null {
    if (!hasSession()) return null;
    return {
        anonId: localStorage.getItem(KEY_ANON_ID)!,
        nickname: localStorage.getItem(KEY_NICKNAME)!,
        role: (localStorage.getItem(KEY_ROLE) as UserRole) || 'general',
    };
}

/** ニックネームを取得（未設定なら空文字列） */
export function getNickname(): string {
    return localStorage.getItem(KEY_NICKNAME) || '';
}

/** 「◯◯さん」形式で取得 */
export function getGreeting(): string {
    const name = getNickname();
    return name ? `${name}さん` : '';
}

/** セッションを作成 */
export function createSession(nickname: string, role: UserRole): UserSession {
    const trimmed = nickname.trim().slice(0, 12);
    if (!trimmed) throw new Error('ニックネームは必須です');

    const anonId = localStorage.getItem(KEY_ANON_ID) || generateId();
    localStorage.setItem(KEY_ANON_ID, anonId);
    localStorage.setItem(KEY_NICKNAME, trimmed);
    localStorage.setItem(KEY_ROLE, role);

    return { anonId, nickname: trimmed, role };
}

/** anon_idを取得（なければ生成） */
export function getAnonId(): string {
    let id = localStorage.getItem(KEY_ANON_ID);
    if (!id) {
        id = generateId();
        localStorage.setItem(KEY_ANON_ID, id);
    }
    return id;
}
