/**
 * prodGuard.ts — 本番環境判定を一元管理するユーティリティ
 * 
 * 本番判定条件:
 *   - window.location.hostname === "z-26.vercel.app"
 *   - pathname が "/app" 配下
 * 
 * 本番では以下を強制無効:
 *   - ?debug=1 の効果
 *   - localStorage の FORCE_PRO, MOCK_AI, DUMMY_TONGUE 等
 *   - DEV専用UI表示
 * 
 * 復元は import.meta.env.DEV (ローカル開発) のみで許可
 */

/** 本番アプリかどうか（z-26.vercel.app/app 配下） */
export function isProdApp(): boolean {
    if (typeof window === 'undefined') return false;
    const { hostname, pathname } = window.location;
    // Vercel本番ドメイン + /app 配下
    const isProd = hostname === 'z-26.vercel.app' && pathname.startsWith('/app');
    return isProd;
}

/** DEVツール表示を許可するか */
export function isDevToolsAllowed(): boolean {
    // ローカル開発環境のみ許可
    if (import.meta.env.DEV) return true;
    // 本番では絶対に不許可（?debug=1 も無効化）
    return false;
}

/** DEV系のlocalStorageフラグを全て消去 */
export function purgeDevFlags(): void {
    const DEV_FLAGS = [
        'FORCE_PRO',
        'DUMMY_TONGUE',
        'MOCK_AI',
        'DEBUG_AUTO_TEST',
        'DUMMY_PRESET',
        'IS_ADMIN',
    ];
    DEV_FLAGS.forEach(key => localStorage.removeItem(key));
}
