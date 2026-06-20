import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api/respond";
import { buildSeries, parseRange } from "@/lib/api/queries";

// spec §12.5 — GET /api/v1/indices/{slug}/series?range&interval
export async function GET(request: NextRequest, ctx: RouteContext<"/api/v1/indices/[slug]/series">) {
  const { slug } = await ctx.params;
  const range = parseRange(request.nextUrl.searchParams);
  const payload = buildSeries(slug, range);
  if (!payload) return fail("INDEX_NOT_FOUND", "요청한 지수를 찾을 수 없습니다.", { slug });
  return ok(payload);
}
