import { ok } from "@/lib/api/respond";
import { buildEvents } from "@/lib/api/queries";

// GET /api/v1/events — 트리거 이벤트 타임라인
export function GET() {
  return ok(buildEvents());
}
