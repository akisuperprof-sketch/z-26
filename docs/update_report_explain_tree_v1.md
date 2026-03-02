# 更新報告書: Explain Tree v1 (Internal Audit Tool)
id: `z26_explain_tree_v1_report`
Build: 2026.03.02.01
Project: z-26

## 1. 目的（既存影響ゼロ・非破壊）
本更新の目的は、AIの推論プロセス（SSOT）を「非医療・構造化」されたツリーとして可視化し、内部確認を容易にすることです。
既存の `coreEngine.ts` や `result_v2.output_payload` 算出ロジック、およびユーザー向けの診断フロー/UIには**一切の変更を加えていません**。

## 2. 実装の主要点
- **`utils/explainTree.ts`**: SSOT（Payload）から階層を抽出する純関数。
- **`utils/explainTreeToHtml.ts`**: 「100点寄せ」の高品質な単一 HTML レポートを生成。
- **`AdminDashboard.tsx`**: 管理画面に「推論構造の可視化」ボタンを追加（DEV + FF_EXPLAIN_TREE_V1 限定）。
- **`App.tsx`**: 解析実行時に最新の Payload を内部デバッグ用に localStorage へ永続化。

## 3. 既存影響ゼロの根拠
1. **CoreEngine 不変**: `src/services/analyzers/coreEngine.ts` は一切変更されていません。
2. **SSOT 不変**: `result_v2.output_payload` 構造は維持されており、算出ロジックへの干渉もありません。
3. **Feature Flag 制御**: `FF_EXPLAIN_TREE_V1` はデフォルトで `OFF` です。
4. **Environment Guard**: ボタン表示、実行、Payload保存は `import.meta.env.DEV` または管理画面でのみ実行可能です。
5. **例外処理**: 全ての生成プロセスは `try-catch` で囲われ、万が一のエラーでも診断全体の流れを止めない `non-blocking` 設計です。

## 4. テスト結果要約
- **Unit**: `getExplainTreeV1` は禁止語を含まず、9分類（Condition Type）と Top1/Top3 を正しく含んでいることを確認。
- **E2E**: FF が `OFF` の時にボタンが出ないこと、`ON` の時にアドミンダッシュボードから生成が可能なことを確認。
- **Regression**: 既存の `npm run test:all` (Unit/Security/E2E) が全 PASS することを確認。

## 5. 次のステップ（Bへの布石）
- 今回定義した `ExplainTreeNode` スキーマを維持したまま、将来的に各分類項目に「寄与理由（Contribution）」ノードを追加することで、スムーズに詳細内訳（Score Breakdown）へと拡張可能です。
