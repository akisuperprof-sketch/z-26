# Z-26 Supabase RLS & Storage 監査手順 v1

本ドキュメントは、SupabaseのRow Level Security (RLS) およびStorageバケットの公開設定が意図せず無効化、または過剰な権限付与によるデータ漏洩事故を防ぐための監査手順と確認用SQLテンプレートを定義します。

## 1. Storage バケット権限の方針

Z-26アプリケーションにおけるファイルストレージの原則は以下の通りです。

- **`tongue_images` (舌画像など)**: **完全Private (Publicアクセス禁止)**
  - 個人の健康情報・生体情報に直結し得るため、インターネットへ直接公開（Public URLの発行等）してはなりません。
  - バックエンドAPIや認証を介したセキュアな参照のみを許可します。
- **その他のアセット (`public_assets` 等が必要な場合)**: **Public可**
  - アプリ提供用のダミーアイコン、利用規約PDFなど、誰でもアクセス可能な非機密ファイルのみ。

## 2. データベースの RLS (Row Level Security) 監査手順

Supabaseダッシュボードの 「SQL Editor」にアクセスし、以下のSQLを実行して現在のRLS設定状況を確認してください。

### 2.1 RLS有効化状況の確認SQL

すべてのユーザー定義テーブルに対して、RLSが有効化されているかを確認します。
```sql
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```
**判定基準**: `rowsecurity` が全てのテーブル（特に `analyses`, `users`, `doctor_review` 等）で `true` であること。

### 2.2 設定済みRLSポリシーの一覧確認SQL

現在適用されている詳細なポリシーを確認します。
```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public';
```
**判定基準**: 意図しない「全Role（`public`や匿名）に対する無条件の `SELECT`, `INSERT`」など、危険なポリシーが存在しないこと。

## 3. RLSポリシーの推奨設定（テンプレ）

権限付与はホワイトリスト形式とし、必要最小限の操作のみを許可します。

### (例) 利用者本人のみが自身のデータにアクセスできる設定

```sql
-- 1. RLS自体の有効化
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- 2. 個人のデータ参照(SELECT)を許可するポリシー
CREATE POLICY "Users can view own analyses"
ON public.analyses
FOR SELECT
USING ( auth.uid() = user_id );

-- 3. 個人のデータ登録(INSERT)を許可するポリシー
CREATE POLICY "Users can insert own analyses"
ON public.analyses
FOR INSERT
WITH CHECK ( auth.uid() = user_id );
```
*(※Z-26のAPI実装によっては、サーバーサイドのサービスロールキーを利用して直接DB操作する設計になっている場合、個別のユーザー閲覧ポリシーは不要である場合があります。仕様に合わせて調整してください。)*

## 4. 監査証跡（Audit Trail）の記録フォーマット

デプロイ前や定期監査の際、このフォーマットをコピーし、結果を記載して証跡として残してください（GitHub issueや社内Wiki等へ記載）。

```markdown
### 監査実施ログ
- **監査実施日**: 202X-MM-DD
- **実施者**: [名前]
- **対象環境**: Production / Staging

#### 1. Storageバケット確認結果
- [ ] `tongue_images` 等の機密バケットが `Public` になっていないこと（ダッシュボードで確認）
- **確認スクショ**: (ここにスクショやURLを貼る)

#### 2. RLSポリシー確認結果
- [ ] 対象テーブルの `rowsecurity` がすべて `true` であること
- [ ] 意図しないテーブルの `FOR ALL` や `using (true)` ポリシーが存在しないこと
- **確認用SQL実行結果(一部抜粋)**:
  ```
  (ここに実行結果のテキストを貼り付け)
  ```

#### 3. 総合判定
- [ ] **監査 PASS**: セキュリティ上の問題は見当たらないためリリース可能。
- [ ] **監査 FAIL**: 修正が必要なため一時ブロック。
```
