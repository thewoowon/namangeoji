// 관리자 화면용 목업 데이터 (spec §10.3 수집 상태, §16 운영)

export type CollectorRunStatus =
  | "scheduled"
  | "running"
  | "success"
  | "partial_success"
  | "failed"
  | "skipped";

export interface CollectorRun {
  id: string;
  collectorName: string;
  sourceCode: string;
  status: CollectorRunStatus;
  startedAt: string;
  endedAt: string | null;
  recordsFetched: number;
  recordsInserted: number;
  recordsUpdated: number;
  errorMessage: string | null;
  sourceLatencyMs: number;
  apiQuotaRemaining: number | null;
}

const RUNS: CollectorRun[] = [
  {
    id: "run-001",
    collectorName: "naver-datalab-search",
    sourceCode: "NAVER_DATALAB",
    status: "success",
    startedAt: "2026-06-20T09:00:05+09:00",
    endedAt: "2026-06-20T09:00:48+09:00",
    recordsFetched: 1240,
    recordsInserted: 1240,
    recordsUpdated: 0,
    errorMessage: null,
    sourceLatencyMs: 430,
    apiQuotaRemaining: 18600,
  },
  {
    id: "run-002",
    collectorName: "krx-daily-market",
    sourceCode: "KRX",
    status: "success",
    startedAt: "2026-06-20T08:40:00+09:00",
    endedAt: "2026-06-20T08:41:12+09:00",
    recordsFetched: 980,
    recordsInserted: 940,
    recordsUpdated: 40,
    errorMessage: null,
    sourceLatencyMs: 720,
    apiQuotaRemaining: null,
  },
  {
    id: "run-003",
    collectorName: "news-volume-collector",
    sourceCode: "NEWS",
    status: "partial_success",
    startedAt: "2026-06-20T09:00:00+09:00",
    endedAt: "2026-06-20T09:03:20+09:00",
    recordsFetched: 612,
    recordsInserted: 560,
    recordsUpdated: 0,
    errorMessage: "일부 언론사 RSS 타임아웃 (3/27 소스 실패)",
    sourceLatencyMs: 1840,
    apiQuotaRemaining: 4200,
  },
  {
    id: "run-004",
    collectorName: "ecos-macro",
    sourceCode: "ECOS",
    status: "success",
    startedAt: "2026-06-20T08:30:00+09:00",
    endedAt: "2026-06-20T08:30:26+09:00",
    recordsFetched: 64,
    recordsInserted: 12,
    recordsUpdated: 52,
    errorMessage: null,
    sourceLatencyMs: 510,
    apiQuotaRemaining: 9800,
  },
  {
    id: "run-005",
    collectorName: "opendart-disclosure",
    sourceCode: "OPENDART",
    status: "failed",
    startedAt: "2026-06-20T09:00:00+09:00",
    endedAt: "2026-06-20T09:00:09+09:00",
    recordsFetched: 0,
    recordsInserted: 0,
    recordsUpdated: 0,
    errorMessage: "HTTP 503 — 공시 API 일시 점검",
    sourceLatencyMs: 0,
    apiQuotaRemaining: 19900,
  },
  {
    id: "run-006",
    collectorName: "reb-housing",
    sourceCode: "REB",
    status: "skipped",
    startedAt: "2026-06-20T08:00:00+09:00",
    endedAt: "2026-06-20T08:00:00+09:00",
    recordsFetched: 0,
    recordsInserted: 0,
    recordsUpdated: 0,
    errorMessage: "발표 주기 아님 (주간 통계)",
    sourceLatencyMs: 0,
    apiQuotaRemaining: null,
  },
  {
    id: "run-007",
    collectorName: "index-scoring-job",
    sourceCode: "INTERNAL",
    status: "running",
    startedAt: "2026-06-20T09:05:00+09:00",
    endedAt: null,
    recordsFetched: 12,
    recordsInserted: 0,
    recordsUpdated: 0,
    errorMessage: null,
    sourceLatencyMs: 0,
    apiQuotaRemaining: null,
  },
  {
    id: "run-008",
    collectorName: "google-trends-aux",
    sourceCode: "GOOGLE_TRENDS",
    status: "scheduled",
    startedAt: "2026-06-20T12:00:00+09:00",
    endedAt: null,
    recordsFetched: 0,
    recordsInserted: 0,
    recordsUpdated: 0,
    errorMessage: null,
    sourceLatencyMs: 0,
    apiQuotaRemaining: 500,
  },
];

export function getCollectorRuns(): CollectorRun[] {
  return RUNS;
}

export interface DataSource {
  code: string;
  displayName: string;
  sourceType: string;
  updateFrequency: string;
  isActive: boolean;
}

export function getDataSources(): DataSource[] {
  return [
    { code: "NAVER_DATALAB", displayName: "네이버 데이터랩", sourceType: "SEARCH", updateFrequency: "일 2회", isActive: true },
    { code: "KRX", displayName: "KRX Open API", sourceType: "MARKET", updateFrequency: "일별(장마감)", isActive: true },
    { code: "OPENDART", displayName: "OpenDART", sourceType: "EVENT", updateFrequency: "1시간", isActive: true },
    { code: "ECOS", displayName: "한국은행 ECOS", sourceType: "OFFICIAL_STAT", updateFrequency: "지표별", isActive: true },
    { code: "REB", displayName: "한국부동산원", sourceType: "OFFICIAL_STAT", updateFrequency: "주간/월간", isActive: true },
    { code: "KOSIS", displayName: "KOSIS", sourceType: "OFFICIAL_STAT", updateFrequency: "지표별", isActive: true },
    { code: "NEWS", displayName: "뉴스 검색/수집", sourceType: "NEWS_VOLUME", updateFrequency: "1시간", isActive: true },
    { code: "GOOGLE_TRENDS", displayName: "Google Trends", sourceType: "SEARCH", updateFrequency: "일/주별", isActive: false },
    { code: "COMMUNITY", displayName: "커뮤니티 공개글", sourceType: "COMMUNITY", updateFrequency: "보류", isActive: false },
  ];
}

export const COLLECTOR_STATUS_META: Record<CollectorRunStatus, { label: string; hex: string }> = {
  success: { label: "성공", hex: "#3ba776" },
  partial_success: { label: "부분 성공", hex: "#e0b13a" },
  running: { label: "실행 중", hex: "#4aa3ff" },
  scheduled: { label: "예약됨", hex: "#6b7088" },
  skipped: { label: "건너뜀", hex: "#6b7088" },
  failed: { label: "실패", hex: "#e6483d" },
};
