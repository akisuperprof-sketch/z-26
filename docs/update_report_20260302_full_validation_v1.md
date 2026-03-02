# Z-26 Phase1 フルバリデーション報告書

## 1. 実行環境情報

- **Date**: 2026-03-02
- **Node.js**: v24.2.0
- **npm**: 11.5.2
- **Git Commit Hash**: `d8bdc8d39679b584a360c45d718cbda8ef583ac1`

## 2. 自動テスト結果 (test:all)

テストは全て**PASS (Exit 0)** で完了しています。

### Regression (SSOT)
```text
✓ tests/regression/ssot.test.ts (3 tests) 4ms
Test Files  1 passed (1)
Tests  3 passed (3)
```

### Unit
```text
✓ tests/unit/shareCard.test.ts (2 tests) 4ms
✓ tests/unit/streak.test.ts (6 tests) 6ms
Test Files  2 passed (2)
Tests  8 passed (8)
```

### E2E (Playwright)
```text
Running 10 tests using 4 workers
✓ [chromium] › tests/e2e/diagnosticFlow.spec.ts:44:5 › should protect admin routes from unauthorized access
✓ [chromium] › tests/e2e/diagnosticFlow.spec.ts:52:5 › should complete diagnostic flow even if quality module is bypassed/fails
✓ [chromium] › tests/e2e/diagnosticFlow.spec.ts:37:5 › should enforce Noto Sans JP font family
✓ [chromium] › tests/e2e/diagnosticFlow.spec.ts:6:5 › should complete baseline diagnostic flow successfully
✓ [chromium] › tests/e2e/diagnosticFlow.spec.ts:70:5 › should show DUMMY badge when DUMMY_TONGUE is active in DEV
✓ [chromium] › tests/e2e/shareCard.spec.ts:29:5 › should NOT show share buttons when flag is OFF
✓ [chromium] › tests/e2e/shareCard.spec.ts:53:5 › should show share buttons when flag is ON and handle click
✓ [chromium] › tests/e2e/streak.spec.ts:6:5 › should NOT show streak badge when flag is OFF
✓ [chromium] › tests/e2e/streak.spec.ts:23:5 › should show streak badge when flag is ON
✓ [chromium] › tests/e2e/streak.spec.ts:40:5 › should update streak and show celebration on Results screen

10 passed (8.5s)
```

## 3. 主要機能の有無チェック

| 機能項目 | 確認結果 | 備考 |
| :--- | :---: | :--- |
| Feature Flag default OFF | OK | 新機能はフラグ未設定時に完全に不可視であることを確認 |
| Header Streak表示 | OK | フラグON時、Streak>0で正確に表示 |
| Result Streak祝福表示 | OK | 3/7/30日到達時の祝福メッセージ表示を確認 |
| ShareCard生成 (画像保存) | OK | キャンバス生成およびDLトリガー成功を確認 |
| Share Link コピー | OK | クリップボード書き込み成功を確認 |

## 4. 手動スモークテスト結果

DEV環境において手動（およびE2Eテスト補完）による以下の重要項目の検証を完了しました。

| テストID | 検証項目 | 確認結果 | 状態 |
| :--- | :--- | :--- | :---: |
| **B-1** | **FF default OFF確認**<br> localStorageフラグなしで起動 | UIにStreakコンポーネント、Shareボタンが一切レンダリングされないことを確認 | ✅ OK |
| **B-2** | **FF ON時挙動確認**<br> localStorage手動ON | ヘッダーに小さくStreak表示、結果画面に連続記録の表示。画像保存/リンクコピーアクションがエラーなく実行される | ✅ OK |
| **B-3** | **診断フロー完走** | 初期画面〜ヒアリング〜解析結果画面へ到達。結果に「タイプ名＆ケア表現」表示確認。医療断定語（診断/治療）は排除済 | ✅ OK |
| **B-4** | **ブランド適用目視確認** | Light/Proの背景切り替え確認。ボタンのブランドカラー（Primary:ダークネイビー、CTA:朱色）統一確認。フォント崩れなし | ✅ OK |
| **B-5** | **Adminダッシュボード(最低限)** | `/admin/report` へのアクセス。Role絞り込み動作OK。DB未適用時は警告文が出てUIブロックしないフェイルセーフ確認 | ✅ OK |

## 5. Feature Flag一覧とDefault状態

| Flag Key | 用途 | Default | 実装状況 |
| :--- | :--- | :---: | :--- |
| `FF_STREAK_V1` | 継続日数のカウントおよびUI表示の有効化 | OFF | 実装済（localStorage基盤） |
| `FF_SHARE_CARD_V1` | 分析結果画面での結果シェア画像の生成機能 | OFF | 実装済 |

## 6. Migration一覧（DB追加適用待ち）

今回はDB変更は行っていませんが、今後本番または外部DBへ反映する際に必要なクエリ一覧と影響範囲です。

**対象のスキーマ追加（`analyses` テーブル等）:**
```sql
-- Roleと画像品質指標の追加
ALTER TABLE analyses ADD COLUMN user_role TEXT DEFAULT 'GUEST';
ALTER TABLE analyses ADD COLUMN img_blur_score REAL;
ALTER TABLE analyses ADD COLUMN img_brightness_mean REAL;
ALTER TABLE analyses ADD COLUMN img_saturation_mean REAL;
ALTER TABLE analyses ADD COLUMN quality_feedback_flag BOOLEAN DEFAULT FALSE;
```
*影響範囲*: 解析の永続化、およびAdminレポート（品質分析ダッシュボード）にて集計に利用されます。

## 7. 不変領域遵守の根拠

本検証において、以下のコア要件が守られていることを保証します。
- **`coreEngine.ts`**: コミット差分なし。一切変更していません。
- **SSOT (`output_payload`)**: 回帰テスト（Snapshotテスト）が完全に一致しており、出力構造は保たれています。
- **PRODガード**: `App.tsx` 等のDEV判定ロジックは無効化・削除しておらず維持されています。
- **非破壊実装**: これまでの機能拡張はすべてFeature Flag、CSS変数の導入、または外部ユーティリティ（`shareCard.ts`等）に閉じ込められており、既存E2Eを壊すことなく追加されました。

## 8. 残課題と推奨対応順 (Phase1 思想沿い)

| 順位 | タスク | 理由 |
| :---: | :--- | :--- |
| 1 | 本番DBへのカラム反映（Migration実行） | 分析データへの品質スコア蓄積を早期に開始し、画像品質と診断精度の相関データ（研究資産化）を貯めるため。 |
| 2 | Share画像のクリエイティブ検証・微調整 | 「社会的普及」の目的に合致。SNS上での見え方やハッシュタグ（現状未設定）を決めて拡散力を強める。 |
| 3 | 学術/Studentプラン用の専用UIガイド | 「Studentは価格/権限ロジック固定・データ資産対象」の思想に基づき、対象者へ正しい撮影を促す専用ガイドの拡張。 |
| 4 | OGPタグの動的設定の検討 | X(Twitter)でリンクコピーされた際にURLだけで美しいプレビューを出すためのServer側のメタデータ処理。（現状はLP固定） |
| 5 | 画像圧縮・画質計測ロジックの非同期化 | クライアントでの計算が増えているため、メインスレッドをブロックしないようWeb Worker等への逃しを検討。（UX向上のため） |

## 9. Migration適用手順 (Appendix)

Supabase環境（ローカルまたは連携済みリモート）へ最新スキーマを適用するための手順です。

### パターンA: Supabase Dashboardから適用する場合（推奨・安全）
1. Supabase Dashboardを開き、該当プロジェクトの `SQL Editor` にアクセス。
2. 以下の2ファイルをエディタに順次コピペして実行。
   - `supabase/migrations/20260302_add_user_role.sql`
   - `supabase/migrations/20260302_add_image_quality.sql`

### パターンB: Supabase CLIを利用する場合
1. CLIログインを確認 (`npx supabase login`)
2. DBにすべてのローカルマイグレーションをプッシュ
```bash
npx supabase db push
```
*(※エラーが出た場合は `npx supabase db reset` や `npx supabase db pull` 等で環境を同期してください)*
