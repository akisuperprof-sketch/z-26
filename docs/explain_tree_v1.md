# Explain Tree v1 仕様書
id: `z26_explain_tree_v1`
Build: 2026.03.02.01
Project: z-26

## 1. 目的
「説明ツリー（Explain Tree）」は、AIの推論プロセス（SSOT: Single Source of Truth）を構造化し、非医療表現で可視化する内部検証用ツールです。開発者やアドミンが、診断ロジックの正当性や画質の影響を直感的に確認することを目的とします。

## 2. 絶対遵守事項
- **医療断定の禁止**: 「診断」「治療」「治る」「病気」「処方」などの言葉は一切使用しない。「傾向」「分析」「セルフケア」などに限定。
- **CoreEngineの不変性**: `coreEngine.ts` の算出ロジックは一切変更しない。
- **Feature Flag による保護**: `FF_EXPLAIN_TREE_V1` により、デフォルトでは完全に不可視とする。
- **DEV環境限定**: 本番環境（PROD）では絶対に実行・表示されない。

## 3. データスキーマ (ExplainTreeNode)
将来の拡張性を考慮した固定スキーマ。

```typescript
type ExplainTreeNode = {
  id: string;
  title: string;
  kind: "root" | "section" | "fact" | "note" | "result";
  summary?: string;
  chips?: string[];
  children?: ExplainTreeNode[];
}
```

## 4. 機能
- **Condition Type 表示**: 最上段に大きく「今日のコンディションタイプ（9分類）」を表示。
- **SSOT 核心表示**: Top1 および Top3 の ID をハイライト表示。
- **階層構造**: `details/summary` による折り畳み表示。
- **ポータビリティ**: 単一 HTML ファイルとして出力（Copy/Download 可能）。

## 5. 利用手順
1. `/admin/report` にアクセス。
2. `FF_EXPLAIN_TREE_V1` を localStorage で ON にする。
3. 「ツリー生成・閲覧」ボタンを押下。
4. 別タブで HTML レポートが開く。
