import { scoreToLevel } from "./levels";
import type {
  CategoryCode,
  CategoryScore,
  CompositeIndex,
  IndexDetail,
  IndexSummary,
  SeriesPoint,
  SignalComponent,
  TriggerEvent,
} from "./types";

/* ------------------------------------------------------------------ *
 * 목업 데이터 레이어
 * 실제 파이프라인(spec §10) 대신, 결정론적으로 시계열을 생성한다.
 * API 응답(spec §12)과 동일한 형태의 객체를 반환한다.
 * ------------------------------------------------------------------ */

const ANCHOR = "2026-06-20T09:00:00+09:00";

/** 결정론적 의사난수 (seed 기반) */
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function seedFrom(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 1000000007;
  return h + 1;
}

/** 현재 점수에서 끝나는 days일치 시계열 생성 (랜덤워크 + 추세) */
function buildSeries(slug: string, endScore: number, days: number): SeriesPoint[] {
  const rand = rng(seedFrom(slug));
  const points: SeriesPoint[] = [];
  // 시작점은 endScore - delta30d 근방에서 출발
  let value = clamp(endScore - 14 + (rand() - 0.5) * 8, 4, 96);
  const drift = (endScore - value) / days;
  const end = new Date(ANCHOR).getTime();
  for (let i = days - 1; i >= 0; i--) {
    const noise = (rand() - 0.5) * 7;
    value = clamp(value + drift + noise, 2, 99);
    points.push({
      observedAt: new Date(end - i * 86_400_000).toISOString(),
      score: Math.round(value),
    });
  }
  // 마지막 점은 정확히 현재 점수로 맞춘다
  points[points.length - 1] = { observedAt: ANCHOR, score: endScore };
  return points;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/* ----------------------------- 카테고리 ----------------------------- */

export const CATEGORIES: { code: CategoryCode; name: string; description: string }[] = [
  { code: "ASSET", name: "자산 FOMO", description: "주식, 코인, 미국주식, 금, 환율 등 자산 가격 관련 박탈감" },
  { code: "HOUSING", name: "주거 불안", description: "집값, 전세, 월세, 청약, 대출, 역전세 관련 불안" },
  { code: "WORK_INCOME", name: "일·소득 불안", description: "취업, 이직, 연봉, 구조조정, 월급 구매력 관련 불안" },
  { code: "LIVING_COST", name: "생활비 불안", description: "물가, 식비, 교통비, 관리비, 보험료, 교육비 관련 불안" },
  { code: "RETIREMENT", name: "노후 불안", description: "국민연금, 개인연금, 노후빈곤, 고령화 관련 불안" },
  { code: "TECHNOLOGY", name: "기술 대체 불안", description: "AI, 자동화, 개발자 대체, 사무직 대체 관련 불안" },
  { code: "SOCIAL_MOBILITY", name: "계층이동 불안", description: "의대, 전문직, 대기업, 학벌, 교육격차 관련 불안" },
];

/* --------------------------- 지수 시드 정의 --------------------------- */

interface IndexSeed {
  code: string;
  slug: string;
  name: string;
  shortName: string;
  category: CategoryCode;
  score: number;
  delta1d: number;
  delta7d: number;
  delta30d: number;
  confidence: number;
  description: string;
  summary: string;
  primaryTrigger: string;
  keywords: string[];
  components: SignalComponent[];
  dataSources: string[];
  weights: { label: string; weight: number }[];
  relatedSlugs: string[];
}

const c = (
  code: string,
  label: string,
  type: SignalComponent["type"],
  currentValue: string,
  zScore: number,
  contribution: number,
  pending = false,
): SignalComponent => ({ code, label, type, currentValue, zScore, contribution, pending });

const SEEDS: IndexSeed[] = [
  {
    code: "SEMICONDUCTOR_FOMO",
    slug: "semiconductor-fomo",
    name: "반도체 열차 놓침지수",
    shortName: "반도체 FOMO",
    category: "ASSET",
    score: 92,
    delta1d: 18,
    delta7d: 24,
    delta30d: 41,
    confidence: 86,
    description: "삼성전자·SK하이닉스·HBM 관련 자산 FOMO를 측정합니다.",
    summary: "삼성전자·SK하이닉스 가격 모멘텀과 검색량이 동시에 상승했습니다.",
    primaryTrigger: "SK하이닉스 장중 신고가",
    keywords: ["삼성전자", "SK하이닉스", "HBM", "신고가", "지금 사도", "벼락거지", "추격매수"],
    components: [
      c("stock_momentum", "주가 모멘텀", "MARKET_PRICE", "+6.8%", 2.1, 0.31),
      c("search_spike", "검색량", "SEARCH", "지수 87", 1.8, 0.24),
      c("news_volume", "뉴스량", "NEWS_VOLUME", "143건", 2.5, 0.22),
      c("trading_volume", "거래대금", "MARKET_VOLUME", "+58%", 1.6, 0.12),
      c("fomo_phrase", "FOMO 문장", "NEWS_TONE", "상승", 1.1, 0.07),
      c("community", "커뮤니티 언급", "COMMUNITY", "준비 중", 0, 0.04, true),
    ],
    dataSources: ["KRX Open API", "OpenDART", "네이버 데이터랩", "뉴스 검색"],
    weights: [
      { label: "주가 모멘텀", weight: 0.3 },
      { label: "검색량 급등", weight: 0.2 },
      { label: "뉴스량", weight: 0.18 },
      { label: "거래량", weight: 0.12 },
      { label: "FOMO 문장", weight: 0.1 },
      { label: "변동성", weight: 0.1 },
    ],
    relatedSlugs: ["us-stock-fomo", "kospi-escape-fomo", "salary-powerlessness"],
  },
  {
    code: "SEOUL_HOUSING_LOCKOUT",
    slug: "seoul-housing-lockout",
    name: "서울집 입성불가지수",
    shortName: "서울집 포비아",
    category: "HOUSING",
    score: 88,
    delta1d: 11,
    delta7d: 16,
    delta30d: 27,
    confidence: 79,
    description: "서울 아파트 가격 상승과 무주택자의 진입 불안을 측정합니다.",
    summary: "서울 아파트 상승 기사와 ‘평생 못 산다’ 검색이 함께 늘었습니다.",
    primaryTrigger: "서울 아파트 매매가격지수 반등",
    keywords: ["서울 아파트", "집값", "강남", "마용성", "청약", "무주택", "영끌", "대출 규제"],
    components: [
      c("price_momentum", "매매가격 모멘텀", "OFFICIAL_STAT", "+0.34%", 1.9, 0.28),
      c("search_spike", "검색량", "SEARCH", "지수 78", 1.6, 0.2),
      c("news_volume", "뉴스량", "NEWS_VOLUME", "118건", 2.0, 0.18),
      c("transaction", "거래량 회복", "OFFICIAL_STAT", "+22%", 1.2, 0.14),
      c("mortgage_event", "대출/정책 이벤트", "EVENT", "2건", 0.9, 0.1),
      c("lockout_phrase", "‘입성불가’ 문장", "NEWS_TONE", "상승", 1.3, 0.1),
    ],
    dataSources: ["한국부동산원", "ECOS", "네이버 데이터랩", "뉴스 검색"],
    weights: [
      { label: "서울 가격 모멘텀", weight: 0.28 },
      { label: "검색량", weight: 0.2 },
      { label: "뉴스량", weight: 0.18 },
      { label: "거래량 회복", weight: 0.14 },
      { label: "대출/정책 이벤트", weight: 0.1 },
      { label: "입성불가 문장", weight: 0.1 },
    ],
    relatedSlugs: ["jeonse-bomb", "monthly-rent-pressure", "salary-powerlessness"],
  },
  {
    code: "BITCOIN_FOMO",
    slug: "bitcoin-fomo",
    name: "비트코인 또 나만 없음지수",
    shortName: "비트코인 FOMO",
    category: "ASSET",
    score: 81,
    delta1d: 9,
    delta7d: 13,
    delta30d: 22,
    confidence: 72,
    description: "비트코인 급등·신고가 이후 발생하는 코인 FOMO를 측정합니다.",
    summary: "비트코인 신고가 뉴스 이후 ‘지금 사도’ 검색이 급증했습니다.",
    primaryTrigger: "비트코인 장중 신고가",
    keywords: ["비트코인", "BTC", "이더리움", "코인", "신고가", "불장", "알트코인", "ETF"],
    components: [
      c("price_momentum", "가격 모멘텀", "MARKET_PRICE", "+9.4%", 2.3, 0.32),
      c("search_spike", "검색량", "SEARCH", "지수 82", 1.9, 0.2),
      c("news_volume", "뉴스량", "NEWS_VOLUME", "96건", 1.5, 0.16),
      c("exchange", "거래소 관심", "MARKET_VOLUME", "+71%", 1.4, 0.12),
      c("fomo_phrase", "FOMO 문장", "NEWS_TONE", "상승", 1.0, 0.1),
      c("volatility", "변동성", "MARKET_PRICE", "높음", 1.7, 0.1),
    ],
    dataSources: ["거래소 공개데이터", "네이버 데이터랩", "Google Trends", "뉴스 검색"],
    weights: [
      { label: "가격 모멘텀", weight: 0.32 },
      { label: "검색량", weight: 0.2 },
      { label: "뉴스량", weight: 0.16 },
      { label: "거래소 관심", weight: 0.12 },
      { label: "FOMO 문장", weight: 0.1 },
      { label: "변동성", weight: 0.1 },
    ],
    relatedSlugs: ["us-stock-fomo", "cash-decay", "semiconductor-fomo"],
  },
  {
    code: "CASH_DECAY",
    slug: "cash-decay",
    name: "현금 쓰레기화 공포지수",
    shortName: "현금 쓰레기화",
    category: "ASSET",
    score: 84,
    delta1d: 9,
    delta7d: 12,
    delta30d: 19,
    confidence: 77,
    description: "물가·환율·자산 랠리로 인한 현금 보유자의 구매력 상실 불안을 측정합니다.",
    summary: "환율 급등과 자산 랠리가 겹치며 현금 보유 불안이 커졌습니다.",
    primaryTrigger: "원/달러 환율 급등",
    keywords: ["현금", "환율", "물가", "인플레이션", "달러", "구매력", "예적금 손해"],
    components: [
      c("inflation", "물가 압력", "OFFICIAL_STAT", "+3.1%", 1.6, 0.25),
      c("usdkrw", "원/달러 모멘텀", "OFFICIAL_STAT", "+1.8%", 2.0, 0.2),
      c("asset_breadth", "자산 랠리 폭", "MARKET_PRICE", "넓음", 1.7, 0.18),
      c("search_spike", "검색량", "SEARCH", "지수 64", 1.1, 0.15),
      c("real_wage", "실질임금 압력", "OFFICIAL_STAT", "-1.2%", 1.3, 0.12),
      c("news_volume", "뉴스량", "NEWS_VOLUME", "74건", 1.0, 0.1),
    ],
    dataSources: ["ECOS", "KRX Open API", "네이버 데이터랩", "뉴스 검색"],
    weights: [
      { label: "물가 압력", weight: 0.25 },
      { label: "원/달러 모멘텀", weight: 0.2 },
      { label: "자산 랠리 폭", weight: 0.18 },
      { label: "검색량", weight: 0.15 },
      { label: "실질임금 압력", weight: 0.12 },
      { label: "뉴스량", weight: 0.1 },
    ],
    relatedSlugs: ["salary-powerlessness", "bitcoin-fomo", "us-stock-fomo"],
  },
  {
    code: "US_STOCK_FOMO",
    slug: "us-stock-fomo",
    name: "미국주식 밤샘 FOMO지수",
    shortName: "미국주식 FOMO",
    category: "ASSET",
    score: 76,
    delta1d: 6,
    delta7d: 10,
    delta30d: 18,
    confidence: 74,
    description: "나스닥·AI주·환율이 결합된 미국주식 FOMO를 측정합니다.",
    summary: "나스닥 강세와 환율 부담이 겹치며 밤샘 매수 관심이 높습니다.",
    primaryTrigger: "나스닥 사상 최고치",
    keywords: ["나스닥", "엔비디아", "S&P500", "서학개미", "미국주식", "환율", "AI주"],
    components: [
      c("price_momentum", "지수 모멘텀", "MARKET_PRICE", "+4.2%", 1.8, 0.3),
      c("search_spike", "검색량", "SEARCH", "지수 70", 1.4, 0.2),
      c("news_volume", "뉴스량", "NEWS_VOLUME", "88건", 1.3, 0.18),
      c("fx", "환율 결합", "OFFICIAL_STAT", "+1.8%", 1.5, 0.12),
      c("fomo_phrase", "FOMO 문장", "NEWS_TONE", "상승", 0.9, 0.1),
      c("volatility", "변동성", "MARKET_PRICE", "보통", 0.7, 0.1),
    ],
    dataSources: ["Google Trends", "ECOS", "네이버 데이터랩", "뉴스 검색"],
    weights: [
      { label: "지수 모멘텀", weight: 0.3 },
      { label: "검색량", weight: 0.2 },
      { label: "뉴스량", weight: 0.18 },
      { label: "환율 결합", weight: 0.12 },
      { label: "FOMO 문장", weight: 0.1 },
      { label: "변동성", weight: 0.1 },
    ],
    relatedSlugs: ["semiconductor-fomo", "bitcoin-fomo", "cash-decay"],
  },
  {
    code: "SALARY_POWERLESSNESS",
    slug: "salary-powerlessness",
    name: "월급 무력감지수",
    shortName: "월급 무력감",
    category: "WORK_INCOME",
    score: 73,
    delta1d: 4,
    delta7d: 7,
    delta30d: 12,
    confidence: 70,
    description: "월급 상승 속도가 자산·물가·주거비를 따라가지 못한다는 박탈감을 측정합니다.",
    summary: "자산·집값은 오르는데 월급은 제자리라는 체감이 넓어졌습니다.",
    primaryTrigger: "실질임금 정체 통계 발표",
    keywords: ["월급", "실수령", "연봉", "물가", "현타", "월급으로 집", "직장인 거지"],
    components: [
      c("inflation", "물가 압력", "OFFICIAL_STAT", "+3.1%", 1.4, 0.25),
      c("housing_cost", "주거비 압력", "OFFICIAL_STAT", "+2.0%", 1.5, 0.22),
      c("asset_gap", "자산 격차", "MARKET_PRICE", "확대", 1.6, 0.18),
      c("search_spike", "검색량", "SEARCH", "지수 58", 1.0, 0.15),
      c("news_volume", "뉴스량", "NEWS_VOLUME", "61건", 0.8, 0.1),
      c("confidence", "소비심리(역)", "OFFICIAL_STAT", "97.2", 0.9, 0.1),
    ],
    dataSources: ["ECOS", "KOSIS", "네이버 데이터랩", "뉴스 검색"],
    weights: [
      { label: "물가 압력", weight: 0.25 },
      { label: "주거비 압력", weight: 0.22 },
      { label: "자산 격차", weight: 0.18 },
      { label: "검색량", weight: 0.15 },
      { label: "뉴스량", weight: 0.1 },
      { label: "소비심리(역)", weight: 0.1 },
    ],
    relatedSlugs: ["cash-decay", "seoul-housing-lockout", "job-collapse"],
  },
  {
    code: "AI_REPLACEMENT",
    slug: "ai-replacement",
    name: "AI 대체공포지수",
    shortName: "AI 대체공포",
    category: "TECHNOLOGY",
    score: 69,
    delta1d: 5,
    delta7d: 9,
    delta30d: 15,
    confidence: 66,
    description: "AI 자동화로 인한 직무 대체 불안을 측정합니다.",
    summary: "AI 에이전트 관련 뉴스 이후 ‘일자리 사라짐’ 검색이 늘었습니다.",
    primaryTrigger: "대기업 AI 자동화 도입 발표",
    keywords: ["AI 대체", "개발자 대체", "사무직 대체", "자동화", "구조조정", "코파일럿", "에이전트"],
    components: [
      c("news_volume", "AI 직무 뉴스량", "NEWS_VOLUME", "102건", 1.7, 0.25),
      c("search_spike", "검색량", "SEARCH", "지수 61", 1.3, 0.22),
      c("layoff_event", "감원·자동화 이벤트", "EVENT", "3건", 1.2, 0.18),
      c("job_board", "채용공고 신호", "OFFICIAL_STAT", "-8%", 0.9, 0.15),
      c("community", "커뮤니티 언급", "COMMUNITY", "준비 중", 0, 0.1, true),
      c("global_ai", "글로벌 AI 이벤트", "NEWS_VOLUME", "상승", 1.1, 0.1),
    ],
    dataSources: ["뉴스 검색", "네이버 데이터랩", "Google Trends", "채용 공개데이터"],
    weights: [
      { label: "AI 직무 뉴스량", weight: 0.25 },
      { label: "검색량", weight: 0.22 },
      { label: "감원·자동화 이벤트", weight: 0.18 },
      { label: "채용공고 신호", weight: 0.15 },
      { label: "커뮤니티 언급", weight: 0.1 },
      { label: "글로벌 AI 이벤트", weight: 0.1 },
    ],
    relatedSlugs: ["job-collapse", "salary-powerlessness", "pension-void"],
  },
  {
    code: "JEONSE_BOMB",
    slug: "jeonse-bomb",
    name: "전세폭탄지수",
    shortName: "전세폭탄",
    category: "HOUSING",
    score: 58,
    delta1d: -3,
    delta7d: -6,
    delta30d: -2,
    confidence: 68,
    description: "전세사기·역전세·보증금 회수 불안을 측정합니다.",
    summary: "전세사기 뉴스량이 줄며 불안 신호가 다소 가라앉았습니다.",
    primaryTrigger: "전세사기 피해 지원 정책 발표",
    keywords: ["전세사기", "역전세", "보증금", "깡통전세", "전세보증", "보증금 반환"],
    components: [
      c("news_volume", "뉴스량", "NEWS_VOLUME", "47건", 0.8, 0.28),
      c("search_spike", "검색량", "SEARCH", "지수 41", 0.6, 0.22),
      c("jeonse_ratio", "전세가율", "OFFICIAL_STAT", "68.4%", 0.5, 0.18),
      c("policy_event", "정책 이벤트", "EVENT", "1건", 0.7, 0.14),
      c("phrase", "‘보증금’ 문장", "NEWS_TONE", "보통", 0.4, 0.1),
      c("community", "커뮤니티 언급", "COMMUNITY", "준비 중", 0, 0.08, true),
    ],
    dataSources: ["한국부동산원", "뉴스 검색", "네이버 데이터랩"],
    weights: [
      { label: "뉴스량", weight: 0.28 },
      { label: "검색량", weight: 0.22 },
      { label: "전세가율", weight: 0.18 },
      { label: "정책 이벤트", weight: 0.14 },
      { label: "보증금 문장", weight: 0.1 },
      { label: "커뮤니티 언급", weight: 0.08 },
    ],
    relatedSlugs: ["seoul-housing-lockout", "monthly-rent-pressure"],
  },
  {
    code: "PENSION_VOID",
    slug: "pension-void",
    name: "국민연금 고갈공포지수",
    shortName: "연금 고갈",
    category: "RETIREMENT",
    score: 64,
    delta1d: 2,
    delta7d: 5,
    delta30d: 11,
    confidence: 71,
    description: "국민연금 고갈·보험료율 인상·노후빈곤 관련 불안을 측정합니다.",
    summary: "연금개혁 논의 재점화로 고갈 관련 뉴스·검색이 늘었습니다.",
    primaryTrigger: "연금개혁 논의 기사 증가",
    keywords: ["국민연금 고갈", "연금개혁", "보험료율", "수급연령", "노후빈곤", "퇴직연금"],
    components: [
      c("news_volume", "뉴스량", "NEWS_VOLUME", "83건", 1.4, 0.3),
      c("search_spike", "검색량", "SEARCH", "지수 55", 1.0, 0.22),
      c("policy_event", "정책 이벤트", "EVENT", "2건", 1.1, 0.18),
      c("aging", "고령화 압력", "OFFICIAL_STAT", "+0.4%p", 0.6, 0.12),
      c("poverty", "노후빈곤 뉴스", "NEWS_VOLUME", "29건", 0.8, 0.1),
      c("community", "커뮤니티 언급", "COMMUNITY", "준비 중", 0, 0.08, true),
    ],
    dataSources: ["뉴스 검색", "KOSIS", "네이버 데이터랩"],
    weights: [
      { label: "뉴스량", weight: 0.3 },
      { label: "검색량", weight: 0.22 },
      { label: "정책 이벤트", weight: 0.18 },
      { label: "고령화 압력", weight: 0.12 },
      { label: "노후빈곤 뉴스", weight: 0.1 },
      { label: "커뮤니티 언급", weight: 0.08 },
    ],
    relatedSlugs: ["ai-replacement", "salary-powerlessness"],
  },
  {
    code: "KOSPI_ESCAPE_FOMO",
    slug: "kospi-escape-fomo",
    name: "코스피 나만 두고 감지수",
    shortName: "코스피 FOMO",
    category: "ASSET",
    score: 61,
    delta1d: 3,
    delta7d: 6,
    delta30d: 14,
    confidence: 73,
    description: "코스피·대형주 랠리에서 느끼는 소외감을 측정합니다.",
    summary: "대형주 랠리에 ‘나만 빠졌나’ 검색이 완만히 늘었습니다.",
    primaryTrigger: "코스피 연중 최고치 경신",
    keywords: ["코스피", "대형주", "외국인 순매수", "지수", "나만 빠졌다", "추격"],
    components: [
      c("price_momentum", "지수 모멘텀", "MARKET_PRICE", "+2.1%", 1.2, 0.3),
      c("search_spike", "검색량", "SEARCH", "지수 52", 0.9, 0.2),
      c("news_volume", "뉴스량", "NEWS_VOLUME", "67건", 1.0, 0.18),
      c("foreign_flow", "수급(외국인)", "MARKET_VOLUME", "순매수", 1.1, 0.12),
      c("fomo_phrase", "FOMO 문장", "NEWS_TONE", "보통", 0.6, 0.1),
      c("volatility", "변동성", "MARKET_PRICE", "낮음", 0.4, 0.1),
    ],
    dataSources: ["KRX Open API", "네이버 데이터랩", "뉴스 검색"],
    weights: [
      { label: "지수 모멘텀", weight: 0.3 },
      { label: "검색량", weight: 0.2 },
      { label: "뉴스량", weight: 0.18 },
      { label: "수급", weight: 0.12 },
      { label: "FOMO 문장", weight: 0.1 },
      { label: "변동성", weight: 0.1 },
    ],
    relatedSlugs: ["semiconductor-fomo", "us-stock-fomo"],
  },
  {
    code: "MONTHLY_RENT_PRESSURE",
    slug: "monthly-rent-pressure",
    name: "월세 압박지수",
    shortName: "월세 압박",
    category: "HOUSING",
    score: 55,
    delta1d: 1,
    delta7d: 3,
    delta30d: 6,
    confidence: 64,
    description: "월세 상승·관리비·주거비 부담을 측정합니다.",
    summary: "월세·관리비 부담 관련 뉴스가 꾸준히 이어지고 있습니다.",
    primaryTrigger: "월세 가격지수 상승",
    keywords: ["월세", "관리비", "주거비", "보증금", "반전세", "월세 부담"],
    components: [
      c("rent_index", "월세가격지수", "OFFICIAL_STAT", "+0.5%", 0.9, 0.3),
      c("search_spike", "검색량", "SEARCH", "지수 44", 0.6, 0.22),
      c("news_volume", "뉴스량", "NEWS_VOLUME", "39건", 0.7, 0.18),
      c("maintenance", "관리비 압력", "OFFICIAL_STAT", "+2.4%", 0.8, 0.12),
      c("phrase", "‘월세 부담’ 문장", "NEWS_TONE", "보통", 0.5, 0.1),
      c("community", "커뮤니티 언급", "COMMUNITY", "준비 중", 0, 0.08, true),
    ],
    dataSources: ["한국부동산원", "KOSIS", "뉴스 검색"],
    weights: [
      { label: "월세가격지수", weight: 0.3 },
      { label: "검색량", weight: 0.22 },
      { label: "뉴스량", weight: 0.18 },
      { label: "관리비 압력", weight: 0.12 },
      { label: "월세 부담 문장", weight: 0.1 },
      { label: "커뮤니티 언급", weight: 0.08 },
    ],
    relatedSlugs: ["seoul-housing-lockout", "jeonse-bomb", "salary-powerlessness"],
  },
  {
    code: "JOB_COLLAPSE",
    slug: "job-collapse",
    name: "취업 멸망지수",
    shortName: "취업 멸망",
    category: "WORK_INCOME",
    score: 52,
    delta1d: 2,
    delta7d: 4,
    delta30d: 7,
    confidence: 62,
    description: "취업난·채용축소·청년실업 불안을 측정합니다.",
    summary: "채용 축소 기사와 청년실업 검색이 완만히 늘었습니다.",
    primaryTrigger: "대기업 공채 축소 보도",
    keywords: ["취업난", "공채", "청년실업", "채용축소", "스펙", "탈락", "인턴"],
    components: [
      c("news_volume", "뉴스량", "NEWS_VOLUME", "58건", 0.9, 0.26),
      c("search_spike", "검색량", "SEARCH", "지수 48", 0.7, 0.22),
      c("job_board", "채용공고 변화", "OFFICIAL_STAT", "-6%", 0.8, 0.2),
      c("youth_unemp", "청년실업률", "OFFICIAL_STAT", "6.1%", 0.6, 0.14),
      c("phrase", "‘취업난’ 문장", "NEWS_TONE", "보통", 0.5, 0.1),
      c("community", "커뮤니티 언급", "COMMUNITY", "준비 중", 0, 0.08, true),
    ],
    dataSources: ["KOSIS", "뉴스 검색", "네이버 데이터랩"],
    weights: [
      { label: "뉴스량", weight: 0.26 },
      { label: "검색량", weight: 0.22 },
      { label: "채용공고 변화", weight: 0.2 },
      { label: "청년실업률", weight: 0.14 },
      { label: "취업난 문장", weight: 0.1 },
      { label: "커뮤니티 언급", weight: 0.08 },
    ],
    relatedSlugs: ["ai-replacement", "salary-powerlessness"],
  },
];

/* ----------------------------- 이벤트 ----------------------------- */

const EVENTS: TriggerEvent[] = [
  {
    id: "evt-001",
    type: "ASSET_PRICE",
    title: "SK하이닉스 장중 신고가",
    description: "SK하이닉스가 장중 52주 신고가를 경신하며 HBM 기대감이 재확산됐습니다.",
    sourceName: "KRX",
    sourceUrl: "https://data.krx.co.kr/",
    occurredAt: "2026-06-20T09:05:00+09:00",
    impactDirection: "UP",
    relatedIndexSlugs: ["semiconductor-fomo", "kospi-escape-fomo"],
    confidence: 88,
  },
  {
    id: "evt-002",
    type: "REAL_ESTATE",
    title: "서울 아파트 매매가격지수 반등",
    description: "한국부동산원 주간 동향에서 서울 아파트 매매가격지수가 상승 전환했습니다.",
    sourceName: "한국부동산원",
    sourceUrl: "https://www.reb.or.kr/",
    occurredAt: "2026-06-20T08:30:00+09:00",
    impactDirection: "UP",
    relatedIndexSlugs: ["seoul-housing-lockout", "salary-powerlessness"],
    confidence: 81,
  },
  {
    id: "evt-003",
    type: "MACRO",
    title: "원/달러 환율 급등",
    description: "원/달러 환율이 장중 큰 폭으로 상승하며 현금 구매력 관련 검색이 늘었습니다.",
    sourceName: "한국은행 ECOS",
    sourceUrl: "https://ecos.bok.or.kr/",
    occurredAt: "2026-06-20T10:10:00+09:00",
    impactDirection: "UP",
    relatedIndexSlugs: ["cash-decay", "us-stock-fomo"],
    confidence: 84,
  },
  {
    id: "evt-004",
    type: "ASSET_PRICE",
    title: "비트코인 장중 신고가",
    description: "비트코인이 장중 신고가를 기록하며 ‘지금 사도 되나’ 검색이 급증했습니다.",
    sourceName: "거래소 공개데이터",
    occurredAt: "2026-06-20T07:40:00+09:00",
    impactDirection: "UP",
    relatedIndexSlugs: ["bitcoin-fomo"],
    confidence: 70,
  },
  {
    id: "evt-005",
    type: "NEWS",
    title: "대기업 AI 자동화 도입 발표",
    description: "한 대기업이 사무 프로세스 AI 자동화 확대를 발표하며 직무 대체 우려가 확산됐습니다.",
    occurredAt: "2026-06-19T16:20:00+09:00",
    impactDirection: "UP",
    relatedIndexSlugs: ["ai-replacement", "job-collapse"],
    confidence: 64,
  },
  {
    id: "evt-006",
    type: "POLICY",
    title: "연금개혁 논의 기사 증가",
    description: "국민연금 개혁 방향을 다룬 보도가 늘며 고갈·보험료율 관련 검색이 상승했습니다.",
    occurredAt: "2026-06-19T14:00:00+09:00",
    impactDirection: "UP",
    relatedIndexSlugs: ["pension-void"],
    confidence: 71,
  },
  {
    id: "evt-007",
    type: "POLICY",
    title: "전세사기 피해 지원 정책 발표",
    description: "전세사기 피해 지원 보완책이 발표되며 관련 불안 뉴스량이 다소 감소했습니다.",
    occurredAt: "2026-06-19T11:30:00+09:00",
    impactDirection: "DOWN",
    relatedIndexSlugs: ["jeonse-bomb"],
    confidence: 68,
  },
];

/* --------------------------- 파생/조회 함수 --------------------------- */

function toSummary(s: IndexSeed): IndexSummary {
  return {
    code: s.code,
    slug: s.slug,
    name: s.name,
    shortName: s.shortName,
    category: s.category,
    score: s.score,
    level: scoreToLevel(s.score),
    delta1d: s.delta1d,
    delta7d: s.delta7d,
    delta30d: s.delta30d,
    summary: s.summary,
    confidence: s.confidence,
    updatedAt: ANCHOR,
    sparkline: buildSeries(s.slug, s.score, 7),
    primaryTrigger: s.primaryTrigger,
  };
}

export function getAllIndices(): IndexSummary[] {
  return SEEDS.map(toSummary).sort((a, b) => b.score - a.score);
}

export function getTopIndices(limit = 10): IndexSummary[] {
  return getAllIndices().slice(0, limit);
}

export function getRisingIndices(limit = 3): IndexSummary[] {
  return [...getAllIndices()].sort((a, b) => b.delta1d - a.delta1d).slice(0, limit);
}

export function getFallingIndices(limit = 3): IndexSummary[] {
  return [...getAllIndices()].sort((a, b) => a.delta1d - b.delta1d).slice(0, limit);
}

export function getIndexDetail(slug: string): IndexDetail | null {
  const s = SEEDS.find((x) => x.slug === slug);
  if (!s) return null;
  const base = toSummary(s);
  const level = scoreToLevel(s.score);
  return {
    ...base,
    description: s.description,
    headline: s.summary,
    keywords: s.keywords,
    components: s.components,
    series30d: buildSeries(s.slug, s.score, 30),
    events: EVENTS.filter((e) => e.relatedIndexSlugs.includes(s.slug)),
    relatedSlugs: s.relatedSlugs,
    dataSources: s.dataSources,
    methodologyVersion: "2026.06.1",
    weights: s.weights,
    level,
  };
}

export function getAllSlugs(): string[] {
  return SEEDS.map((s) => s.slug);
}

export type SeriesRange = "7d" | "30d" | "90d" | "1y";

const RANGE_DAYS: Record<SeriesRange, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };

/** spec §12.5 — 기간별 시계열 */
export function getIndexSeries(slug: string, range: SeriesRange): SeriesPoint[] | null {
  const s = SEEDS.find((x) => x.slug === slug);
  if (!s) return null;
  return buildSeries(s.slug, s.score, RANGE_DAYS[range]);
}

export function getCategoryScores(): CategoryScore[] {
  const indices = getAllIndices();
  return CATEGORIES.map((cat) => {
    const members = indices.filter((i) => i.category === cat.code);
    if (members.length === 0) return { code: cat.code, name: cat.name, score: 0, delta1d: 0 };
    const score = Math.round(members.reduce((a, b) => a + b.score, 0) / members.length);
    const delta1d = Math.round(members.reduce((a, b) => a + b.delta1d, 0) / members.length);
    return { code: cat.code, name: cat.name, score, delta1d };
  }).sort((a, b) => b.score - a.score);
}

export function getEvents(): TriggerEvent[] {
  return [...EVENTS].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}

/** spec §7.1.2 — 가중 종합지수 */
const COMPOSITE_WEIGHTS: Partial<Record<CategoryCode, number>> = {
  ASSET: 0.3,
  HOUSING: 0.22,
  LIVING_COST: 0.14,
  WORK_INCOME: 0.12,
  RETIREMENT: 0.1,
  TECHNOLOGY: 0.07,
  SOCIAL_MOBILITY: 0.05,
};

export function getComposite(): CompositeIndex {
  const cats = getCategoryScores();
  const catMap = new Map(cats.map((c) => [c.code, c]));
  let score = 0;
  let weightSum = 0;
  for (const [code, w] of Object.entries(COMPOSITE_WEIGHTS) as [CategoryCode, number][]) {
    const cat = catMap.get(code);
    if (cat && cat.score > 0) {
      score += cat.score * w;
      weightSum += w;
    }
  }
  const finalScore = Math.round(weightSum > 0 ? score / weightSum : 0);
  const top = getRisingIndices(1)[0];
  return {
    code: "NMGR_COMPOSITE_INDEX",
    name: "나만거지지수",
    date: "2026-06-20",
    score: finalScore,
    level: scoreToLevel(finalScore),
    delta1d: 9,
    delta7d: 18,
    confidence: 82,
    primaryDriver: top?.name ?? "",
    summary: "반도체·서울집·현금가치 불안이 동시에 상승했습니다.",
    updatedAt: ANCHOR,
    sparkline: buildSeries("composite", finalScore, 7),
  };
}
