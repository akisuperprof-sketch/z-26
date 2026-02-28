# Google Antigravity 共有パック01（コア仕様固定用）
目的：舌診中心（画像主）＋ヒアリング補正。鍼灸弁証学＋針灸舌診アトラス準拠。Light/Pro/Academicは同一コアで入力粒度だけ変更。

## 1. プラン構造（同一コア）
- Light：bodyColor, coatColor, coatThickness(2段階可), moisture(2段階可)
- Pro：bodyColor, bodyShape(限定), coatColor, coatThickness, coatTexture(膩のみ), region(尖/辺/中/根の主領域)
- Academic：bodyColor, bodyShape(複数), coatColor, coatThickness, coatTexture(詳細), moisture(潤/正常/乾/少津), regionMap(部位差)

## 2. コア出力軸（八綱の最小3軸）
- X：虚実（虚が＋、実が−）
- Y：寒熱（寒が＋、熱が−）
- Z：湿燥（湿が＋、燥が−）
- 最終合成：舌 70%＋ヒアリング 30%

## 3. 舌所見→(X,Y,Z) マッピング（pointは加算、範囲−3〜＋3）
### 3-1 舌質_色（bodyColor）
- 淡：X+2, Y+1, Z0
- 淡紅：X+1, Y0, Z0
- 紅：X-1, Y-2, Z-1
- 絳（深紅）：X-1, Y-3, Z-2
- 紫：X-2, Y0, Z0

### 3-2 舌質_形（bodyShape）※複数選択可（加算）
- 胖大：X+1, Y+1, Z+2
- 歯痕：X+2, Y0, Z+2
- 痩薄：X+2, Y0, Z-1
- 裂紋：X+2, Y-1, Z-3
- 点刺（赤点）：X-1, Y-2, Z0
- 瘀点：X-2, Y0, Z0
- 舌下静脈怒張：X-2, Y0, Z0

### 3-3 舌苔_色（coatColor）
- 白：X0, Y+1, Z+1
- 黄：X-1, Y-2, Z+1
- 灰黒：X-1, Y-2, Z0

### 3-4 舌苔_厚薄（coatThickness）
- 薄：X0, Y0, Z0
- 中：X-1, Y0, Z+1
- 厚：X-2, Y0, Z+2

### 3-5 舌苔_性状（coatTexture）Academic
- 膩：X-2, Y0, Z+3
- 滑：X0, Y+1, Z+2
- 燥：X+1, Y-1, Z-3
- 腐：X-2, Y-1, Z+1（運用は慎重）
- 剥（剥落/地図状）：X+2, Y-1, Z-3
- なし（無苔寄り）：X+2, Y-1, Z-3

### 3-6 津液（moisture）
- 潤：X0, Y+1, Z+2
- 正常：X0, Y0, Z0
- 乾：X+1, Y-1, Z-3
- 少津：X+2, Y-1, Z-3

## 4. 正規化（舌スコア）
- X_raw = ΣpointX
- Y_raw = ΣpointY
- Z_raw = ΣpointZ
- X_tongue = clamp(round(100 * X_raw / 18), -100, +100)
- Y_tongue = clamp(round(100 * Y_raw / 18), -100, +100)
- Z_tongue = clamp(round(100 * Z_raw / 24), -100, +100)

## 5. ヒアリング補正（後で共有パック02で提供）
- X_final = 0.7*X_tongue + 0.3*X_hear
- Y_final = 0.7*Y_tongue + 0.3*Y_hear
- Z_final = 0.7*Z_tongue + 0.3*Z_hear

## 6. 4タイプ分類（閾値±10）
- 虚寒：X_final ≥ +10 かつ Y_final ≥ +10
- 虚熱：X_final ≥ +10 かつ Y_final ≤ -10
- 実寒：X_final ≤ -10 かつ Y_final ≥ +10
- 実熱：X_final ≤ -10 かつ Y_final ≤ -10
- 境界：上記以外は混合（境界）として表示

## 7. 部位ルール（臓腑推定）
- 尖：心・肺
- 辺：肝・胆
- 中：脾・胃
- 根：腎・膀胱・大腸
Academicで部位差入力がある場合：各部位の|pointX|+|pointY|+|pointZ|合計が最大の部位を主領域にする（同点なら苔が厚い部位を優先）。

---
この共有パック01は「コア仕様固定」用。次の共有パック02で、20問ヒアリングJSON、証タグDB、Top3一致度計算を渡す。
