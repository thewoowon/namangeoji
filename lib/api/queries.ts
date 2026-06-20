import {
  getComposite,
  getTopIndices,
  getRisingIndices,
  getFallingIndices,
  getCategoryScores,
  getEvents,
  getAllIndices,
  getIndexDetail,
  getIndexSeries,
  type SeriesRange,
} from "@/lib/data";
import type {
  CategoryCode,
  CategoryScore,
  CompositeIndex,
  IndexDetail,
  IndexLevel,
  IndexSummary,
  SeriesPoint,
  TriggerEvent,
} from "@/lib/types";

/* ----------------------------- payloads ----------------------------- */

export interface TodayPayload {
  date: string;
  composite: CompositeIndex;
  topIndices: IndexSummary[];
  risingIndices: IndexSummary[];
  fallingIndices: IndexSummary[];
  categories: CategoryScore[];
  events: TriggerEvent[];
}

export interface IndicesPayload {
  items: IndexSummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface SeriesPayload {
  slug: string;
  range: SeriesRange;
  interval: "day";
  points: SeriesPoint[];
}

export interface CompareEntry {
  slug: string;
  name: string;
  shortName: string;
  score: number;
  level: IndexLevel;
  series: SeriesPoint[];
}

export interface ComparePayload {
  range: SeriesRange;
  indices: CompareEntry[];
}

export interface ShareCardPayload {
  shareId: string;
  imageUrl: string;
  pageUrl: string;
}

function clampInt(raw: string | null, fallback: number, min: number, max: number): number {
  const n = raw == null ? NaN : Number.parseInt(raw, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

/* ----------------------------- builders ----------------------------- */

export function buildToday(): TodayPayload {
  return {
    date: getComposite().date,
    composite: getComposite(),
    topIndices: getTopIndices(10),
    risingIndices: getRisingIndices(3),
    fallingIndices: getFallingIndices(2),
    categories: getCategoryScores(),
    events: getEvents().slice(0, 6),
  };
}

const SORT_KEYS = ["score", "delta1d", "delta7d", "confidence"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

const LEVELS: IndexLevel[] = ["STABLE", "WATCH", "CAUTION", "ANXIOUS", "OVERHEATED"];

export interface IndicesQuery {
  category?: CategoryCode;
  sort: SortKey;
  level?: IndexLevel;
  limit: number;
  offset: number;
}

/** spec §12.3 쿼리 파싱 (잘못된 값은 기본값으로 안전 처리) */
export function parseIndicesQuery(sp: URLSearchParams): IndicesQuery {
  const category = sp.get("category") as CategoryCode | null;
  const sortRaw = sp.get("sort");
  const levelRaw = sp.get("level");
  const limit = clampInt(sp.get("limit"), 50, 1, 100);
  const offset = clampInt(sp.get("offset"), 0, 0, 1000);
  return {
    category: category ?? undefined,
    sort: (SORT_KEYS as readonly string[]).includes(sortRaw ?? "") ? (sortRaw as SortKey) : "score",
    level: levelRaw && LEVELS.includes(levelRaw as IndexLevel) ? (levelRaw as IndexLevel) : undefined,
    limit,
    offset,
  };
}

export function buildIndices(q: IndicesQuery): IndicesPayload {
  let list = getAllIndices();
  if (q.category) list = list.filter((i) => i.category === q.category);
  if (q.level) list = list.filter((i) => i.level === q.level);
  list = [...list].sort((a, b) => b[q.sort] - a[q.sort]);
  const total = list.length;
  const items = list.slice(q.offset, q.offset + q.limit);
  return { items, total, limit: q.limit, offset: q.offset };
}

export function buildIndexDetail(slug: string): IndexDetail | null {
  return getIndexDetail(slug);
}

const RANGES = ["7d", "30d", "90d", "1y"] as const;

export function parseRange(sp: URLSearchParams, fallback: SeriesRange = "30d"): SeriesRange {
  const r = sp.get("range");
  return (RANGES as readonly string[]).includes(r ?? "") ? (r as SeriesRange) : fallback;
}

export function buildSeries(slug: string, range: SeriesRange): SeriesPayload | null {
  const points = getIndexSeries(slug, range);
  if (!points) return null;
  return { slug, range, interval: "day", points };
}

export interface CompareQuery {
  slugs: string[];
  range: SeriesRange;
}

/** spec §12.6 — ?indices=a,b,c&range=30d (최대 5개) */
export function parseCompareQuery(sp: URLSearchParams): CompareQuery {
  const slugs = (sp.get("indices") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);
  return { slugs, range: parseRange(sp) };
}

export function buildCompare(q: CompareQuery): ComparePayload {
  const indices: CompareEntry[] = q.slugs
    .map((slug) => {
      const detail = getIndexDetail(slug);
      const series = getIndexSeries(slug, q.range);
      if (!detail || !series) return null;
      return {
        slug: detail.slug,
        name: detail.name,
        shortName: detail.shortName,
        score: detail.score,
        level: detail.level,
        series,
      };
    })
    .filter((e): e is CompareEntry => !!e);
  return { range: q.range, indices };
}

export function buildCategories(): CategoryScore[] {
  return getCategoryScores();
}

export function buildEvents(): TriggerEvent[] {
  return getEvents();
}

/* ------------------------- share cards (POST) ------------------------- */

export interface ShareCardRequest {
  type: "today_summary" | "index_detail" | "top5" | "rising" | "compare";
  indexSlug?: string | null;
  theme?: string;
  range?: string;
}

export function parseShareCardBody(body: unknown): ShareCardRequest | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const types = ["today_summary", "index_detail", "top5", "rising", "compare"];
  if (typeof b.type !== "string" || !types.includes(b.type)) return null;
  return {
    type: b.type as ShareCardRequest["type"],
    indexSlug: typeof b.indexSlug === "string" ? b.indexSlug : null,
    theme: typeof b.theme === "string" ? b.theme : "default",
    range: typeof b.range === "string" ? b.range : "1d",
  };
}

/**
 * spec §12.7 — 공유 이미지 생성.
 * MVP: 결정론적 shareId와 URL을 반환하는 스텁. 실제 이미지 렌더링(Satori/Playwright)은
 * 별도 단계에서 imageUrl을 채운다.
 */
export function buildShareCard(req: ShareCardRequest, origin: string): ShareCardPayload {
  const slug = req.indexSlug || null;
  const slugPart = slug ? `_${slug}` : "";
  const shareId = `shr_${Date.now().toString(36)}${slugPart}`.slice(0, 64);
  const ogQuery = slug ? `type=index_detail&slug=${encodeURIComponent(slug)}` : `type=today_summary`;
  return {
    shareId,
    imageUrl: `${origin}/api/og?${ogQuery}`,
    pageUrl: `${origin}/share/${shareId}`,
  };
}
