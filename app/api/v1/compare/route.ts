import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api/respond";
import { buildCompare, parseCompareQuery } from "@/lib/api/queries";

// spec §12.6 — GET /api/v1/compare?indices=a,b,c&range=30d
export function GET(request: NextRequest) {
  const query = parseCompareQuery(request.nextUrl.searchParams);
  if (query.slugs.length === 0) {
    return fail("INVALID_QUERY", "비교할 지수를 indices 쿼리로 1개 이상 지정하세요.");
  }
  return ok(buildCompare(query));
}
