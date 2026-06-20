import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fail } from "@/lib/api/respond";
import { success } from "@/lib/api/envelope";
import { buildShareCard, parseShareCardBody } from "@/lib/api/queries";

// spec §12.7 — POST /api/v1/share-cards
export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return fail("INVALID_BODY", "요청 본문이 올바른 JSON이 아닙니다.");
  }

  const parsed = parseShareCardBody(raw);
  if (!parsed) {
    return fail("INVALID_BODY", "type 필드가 필요합니다.", {
      allowed: ["today_summary", "index_detail", "top5", "rising", "compare"],
    });
  }

  const payload = buildShareCard(parsed, request.nextUrl.origin);
  // 생성 리소스이므로 201
  return NextResponse.json(success(payload), { status: 201 });
}
