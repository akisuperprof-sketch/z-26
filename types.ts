
export enum AppState {
  Disclaimer,
  UserInfo,
  Uploading,
  Hearing,
  Analyzing,
  Results,
  History,
  Dictionary,
  DevSettings, // 隠し設定画面用（追加）
}

export enum RiskLevel {
  Red = '赤',
  Yellow = '黄',
  Green = '緑',
}

// Initial static definition
export interface Finding {
  key: string;
  name: string;
  condition: string;
  shortDescription: string;
  riskLevel: RiskLevel;
  recommendedAction: string;
  reason: string;
  imageUrl?: string;
}

// Runtime result with AI explanation
export interface FindingResult extends Finding {
  aiExplanation?: string; // Specific reasoning from AI
}

export interface HeatColdResult {
  score: number; // -3 to +4
  label: string; // e.g., "熱（強）", "正常", "寒（軽）"
  explanation: string;
}

export interface LiteResult {
  spectrumValue: number; // -100 (Cold) to +100 (Heat)
  tongueColor: string;
  coatingColor: string;
  advice: string;
}

export interface DiagnosisResult {
  heatCold?: HeatColdResult;
  findings: FindingResult[];
  liteResult?: LiteResult; // Added for Lite Plan
  savedId?: string;
}

export enum AnalysisMode {
  Standard = 'standard',
  HeatCold = 'heat_cold',
}

export enum ImageSlot {
  Front = '正面',
  Left = '左側縁',
  Right = '右側縁',
  Underside = '舌裏',
}

export interface UploadedImage {
  slot: ImageSlot;
  file: File;
  previewUrl: string;
}

export enum Gender {
  Male = '男性',
  Female = '女性',
  Other = 'その他',
}

export interface UserInfo {
  age: number | '';
  gender: Gender | null;
  height: number | '';
  weight: number | '';
  concerns: string;
  answers?: Record<string, any>; // For extra questionnaire answers
}

export interface HistoryRecord {
  id: string; // UUID
  timestamp: number;
  userInfo: UserInfo;
  // findingsKeys: string[]; // Deprecated style
  results: { key: string; explanation?: string }[]; // New style
  images: {
    slot: ImageSlot;
    base64: string;
  }[];
}
