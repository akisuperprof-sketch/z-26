<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1LSOrjogEY2GIzTDW15CPVBGxXtumU4Iu

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## ⚠️ 本番デプロイ前の安全装置チェック

本番ビルド（Production Build）を行う前に、以下の項目が正しく設定されていることを必ず確認してください。

- [ ] **FORCE_PROの解除**: `localStorage.getItem("FORCE_PRO")` が `true` になっていないことを確認してください。
- [ ] **DUMMY_TONGUEの解除**: `localStorage.getItem("DUMMY_TONGUE")` が `true` になっていないことを確認してください。
- [ ] **debugScoreboard/logsの確認**: 本番環境で `[V2 SCOREBOARD]` 等のログが出力されないことを確認してください。
- [ ] **MOCK_AIの解除**: `localStorage.getItem("MOCK_AI")` が `true` になっていないことを確認してください。
- [ ] **DEBUG_AUTO_TESTの解除**: 1クリック自動テストが残っていないか確認してください。
- [ ] **DEBUG_MODE = false**: `utils/debugConfig.ts` の `DEBUG_MODE` を `false` に変更してください。
- [ ] **プラン表示の確認**: 本番環境ではプランバッジが控えめな表示（デフォルトのSlate色）になっていることを確認してください。
