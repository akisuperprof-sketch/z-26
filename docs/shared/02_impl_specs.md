# Google Antigravity 共有パック02（実装仕様一式）
目的：共有パック01のコア仕様に「ヒアリング補正」と「証判定Top3ロジック」を統合し、Light/Pro/Academicで共通エンジンとして動かす。

前提：共有パック01（docs/shared/01_core_specs.md）が絶対基準。ここでは追加仕様のみ定義する。

---

## 0. 用語と軸の再確認（固定）
- X：虚実（虚が＋、実が−）
- Y：寒熱（寒が＋、熱が−）
- Z：湿燥（湿が＋、燥が−）
- 合成：X_final = 0.7*X_tongue + 0.3*X_hear（Y,Zも同様）

---

## 1. ヒアリング（20問）仕様
UI：4択スライダー
- なし: 0
- あり: 1
- とてもあり: 2
- わからない: null（集計から除外）

重要：nullは0扱いにしない。回答母数から除外する。

### 1-1. 質問リスト（日本語・短文）
下のJSONをそのまま実装に使用する。

```json
{
  "scale": [
    {"label":"なし","value":0},
    {"label":"あり","value":1},
    {"label":"とてもあり","value":2},
    {"label":"わからない","value":null}
  ],
  "questions": [
    {"id":"Q01","axis":"V","text":"すぐ疲れる"},
    {"id":"Q02","axis":"V","text":"息切れしやすい／声が小さい"},
    {"id":"Q03","axis":"V","text":"症状が慢性的に続く"},
    {"id":"Q04","axis":"V","text":"寝ても回復しにくい"},
    {"id":"Q05","axis":"V","text":"下垂や漏れがある（尿漏れ・脱肛感など）"},

    {"id":"Q06","axis":"J","text":"症状が急に強く出る"},
    {"id":"Q07","axis":"J","text":"張りや圧迫感が強い"},
    {"id":"Q08","axis":"J","text":"分泌物が多い（痰・鼻水・帯下など）"},
    {"id":"Q09","axis":"J","text":"口臭や便臭が強い"},
    {"id":"Q10","axis":"J","text":"イライラが強く爆発しやすい"},

    {"id":"Q11","axis":"C","text":"冷えやすい"},
    {"id":"Q12","axis":"C","text":"温めると楽になる"},
    {"id":"Q13","axis":"C","text":"冷たい飲食で悪化する"},

    {"id":"Q14","axis":"H","text":"のぼせやすい／顔が赤くなる"},
    {"id":"Q15","axis":"H","text":"口が渇く／冷たい物が欲しい"},
    {"id":"Q16","axis":"H","text":"便や尿が濃い／熱い感じがある"},

    {"id":"Q17","axis":"M","text":"重だるい／むくみやすい"},
    {"id":"Q18","axis":"M","text":"雨や湿気で悪化しやすい"},

    {"id":"Q19","axis":"D","text":"乾燥が気になる（喉・皮膚・便が硬いなど）"},
    {"id":"Q20","axis":"D","text":"寝汗が出る／ほてりがある"}
  ]
}
```

### 1-2. ヒアリング軸スコア（0〜100正規化）
- 各グループの「有効回答数 n」を数える（null除外）
- 各グループの最大点は 2*n
- 0除算回避：n=0の場合はそのグループスコアを 0 とし、合成時に重みを自動調整（後述）

グループ定義
- V（虚）：Q01〜Q05
- J（実）：Q06〜Q10
- C（寒）：Q11〜Q13
- H（熱）：Q14〜Q16
- M（湿）：Q17〜Q18
- D（燥）：Q19〜Q20

計算
- V = 100 * sum(V回答) / (2*nV)
- J = 100 * sum(J回答) / (2*nJ)
- C = 100 * sum(C回答) / (2*nC)
- H = 100 * sum(H回答) / (2*nH)
- M = 100 * sum(M回答) / (2*nM)
- D = 100 * sum(D回答) / (2*nD)

2軸化（-100〜+100）
- X_hear = V - J
- Y_hear = C - H
- Z_hear = M - D

### 1-3. 欠損が多い場合の重み自動調整（推奨）
狙い：ヒアリングがほぼ未回答でも、舌だけで安定して出す

- hear_coverage = 有効回答数合計 / 20
- w_hear = 0.3 * clamp(hear_coverage / 0.6, 0, 1)
  - 60%回答（12問以上）で w_hear=0.3
  - それ未満は線形に下げる
- w_tongue = 1 - w_hear

最終
- X_final = w_tongue*X_tongue + w_hear*X_hear
- Y_final = w_tongue*Y_tongue + w_hear*Y_hear
- Z_final = w_tongue*Z_tongue + w_hear*Z_hear

---

## 2. 4タイプ判定（共有パック01の閾値を使用）
- しきい値 T=10 を使用
- 境界（混合）扱いの条件は共有パック01の通り

---

## 3. 証判定Top3（タグ一致度）ロジック
方針：日本鍼灸運用型。証は細分化しすぎず、舌で拾いやすい範囲に限定。
出力：候補Top3＋一致度（0〜100）＋理由（どの軸が合ったか）

### 3-1. 証タグDB（実装用JSON）
タグの表現
- needX: "V"（虚寄り） / "J"（実寄り） / "0"（中間）
- needY: "C"（寒寄り） / "H"（熱寄り） / "0"
- needZ: "M"（湿寄り） / "D"（燥寄り） / "0"
- region: "tip"|"side"|"center"|"root"|"any"

```json
{
  "patterns":[
    {"id":"P_LUNG_QI_DEF","name":"肺気虚","needX":"V","needY":"0","needZ":"0","region":"tip"},
    {"id":"P_LUNG_YIN_DEF","name":"肺陰虚","needX":"V","needY":"H","needZ":"D","region":"tip"},
    {"id":"P_WIND_COLD_LUNG","name":"風寒犯肺","needX":"J","needY":"C","needZ":"0","region":"tip"},
    {"id":"P_WIND_HEAT_LUNG","name":"風熱犯肺","needX":"J","needY":"H","needZ":"0","region":"tip"},
    {"id":"P_PHLEGM_DAMP_LUNG","name":"痰湿阻肺","needX":"J","needY":"0","needZ":"M","region":"tip"},

    {"id":"P_LI_DAMP_HEAT","name":"大腸湿熱","needX":"J","needY":"H","needZ":"M","region":"root"},
    {"id":"P_LI_FLUID_DEF","name":"大腸津虚","needX":"V","needY":"H","needZ":"D","region":"root"},
    {"id":"P_LI_QI_DEF","name":"大腸気虚","needX":"V","needY":"0","needZ":"0","region":"root"},

    {"id":"P_SPLEEN_QI_DEF","name":"脾気虚","needX":"V","needY":"0","needZ":"M","region":"center"},
    {"id":"P_SPLEEN_YANG_DEF","name":"脾陽虚","needX":"V","needY":"C","needZ":"M","region":"center"},
    {"id":"P_COLD_DAMP_SPLEEN","name":"寒湿困脾","needX":"0","needY":"C","needZ":"M","region":"center"},
    {"id":"P_DAMP_HEAT_SP_ST","name":"脾胃湿熱","needX":"J","needY":"H","needZ":"M","region":"center"},

    {"id":"P_STOMACH_YIN_DEF","name":"胃陰虚","needX":"V","needY":"H","needZ":"D","region":"center"},
    {"id":"P_STOMACH_COLD","name":"胃寒","needX":"0","needY":"C","needZ":"0","region":"center"},
    {"id":"P_STOMACH_HEAT","name":"胃熱","needX":"J","needY":"H","needZ":"D","region":"center"},

    {"id":"P_HEART_QI_DEF","name":"心気虚","needX":"V","needY":"0","needZ":"0","region":"tip"},
    {"id":"P_HEART_BLOOD_DEF","name":"心血虚","needX":"V","needY":"0","needZ":"D","region":"tip"},
    {"id":"P_HEART_YIN_DEF","name":"心陰虚","needX":"V","needY":"H","needZ":"D","region":"tip"},
    {"id":"P_HEART_FIRE","name":"心火亢盛","needX":"J","needY":"H","needZ":"D","region":"tip"},
    {"id":"P_HEART_BLOOD_STASIS","name":"心血瘀","needX":"J","needY":"0","needZ":"0","region":"tip"},

    {"id":"P_SI_HEAT","name":"小腸実熱","needX":"J","needY":"H","needZ":"D","region":"tip"},
    {"id":"P_SI_COLD_DEF","name":"小腸虚寒","needX":"V","needY":"C","needZ":"0","region":"center"},

    {"id":"P_KIDNEY_YANG_DEF","name":"腎陽虚","needX":"V","needY":"C","needZ":"M","region":"root"},
    {"id":"P_KIDNEY_YIN_DEF","name":"腎陰虚","needX":"V","needY":"H","needZ":"D","region":"root"},
    {"id":"P_KIDNEY_ESS_DEF","name":"腎精不足","needX":"V","needY":"0","needZ":"0","region":"root"},
    {"id":"P_KIDNEY_QI_NOT_FIRM","name":"腎気不固","needX":"V","needY":"0","needZ":"0","region":"root"},
    {"id":"P_BLADDER_DAMP_HEAT","name":"膀胱湿熱","needX":"J","needY":"H","needZ":"M","region":"root"},

    {"id":"P_LIVER_QI_STAG","name":"肝気鬱結","needX":"0","needY":"0","needZ":"0","region":"side"},
    {"id":"P_LIVER_FIRE","name":"肝火上炎","needX":"J","needY":"H","needZ":"D","region":"side"},
    {"id":"P_LIVER_YANG_RISING","name":"肝陽上亢","needX":"0","needY":"H","needZ":"D","region":"side"},
    {"id":"P_LIVER_BLOOD_DEF","name":"肝血虚","needX":"V","needY":"0","needZ":"D","region":"side"},
    {"id":"P_LIVER_YIN_DEF","name":"肝陰虚","needX":"V","needY":"H","needZ":"D","region":"side"},
    {"id":"P_LIVER_GB_DAMP_HEAT","name":"肝胆湿熱","needX":"J","needY":"H","needZ":"M","region":"side"},
    {"id":"P_COLD_STAGN_LIVER","name":"寒滞肝脈","needX":"0","needY":"C","needZ":"0","region":"side"}
  ]
}
```

注意：肝気鬱結は八綱タグだけでは決めにくいので、次の3-3の補助ルールを必ず併用。

### 3-2. 一致度スコア（0〜100）
各証ごとに Score を算出し、上位3つを候補にする。

推奨配点（合計100）
- X一致：35
- Y一致：35
- Z一致：20
- 部位一致：10

一致関数
- axisMatch(value, need):
  - need="V":  match = clamp(value / 100, 0, 1)         （valueはX_final。虚ほど＋）
  - need="J":  match = clamp((-value) / 100, 0, 1)      （実ほど−）
  - need="C":  match = clamp(value / 100, 0, 1)         （寒ほど＋）
  - need="H":  match = clamp((-value) / 100, 0, 1)      （熱ほど−）
  - need="M":  match = clamp(value / 100, 0, 1)         （湿ほど＋）
  - need="D":  match = clamp((-value) / 100, 0, 1)      （燥ほど−）
  - need="0":  match = 1 - min(abs(value)/100, 1)       （中間ほど高い）

部位一致
- if pattern.region=="any": 1
- else if inferredRegion==pattern.region: 1
- else: 0

最終
- Score = 35*mX + 35*mY + 20*mZ + 10*mR
出力時は Score を 0〜100 の整数で表示する。

### 3-3. 補助ルール（誤判定を減らす）
肝気鬱結など八綱だけで弱い証を補助する。

- ルールA：肝気鬱結候補を上げる条件
  - Q10（イライラ）>=1 もしくは Q07（張り）>=1
  - かつ region が side（辺）優位
  - かつ X_final が -10〜+10 の範囲（虚実どちらにも寄りすぎない）
  - これを満たす場合、肝気鬱結のScoreに +8（上限100）

- ルールB：心血瘀（瘀血）候補を上げる条件
  - bodyColor が 紫 または bodyShape に 瘀点/舌下静脈怒張 が含まれる
  - 条件を満たす場合、心血瘀のScoreに +12（上限100）

- ルールC：寒湿困脾を上げる条件
  - coatTexture に 膩 または 滑 が含まれる、または coatThickness が 厚
  - かつ Y_final が +10以上（寒寄り）
  - 満たす場合、寒湿困脾のScoreに +8

---

## 4. 期待する最終出力（API/UI共通フォーマット）
```json
{
  "axes": {
    "X_final": 0,
    "Y_final": 0,
    "Z_final": 0,
    "type4": "虚寒|虚熱|実寒|実熱|混合",
    "levels": {"X":0,"Y":0,"Z":0}
  },
  "region": {"primary":"tip|side|center|root","confidence":0},
  "top3": [
    {"id":"...", "name":"...", "score":0, "reasons":["X一致","Y一致","部位一致"]},
    {"id":"...", "name":"...", "score":0, "reasons":["..."]},
    {"id":"...", "name":"...", "score":0, "reasons":["..."]}
  ],
  "inputs": {
    "tongue": {"bodyColor":"", "bodyShape":[], "coatColor":"", "coatThickness":"", "coatTexture":[], "moisture":"", "regionMap":{}},
    "hearing": {"Q01":0}
  }
}
```

---

## 5. 実装順（推奨）
1) ヒアリング20問UIと保存（null除外）
2) X_hear/Y_hear/Z_hear の計算（coverageで重み調整）
3) X_final/Y_final/Z_final の合成
4) inferredRegion の推定（共有パック01）
5) 証タグDBでScore計算→Top3
6) 補助ルールA〜Cで微調整
7) 出力フォーマットに整形

---
この共有パック02は、共有パック01の上にそのまま積み増して実装する。
