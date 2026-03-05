# Z-26 — LP専用リポジトリ

## ⛔ ドメイン運用ルール（違反は重大事故）

| ドメイン | 用途 | リポ | 更新対象 |
|---------|------|------|---------|
| **z-26.vercel.app** | LP専用 | z-26 | `/lp` ディレクトリのみ |
| **zetu-shin-app.vercel.app** | アプリ専用 | zetu-shinAPP | アプリコード全体 |

### 絶対禁止事項
1. z-26.vercel.app でアプリが動く（/appが200を返す）
2. z-26.vercel.app でAPIが動く（/api/*が200を返す）
3. z-26.vercel.app でアプリ用アセットが配信される
4. zetu-shin-app.vercel.app でLPが表示される

### LP更新ルール
- LP資産は **`/lp`ディレクトリのみ** に配置
- `vercel.json` の `outputDirectory` は `"lp"` 固定
- `buildCommand` は `""` 固定（ビルドなし）
- Viteビルド、Reactビルドは**絶対に実行しない**

### 混線防止の技術的対策
1. `vercel.json`: `outputDirectory: "lp"` → `/lp` 外のファイルは配信されない
2. `.vercelignore`: api/, app/, components/ 等を全除外
3. アプリコードがリポに残っていても、デプロイ対象外

### Vercel Project設定（手動で要設定）
- **Root Directory**: `lp` に設定することを強く推奨
- **Framework Preset**: Other
- **Build Command**: (空)
- **Output Directory**: `.`
