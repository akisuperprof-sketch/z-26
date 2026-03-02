# Dev Control Center V1 マニュアル
**Version:** 1.0
**Target Environment:** Development (`import.meta.env.DEV` のみ)

## 概要
開発中のZ-26アプリケーションにおいて、増え続けるFeature Flag（FF）やデバッグ用キーの `localStorage` 管理を、開発者がワンクリックで最新状態（推奨セット）に同期できるようにする機能です。これにより、手動でのフラグ設定ミスやテスト漏れを防止します。

## 主な機能
1. **SSoT (Single Source of Truth) 化**:
   - すべての機能フラグやデバッグ変数は `utils/featureFlags.ts` 内の `ALL_FLAGS` 配列にて定義されています。ここに追加されたフラグは、Dev Control Centerから自動で一括セット・クリアの対象となります。
2. **専用UI**:
   - DEV環境専用のボタン（⚙ Dev）が画面右下に表示されます。
   - 表示項目: 
     - 現在のフラグプロファイル状況（例: `FLAGS_LATEST_V1`）
     - 設定されているフラグキーとその現在値
3. **ワンクリックセット (Enable Latest Features)**:
   - 最新推奨のフラグ一覧（各機能の`devDefault`値）を `localStorage` に流し込み、ページをリロードして即時反映します。
   - 自動的に `DEV_FLAGS_PROFILE=FLAGS_LATEST_V1` というバージョンタグが付与されます。
4. **全クリア (Clear All Flags)**:
   - `ALL_FLAGS` で定義されたフラグ群と `DEV_FLAGS_PROFILE` キーをすべて `localStorage` から削除し、クリーンな状態にリセットします。他の作業データには影響しません（安全削除）。

## SSoTに含む主要フラグ
現時点でDev Control CenterでワンクリックON化の対象としている主要フラグです。

- **FF_STREAK_V1**: 継続利用のUI
- **FF_SHARE_CARD_V1**: 改善版ShareCard機能
- **FF_HISTORY_MINI_V1**: 簡易履歴表示
- **FF_CAPTURE_GUIDE_V2**: V2撮影ガイド（枠・UI・判定）
- **FF_EXPLAIN_TREE_V1**: Phase1説明ツリーのデバッグUI生成
- **FF_PHASE1_STORY_V1**: Phase1 一言ストーリー＆継続フック
- **FF_CAPTURE_REWARD_V1**: 撮影成功時のPerfect Capture演出
- **DEBUG_PANEL_OPEN**: 技術用Technical Debug Scoreboard表示
- **DUMMY_TONGUE**: OS権限バイパス・ダミー結果によるカメラ突破

※ `DEBUG_AUTO_TEST` は意図せぬフロー自動進行を防ぐため、デフォルトからは除外しています（手動設定推奨）。

## 制約
- 本機能はフロントエンドのDevビルド限定です。Proビルド時にはバンドル・表示されず完全に隔離されます。 
- SSOT/coreEngine 不変という制約を守るため、出力内容そのものや推論ロジックの破壊は発生しません。
