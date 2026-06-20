// spec §12.1 — 공통 응답 형식

export interface ApiMeta {
  requestId: string;
  servedAt: string;
  cache?: { hit: boolean; ttlSeconds: number };
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiError {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta: Pick<ApiMeta, "requestId">;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** API 에러 코드 (spec §12.1 예시 INDEX_NOT_FOUND 등) */
export type ApiErrorCode =
  | "INDEX_NOT_FOUND"
  | "INVALID_QUERY"
  | "INVALID_BODY"
  | "INTERNAL_ERROR";

function requestId(): string {
  // 충돌 가능성이 낮은 짧은 식별자 (req_ + base36 timestamp + random)
  const rand = Math.random().toString(36).slice(2, 8);
  return `req_${Date.now().toString(36)}${rand}`;
}

export function makeMeta(cache?: { hit: boolean; ttlSeconds: number }): ApiMeta {
  return {
    requestId: requestId(),
    servedAt: new Date().toISOString(),
    ...(cache ? { cache } : {}),
  };
}

export function success<T>(data: T, cache?: { hit: boolean; ttlSeconds: number }): ApiSuccess<T> {
  return { ok: true, data, meta: makeMeta(cache) };
}

export function failure(code: ApiErrorCode, message: string, details?: Record<string, unknown>): ApiError {
  return {
    ok: false,
    error: { code, message, ...(details ? { details } : {}) },
    meta: { requestId: requestId() },
  };
}

/** HTTP 상태 매핑 */
export const ERROR_STATUS: Record<ApiErrorCode, number> = {
  INDEX_NOT_FOUND: 404,
  INVALID_QUERY: 400,
  INVALID_BODY: 400,
  INTERNAL_ERROR: 500,
};
