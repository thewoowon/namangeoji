import { ok } from "@/lib/api/respond";
import { buildCategories } from "@/lib/api/queries";

// GET /api/v1/categories — 카테고리별 평균 점수
export function GET() {
  return ok(buildCategories());
}
