# Explain Tree v1 仕様書
id: `z26_explain_tree_v1`
Build: 2026.03.02.01

## 1. 目的
「説明ツリー（Explain Tree）」は、AIの推論プロセス（SSOT: Single Source of Truth）を人間が読み解けるツリー状の構造に変換し、内部的な整合性確認や将来的な「根拠の言語化」の基盤とするための内部ツールです。

## 2. 絶対遵守事項
- **医療断定の禁止**: 「診断」「治療」「治る」「病気」などの言葉は一切使用しない。
- **CoreEngineの不変性**: `coreEngine.ts` や判定ロジック、SSOTの算出式には一切手を加えない。本ツールは「表示・観測レイヤー」のみを担当する。
- **Feature Flag による保護**: `FF_EXPLAIN_TREE_V1` により、デフォルトでは完全に不可視とする。
- **DEV環境限定**: 本番環境（PROD）では絶対に実行・表示されないガードを設ける。

## 3. データスキーマ (ExplainTreeNode)
将来の「スコア内訳（Score Breakdown）」への拡張性を考慮した固定スキーマを採用する。

```typescript
type ExplainTreeNode = {
  id: string;        // ノードの一意なID
  title: string;     // 表示見出し
  kind: "root" | "section" | "fact" | "note" | "result";
  summary?: string;  // 概要テキスト
  chips?: string[];  // 属性タグ（例：["舌状況", "回答傾向"]）
  children?: ExplainTreeNode[];
}
```

## 4. 生成される成果物
1. **Explain Tree (JSON)**: `utils/explainTree.ts` で生成。
2. **Markdown / Mermaid**: `utils/explainTreeToMarkdown.ts` で生成。技術的なレポート用。
3. **HTML**: `utils/explainTreeToHtml.ts` で生成。ローカル閲覧・共有用。

## 5. 運用フロー
1. 開発者またはアドミンが、解析後に `/admin/report` 等の管理画面へ移動。
2. `FF_EXPLAIN_TREE_V1` を有効化。
3. 画面上の「Explain Tree（Internal）」ボタンを押下。
4. 最新の解析結果に基づき、Mermaidを含む Markdown や HTML が生成・表示される。
