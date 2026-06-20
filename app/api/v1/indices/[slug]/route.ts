import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api/respond";
import { buildIndexDetail } from "@/lib/api/queries";

// spec §12.4 — GET /api/v1/indices/{slug}
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/v1/indices/[slug]">) {
  const { slug } = await ctx.params;
  const detail = buildIndexDetail(slug);
  if (!detail) return fail("INDEX_NOT_FOUND", "요청한 지수를 찾을 수 없습니다.", { slug });
  return ok(detail);
}
