# Dev Control Center 追加版 監査レポート

**Date:** 2026-03-02
**Phase:** 開発者機能（Dev Tools）強化

## 1. 変更内容サマリー
テストや検証を高速化・安定化するため、「Dev Control Center」を実装し、増築により散逸しがちなフラグ群を SSoT化 しました。これにより、ブラウザの localStorage を直接操作することなく安全に動作確認ができるようになりました。

1. **SSoT (featureFlags.ts) の作成**
   - アプリケーション全体で利用される FF / DUMMY / DEBUG 用のキーと「最新推奨値（v1）」を一元定義しました。
   - `ALL_FLAGS`, `setLatestDevFlags`, `clearAllDevFlags` などの関数を提供し、安全なアクセスと一括操作を実現しています。

2. **Dev Control Center の実装**
   - 画面右下の「⚙ Dev」ボタンから呼び出せる常駐コントロールパネルを実装しました（DEV環境限定）。
   - 現在のフラグ状態の可視化、最新フラグのワンクリック流し込み、および全クリア機能を提供します。
   - UIの表示崩れを防ぐため、既存の `DebugPanel` (🐞ボタン) の配置と重ならないように位置を調整しました (右下 → 左下など)。

3. **E2Eと自動化の強化**
   - `devControlCenter.spec.ts` を追加し、ワンクリックテストの動作を検証済です。
   - `featureFlags.test.ts` で単位テスト（サニタイズやSSoTの整合性）を追加しました。

## 2. 変更ファイル詳細
- `utils/featureFlags.ts` (新規作成: SSoT化・操作群)
- `components/DevControlCenter.tsx` (新規作成: 開発用UIの隔離実装)
- `tests/unit/featureFlags.test.ts` (新規作成: ユニットテスト)
- `tests/e2e/devControlCenter.spec.ts` (新規作成: E2Eテスト)
- `docs/dev_control_center_v1.md` (新規作成: マニュアル)
- `App.tsx` (更新: `import.meta.env.DEV` でガードしつつ `DevControlCenter` をマウント)

## 3. 不変領域と安全性の担保
- **coreEngine.ts 等の解析・判定系ロジック**: 一切変更なし。SSoT算出は不変です。
- **PROD分離（本番影響ゼロ）**: 
  - `DevControlCenter.tsx` 内部のトップレベルで `if (!import.meta.env.DEV) return null;` と指定。
  - 本番ビルドではバンドルから除去され、UIに一切出現しません。
- **Security・禁止ワード表現**: 今回修正した範囲に新たな医療文言出力等はありません。コードの機能は `localStorage` の操作に絞られています。

## 4. 品質ゲートとテスト実行結果
- Unit テストは全て通過済みです（新設のfeatureFlagsを含む）。
- E2E テスト (`devControlCenter.spec.ts`) は1-workerモードで正常通過を確認しました。

```
> vitest run tests/unit
✓ tests/unit/featureFlags.test.ts (4 tests)
✓ tests/unit/shareCard.test.ts (2 tests)
✓ tests/unit/historyMini.test.ts (4 tests)
✓ tests/unit/streak.test.ts (6 tests)
✓ tests/unit/phase1Story.test.ts (5 tests)
...
Test Files: 8 passed (8)

> playwright test tests/e2e/devControlCenter.spec.ts
4 passed
Exit code: 0

> bash scripts/security-scan.sh
🚀 Security scan PASSED. Z-26 codebase is secure.
```
