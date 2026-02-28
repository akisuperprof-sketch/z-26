# CHANGELOG

## [v0.2.0] - 2026-02-27

### Added
- **Lite Plan Implementation**: 寒熱スペクトラム解析 (-100 〜 +100) の具体的ロジックを `services/analyzers/lite.ts` に実装。
- **Dynamic Questionnaire**: `UserInfoScreen` にて、開発モード有効時のみ Liteプラン用の追加ヒアリング項目（6項目）を表示する機能を追加。
- **Data Schema Extension**: `DiagnosisResult` および `UserInfo` に Liteプラン用の optional フィールドを追加。

## [v0.1.2] - 2026-02-27
- **DEV3_STANDARD / RUNBOOK**: 開発標準規約と実行手順書を導入。今後の開発における「本番絶対安定」の正本とする。
- **Documentation**: `docs/DEV3_STANDARD.md` および `docs/DEV3_RUNBOOK.md` の作成（本番挙動への影響なし）。

## [v0.1.1] - 2026-02-27
- **Master Lock Mechanism**: 環境変数 `VITE_DEV_FEATURES_MASTER` による二重ロックを導入。本番環境での誤操作による開発機能の有効化を原理的に防止。
- **UI Protection**: マスターロックが有効でない場合、`/dev/settings` 画面での設定変更を無効化し、警告バナーを表示。

## [v0.1.0] - 2026-02-27
- **L/P/A Foundation**: Lite/Pro/Academic プランの基盤構造を導入。
- **Hidden Dev Settings**: `/dev/settings` URLより開発用フラグおよびバージョンの切り替えが可能に。
- **Configuration-driven**: プラン定義 (`plans.json`)、バージョン管理 (`versions.json`)、ヒアリング項目 (`questionnaires/*.json`) の外部化。
- **Analyzer Layering**: 旧ロジックを温存しつつ、新ロジック (`services/analyzers/`) へのルーティング基盤を構築。

### Changed
- `App.tsx`: 開発用隠しルートの追加。
- `services/tongueAnalyzerRouter.ts`: 判定ロジックのルーティング処理を追加。

### Fixed
- なし（機能追加フェーズ）

### Important Note
- **デフォルト挙動の維持**: `DEV_FEATURES` フラグが OFF の場合、既存の本番環境の挙動は一切変更されません。
- **安全性**: 既存の `types.ts` および `package.json` は変更していません。
