import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getToday, getIndexDetail } from "@/lib/api/client";
import { LEVEL_HEX, LEVEL_META, confidenceLabel } from "@/lib/levels";
import { loadOgFonts } from "@/lib/og/font";
import type { IndexLevel } from "@/lib/types";

export const runtime = "nodejs";

const SIZES: Record<string, { w: number; h: number }> = {
  og: { w: 1200, h: 630 },
  card: { w: 1080, h: 1350 },
  story: { w: 1080, h: 1920 },
};

interface CardModel {
  kicker: string;
  title: string;
  score: number;
  level: IndexLevel;
  summary: string;
  footnote: string;
}

async function resolveCard(type: string, slug: string | null): Promise<CardModel> {
  if (type === "index_detail" && slug) {
    const idx = await getIndexDetail(slug);
    if (idx) {
      return {
        kicker: "나만거지지수",
        title: idx.name,
        score: idx.score,
        level: idx.level,
        summary: idx.headline,
        footnote: `${confidenceLabel(idx.confidence).label} · namangeoji.kr`,
      };
    }
  }
  const today = await getToday();
  return {
    kicker: "오늘의 나만거지지수",
    title: "",
    score: today.composite.score,
    level: today.composite.level,
    summary: today.composite.summary,
    footnote: "2026.06.20 09:00 기준 · namangeoji.kr",
  };
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const type = sp.get("type") ?? "today_summary";
  const slug = sp.get("slug");
  const size = SIZES[sp.get("format") ?? "og"] ?? SIZES.og;

  const card = await resolveCard(type, slug);
  const color = LEVEL_HEX[card.level];
  const levelLabel = LEVEL_META[card.level].label;

  const allText =
    card.kicker + card.title + card.summary + card.footnote + levelLabel + "나만거지지수 / 100 점";
  const fonts = await loadOgFonts(allText);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0b0f",
          padding: 72,
          fontFamily: "Noto Sans KR",
          color: "#f3f4f8",
        }}
      >
        {/* 상단 글로우 */}
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -160,
            width: 480,
            height: 480,
            borderRadius: 480,
            backgroundColor: color,
            opacity: 0.18,
            display: "flex",
          }}
        />

        {/* 브랜드 */}
        <div style={{ display: "flex", alignItems: "center", fontSize: 30, color: "#a9adc0" }}>
          <span style={{ fontWeight: 700, color: "#f3f4f8" }}>나만거지</span>
          <span style={{ fontWeight: 700, color: "#ffb020" }}>지수</span>
        </div>

        {/* 본문 */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 34, color: "#a9adc0", marginBottom: 8 }}>
            {card.kicker}
          </div>
          {card.title ? (
            <div style={{ display: "flex", fontSize: 60, fontWeight: 700, marginBottom: 16 }}>
              {card.title}
            </div>
          ) : null}
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <span style={{ fontSize: 200, fontWeight: 700, lineHeight: 1, color }}>{card.score}</span>
            <span style={{ fontSize: 56, color: "#6b7088", marginLeft: 12, marginBottom: 28 }}>/ 100</span>
            <div
              style={{
                display: "flex",
                marginLeft: 28,
                marginBottom: 40,
                padding: "10px 28px",
                borderRadius: 999,
                backgroundColor: color,
                color: "#0a0b0f",
                fontSize: 40,
                fontWeight: 700,
              }}
            >
              {levelLabel}
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 38, color: "#d6d8e2", marginTop: 24, lineHeight: 1.4 }}>
            {card.summary}
          </div>
        </div>

        {/* 푸터 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 28, color: "#6b7088" }}>{card.footnote}</span>
          <span style={{ fontSize: 28, color: "#6b7088" }}>오늘의 벼락거지 날씨</span>
        </div>
      </div>
    ),
    {
      width: size.w,
      height: size.h,
      fonts: fonts.length ? fonts : undefined,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      },
    },
  );
}
