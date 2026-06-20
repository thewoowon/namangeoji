import type { ApiResponse } from "./envelope";
import {
  buildCategories,
  buildCompare,
  buildEvents,
  buildIndexDetail,
  buildIndices,
  buildSeries,
  buildToday,
  parseCompareQuery,
  parseIndicesQuery,
  type ComparePayload,
  type IndicesPayload,
  type SeriesPayload,
  type TodayPayload,
} from "./queries";
import type { SeriesRange } from "@/lib/data";
import type { CategoryScore, IndexDetail, TriggerEvent } from "@/lib/types";
import { getCollectorRuns as getMockCollectorRuns, type CollectorRun } from "@/lib/admin-data";

/**
 * 데이터 접근 레이어.
 *
 * - NMGR_API_BASE_URL 환경변수가 있으면 외부 백엔드(spec §11.1 FastAPI)를 HTTP로 호출한다.
 * - 없으면 인-프로세스 쿼리 빌더를 직접 호출한다(목업, SSG/빌드 친화적).
 *
 * 실제 백엔드 연동 시 이 파일만 바꾸면 되고, 페이지 코드는 그대로다.
 */

const BASE_URL = process.env.NMGR_API_BASE_URL;
const REVALIDATE = 300;

async function fetchData<T>(path: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate: REVALIDATE },
    headers: { accept: "application/json" },
  });
  return (await res.json()) as ApiResponse<T>;
}

function unwrap<T>(res: ApiResponse<T>): T {
  if (!res.ok) {
    throw new ApiClientError(res.error.code, res.error.message);
  }
  return res.data;
}

/** 404 등 not-found 계열은 null로 변환 */
function unwrapOrNull<T>(res: ApiResponse<T>): T | null {
  if (!res.ok) {
    if (res.error.code === "INDEX_NOT_FOUND") return null;
    throw new ApiClientError(res.error.code, res.error.message);
  }
  return res.data;
}

export class ApiClientError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "ApiClientError";
  }
}

export interface IndicesParams {
  category?: string;
  sort?: string;
  level?: string;
  limit?: number;
  offset?: number;
}

function toSearchParams(params: Record<string, string | number | undefined>): URLSearchParams {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  }
  return sp;
}

export async function getToday(): Promise<TodayPayload> {
  if (BASE_URL) return unwrap(await fetchData<TodayPayload>("/api/v1/today"));
  return buildToday();
}

export async function getIndices(params: IndicesParams = {}): Promise<IndicesPayload> {
  const sp = toSearchParams({ ...params });
  if (BASE_URL) return unwrap(await fetchData<IndicesPayload>(`/api/v1/indices?${sp}`));
  return buildIndices(parseIndicesQuery(sp));
}

export async function getIndexDetail(slug: string): Promise<IndexDetail | null> {
  if (BASE_URL) return unwrapOrNull(await fetchData<IndexDetail>(`/api/v1/indices/${slug}`));
  return buildIndexDetail(slug);
}

export async function getIndexSeries(slug: string, range: SeriesRange): Promise<SeriesPayload | null> {
  if (BASE_URL) return unwrapOrNull(await fetchData<SeriesPayload>(`/api/v1/indices/${slug}/series?range=${range}`));
  return buildSeries(slug, range);
}

export async function getCompare(slugs: string[], range: SeriesRange): Promise<ComparePayload> {
  const sp = toSearchParams({ indices: slugs.join(","), range });
  if (BASE_URL) return unwrap(await fetchData<ComparePayload>(`/api/v1/compare?${sp}`));
  return buildCompare(parseCompareQuery(sp));
}

export async function getCategories(): Promise<CategoryScore[]> {
  if (BASE_URL) return unwrap(await fetchData<CategoryScore[]>("/api/v1/categories"));
  return buildCategories();
}

export async function getEvents(): Promise<TriggerEvent[]> {
  if (BASE_URL) return unwrap(await fetchData<TriggerEvent[]>("/api/v1/events"));
  return buildEvents();
}

/** 관리자 대시보드: 백엔드 연동 시 실제 수집 로그, 아니면 목업 */
export async function getCollectorRuns(): Promise<CollectorRun[]> {
  if (BASE_URL) {
    const rows = unwrap(await fetchData<Omit<CollectorRun, "apiQuotaRemaining">[]>("/api/v1/admin/collector-runs"));
    return rows.map((r) => ({ ...r, apiQuotaRemaining: null }));
  }
  return getMockCollectorRuns();
}
