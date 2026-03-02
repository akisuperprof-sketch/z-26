
# システムアップデート報告書 (2026/03/02)

## 概要
本アップデートでは、既存の推論ロジックには一切手を加えず、開発効率の向上、コードの保守性強化、および本番環境へのデバッグ機能漏洩を防ぐ「安全柵」を実装しました。

## 変更ファイル一覧
1.  **[constants/patternGroups.ts](file:///Users/akihironishi/z-26/constants/patternGroups.ts)** (新規): 
    *   陰虚（Yin Deficiency）などの証グループIDを定義。将来のID変更や追加時に1箇所修正すれば全体に反映されるSSoT化。
2.  **[services/analyzers/debugScoreboard.ts](file:///Users/akihironishi/z-26/services/analyzers/debugScoreboard.ts)**:
    *   `coreEngine.ts` の純粋性を守るため、デバッグ用スコア計算ロジックを分離。DEV環境限定で全パターンのスコアを可視化。
3.  **[services/analyzers/coreEngine.ts](file:///Users/akihironishi/z-26/services/analyzers/coreEngine.ts)**:
    *   不必要な `export` を削除し、公開APIを最小化（不変領域の制度化）。
4.  **[components/ImageQualityGateScreen.tsx](file:///Users/akihironishi/z-26/components/ImageQualityGateScreen.tsx)**:
    *   NG理由（暗い/明るい/ぼけ）に応じた具体的な再撮影アドバイスを表示。
5.  **[App.tsx](file:///Users/akihironishi/z-26/App.tsx)**:
    *   本番環境（PROD）でのデバッグフラグ自動削除と、万一残っていた場合の解析ボタン強制無効化・警告バナー表示を実装。
    *   BUILDスタンプ（`2026.03.02.01`）を追加。
6.  **[README.md](file:///Users/akihironishi/z-26/README.md)**:
    *   「デプロイ前チェックリスト」を最新のデバッグフラグ構成に合わせて更新。
7.  **[components/ResultsScreen.tsx](file:///Users/akihironishi/z-26/components/ResultsScreen.tsx)**:
    *   SSoT定数を参照するようにStep E判定ロジックを修正。
8.  **[components/DebugPanel.tsx](file:///Users/akihironishi/z-26/components/DebugPanel.tsx)**:
    *   SSoT定数を参照するようにインポートを修正。

## 設計意図
-   **陰虚IDのSSoT化**: 判定条件を分散させず、`constants/patternGroups.ts` に集約。
-   **不変領域の保護**: `coreEngine.ts` は「本番用、変更禁止」とし、`debugScoreboard.ts` は「開発用、コピペOK」として物理的に分離。
-   **ゲート画面強化**: 単にNGを出すだけでなく、具体的な「次に何をすべきか」を示すことで、ユーザーの離脱を防ぐ。
-   **二重防御**: `PROD` 環境ではフラグクリアに加え、ボタンレベルでの無効化を行い、事故を未然に防ぐ。

## ローカル確認手順 (最短3ステップ)
1.  **クイック検証**: デバッグパネルの `🚀 QUICK LV4 TEST (AUTO)` を実行し、結果画面で `✅ STEP E: PASSED` が出ること（Top1が陰虚ID）。
2.  **品質ゲート検証**: `UploadWizard` で暗い画像やわざとぼかした画像をアップし、理由に応じた具体的なアドバイスが表示されること。
3.  **本番安全検証**: 開発ツールの `Application > LocalStorage` で `FORCE_PRO: true` を手動入力した後、擬似的に本番環境（PROD相当）として起動した場合、フラグが消え、解析ボタンが「現在利用できません」となること。

---
**BUILD: 2026.03.02.01**
