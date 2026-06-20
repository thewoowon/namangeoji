import type { CategoryCode, IndexLevel } from "./types";

/** spec §6.1.4 / §17.4 — 점수 → 레벨 매핑 */
export function scoreToLevel(score: number): IndexLevel {
  if (score >= 85) return "OVERHEATED";
  if (score >= 65) return "ANXIOUS";
  if (score >= 45) return "CAUTION";
  if (score >= 25) return "WATCH";
  return "STABLE";
}

/** Satori/OG·인라인 스타일용 실제 hex (CSS var 미해석 환경) */
export const LEVEL_HEX: Record<IndexLevel, string> = {
  STABLE: "#3ba776",
  WATCH: "#6fb84a",
  CAUTION: "#e0b13a",
  ANXIOUS: "#e8843c",
  OVERHEATED: "#e6483d",
};

export const LEVEL_META: Record<
  IndexLevel,
  { label: string; colorVar: string; tone: string }
> = {
  STABLE: { label: "안정", colorVar: "var(--status-stable)", tone: "오늘은 비교적 잔잔합니다." },
  WATCH: { label: "관심", colorVar: "var(--status-watch)", tone: "일부 키워드가 움직이기 시작했습니다." },
  CAUTION: { label: "주의", colorVar: "var(--status-caution)", tone: "생활형 불안 신호가 눈에 띕니다." },
  ANXIOUS: { label: "불안", colorVar: "var(--status-anxious)", tone: "나만 뒤처짐 압력이 강합니다." },
  OVERHEATED: {
    label: "과열",
    colorVar: "var(--status-overheated)",
    tone: "FOMO가 과열권입니다. 숫자보다 감정이 앞설 수 있습니다.",
  },
};

/** spec §8.1.5 — 신뢰도 표시 */
export function confidenceLabel(c: number): { label: string; colorVar: string } {
  if (c >= 80) return { label: "신뢰도 높음", colorVar: "var(--confidence-high)" };
  if (c >= 60) return { label: "신뢰도 보통", colorVar: "var(--confidence-mid)" };
  if (c >= 40) return { label: "신뢰도 낮음", colorVar: "var(--confidence-low)" };
  return { label: "참고용", colorVar: "var(--confidence-low)" };
}

export const CATEGORY_META: Record<CategoryCode, { name: string; short: string }> = {
  ASSET: { name: "자산 FOMO", short: "자산" },
  HOUSING: { name: "주거 불안", short: "주거" },
  WORK_INCOME: { name: "일·소득 불안", short: "일·소득" },
  LIVING_COST: { name: "생활비 불안", short: "생활비" },
  RETIREMENT: { name: "노후 불안", short: "노후" },
  TECHNOLOGY: { name: "기술 대체 불안", short: "기술" },
  SOCIAL_MOBILITY: { name: "계층이동 불안", short: "계층" },
};
