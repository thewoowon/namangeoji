// 나만거지지수 — 도메인 타입 (spec §7, §12, §14.5)

export type CategoryCode =
  | "ASSET"
  | "HOUSING"
  | "WORK_INCOME"
  | "LIVING_COST"
  | "RETIREMENT"
  | "TECHNOLOGY"
  | "SOCIAL_MOBILITY";

/** spec §6.1.4 상태 구간 (0~24 안정 … 85~100 과열) */
export type IndexLevel =
  | "STABLE"
  | "WATCH"
  | "CAUTION"
  | "ANXIOUS"
  | "OVERHEATED";

export type SignalType =
  | "SEARCH"
  | "NEWS_VOLUME"
  | "NEWS_TONE"
  | "MARKET_PRICE"
  | "MARKET_VOLUME"
  | "OFFICIAL_STAT"
  | "EVENT"
  | "COMMUNITY";

export type EventType =
  | "ASSET_PRICE"
  | "POLICY"
  | "NEWS"
  | "SEARCH_SPIKE"
  | "DISCLOSURE"
  | "REAL_ESTATE"
  | "MACRO";

export type ImpactDirection = "UP" | "DOWN";

export interface Category {
  code: CategoryCode;
  name: string;
  description: string;
}

export interface SeriesPoint {
  /** ISO date (day granularity for mock) */
  observedAt: string;
  score: number;
}

export interface SignalComponent {
  code: string;
  label: string;
  type: SignalType;
  /** 표시용 현재값 문자열 (예: "+6.8%", "143건") */
  currentValue: string;
  /** 기준선 대비 σ */
  zScore: number;
  /** 기여도 0~1 */
  contribution: number;
  /** MVP에서 데이터 미준비 시 true (spec §6.3.4) */
  pending?: boolean;
}

export interface TriggerEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  sourceName?: string;
  sourceUrl?: string;
  occurredAt: string; // ISO
  impactDirection: ImpactDirection;
  /** 영향 받은 지수 slug 목록 */
  relatedIndexSlugs: string[];
  confidence: number;
}

export interface IndexSummary {
  code: string;
  slug: string;
  name: string;
  shortName: string;
  category: CategoryCode;
  score: number;
  level: IndexLevel;
  delta1d: number;
  delta7d: number;
  delta30d: number;
  summary: string;
  confidence: number;
  updatedAt: string;
  sparkline: SeriesPoint[];
  /** 데스크탑 테이블용 주요 트리거 한 줄 */
  primaryTrigger?: string;
}

export interface IndexDetail extends IndexSummary {
  description: string;
  /** 레벨별 한 줄 진단(현재 레벨) */
  headline: string;
  keywords: string[];
  components: SignalComponent[];
  series30d: SeriesPoint[];
  events: TriggerEvent[];
  relatedSlugs: string[];
  dataSources: string[];
  methodologyVersion: string;
  /** 산식 가중치 표시용 */
  weights: { label: string; weight: number }[];
}

export interface CompositeIndex {
  code: string;
  name: string;
  date: string;
  score: number;
  level: IndexLevel;
  delta1d: number;
  delta7d: number;
  confidence: number;
  primaryDriver: string;
  summary: string;
  updatedAt: string;
  sparkline: SeriesPoint[];
}

export interface CategoryScore {
  code: CategoryCode;
  name: string;
  score: number;
  delta1d: number;
}
