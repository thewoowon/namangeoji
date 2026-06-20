import { ok } from "@/lib/api/respond";
import { buildToday } from "@/lib/api/queries";

// spec §12.2 — GET /api/v1/today
export function GET() {
  return ok(buildToday());
}
