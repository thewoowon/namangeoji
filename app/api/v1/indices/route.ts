import type { NextRequest } from "next/server";
import { ok } from "@/lib/api/respond";
import { buildIndices, parseIndicesQuery } from "@/lib/api/queries";

// spec §12.3 — GET /api/v1/indices?category&sort&level&limit&offset
export function GET(request: NextRequest) {
  const query = parseIndicesQuery(request.nextUrl.searchParams);
  return ok(buildIndices(query));
}
