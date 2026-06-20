import { NextResponse } from "next/server";
import { ERROR_STATUS, failure, success, type ApiErrorCode } from "./envelope";

/** 성공 응답 + 캐시 헤더 (spec §11.3 — 캐시 응답에도 데이터 시각 표시) */
export function ok<T>(data: T, ttlSeconds = 300): NextResponse {
  const body = success(data, { hit: false, ttlSeconds });
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": `public, s-maxage=${ttlSeconds}, stale-while-revalidate=${ttlSeconds * 2}`,
    },
  });
}

export function fail(code: ApiErrorCode, message: string, details?: Record<string, unknown>): NextResponse {
  return NextResponse.json(failure(code, message, details), { status: ERROR_STATUS[code] });
}
