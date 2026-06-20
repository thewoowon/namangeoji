"use client";

import { useState } from "react";
import Link from "next/link";
import type { ApiResponse } from "@/lib/api/envelope";
import type { ComparePayload, CompareEntry } from "@/lib/api/queries";
import type { SeriesRange } from "@/lib/data";

const PALETTE = ["#ffb020", "#4aa3ff", "#3ba776", "#e6483d", "#a974ff"];
const MAX = 5;
const RANGES: SeriesRange[] = ["7d", "30d", "90d", "1y"];

export function CompareBoard({
  options,
  initialSlugs,
  initialData,
}: {
  options: { slug: string; shortName: string }[];
  initialSlugs: string[];
  initialData: ComparePayload;
}) {
  const [selected, setSelected] = useState<string[]>(initialSlugs);
  const [range, setRange] = useState<SeriesRange>(initialData.range);
  const [data, setData] = useState<ComparePayload>(initialData);
  const [loading, setLoading] = useState(false);

  // 선택/기간 변경 시 /api/v1/compare 에서 다시 불러온다 (사용자 인터랙션 기반)
  async function reload(nextSlugs: string[], nextRange: SeriesRange) {
    if (nextSlugs.length === 0) {
      setData({ range: nextRange, indices: [] });
      return;
    }
    setLoading(true);
    try {
      const res = (await fetch(`/api/v1/compare?indices=${nextSlugs.join(",")}&range=${nextRange}`).then((r) =>
        r.json(),
      )) as ApiResponse<ComparePayload>;
      if (res.ok) setData(res.data);
    } catch {
      /* 네트워크 오류 시 직전 데이터 유지 */
    } finally {
      setLoading(false);
    }
  }

  function toggle(slug: string) {
    const next = selected.includes(slug)
      ? selected.filter((s) => s !== slug)
      : selected.length >= MAX
        ? selected
        : [...selected, slug];
    if (next === selected) return;
    setSelected(next);
    reload(next, range);
  }

  function changeRange(next: SeriesRange) {
    setRange(next);
    reload(selected, next);
  }

  // 선택 순서대로 색상 매핑
  const ordered = selected
    .map((slug) => data.indices.find((e) => e.slug === slug))
    .filter((e): e is CompareEntry => !!e);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {options.map((o) => {
          const idx = selected.indexOf(o.slug);
          const active = idx >= 0;
          const disabled = !active && selected.length >= MAX;
          return (
            <button
              key={o.slug}
              onClick={() => toggle(o.slug)}
              disabled={disabled}
              className={`rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors disabled:opacity-40 ${
                active ? "border-transparent text-bg-base" : "border-border-base bg-bg-surface text-text-secondary hover:border-border-strong"
              }`}
              style={active ? { background: PALETTE[idx % PALETTE.length] } : undefined}
            >
              {o.shortName}
            </button>
          );
        })}
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-[12px] text-text-muted">기간</span>
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => changeRange(r)}
            className={`rounded-lg px-2.5 py-1 text-[12px] font-semibold uppercase transition-colors ${
              range === r ? "bg-bg-elevated text-text-primary" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {r}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-text-muted">
          {loading ? "불러오는 중…" : "0~100 정규화 · 최대 5개"}
        </span>
      </div>

      {ordered.length ? (
        <MultiLineChart series={ordered} />
      ) : (
        <p className="rounded-xl border border-border-base bg-bg-surface px-4 py-8 text-center text-[13px] text-text-muted">
          비교할 지수를 선택하세요.
        </p>
      )}

      <div className="mt-6 space-y-2">
        {ordered.map((e, i) => (
          <Link
            key={e.slug}
            href={`/indices/${e.slug}`}
            className="flex items-center gap-3 rounded-xl border border-border-base bg-bg-surface px-3.5 py-3 transition-colors hover:border-border-strong"
          >
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} aria-hidden />
            <span className="flex-1 text-[13px] font-semibold text-text-primary">{e.name}</span>
            <span className="tnum text-[15px] font-black text-text-primary">{e.score}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MultiLineChart({ series }: { series: CompareEntry[] }) {
  const W = 720;
  const H = 260;
  const padX = 14;
  const padY = 16;

  const len = Math.min(...series.map((s) => s.series.length));
  const x = (i: number) => padX + (i / (len - 1)) * (W - padX * 2);
  const y = (v: number) => padY + (1 - v / 100) * (H - padY * 2);

  const paths = series.map((s, idx) => {
    const pts = s.series.slice(-len);
    const d = pts
      .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.score).toFixed(1)}`)
      .join(" ");
    return { d, color: PALETTE[idx % PALETTE.length] };
  });

  return (
    <div className="rounded-2xl border border-border-base bg-bg-surface p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="지수 비교 차트">
        {[0, 25, 50, 75, 100].map((t) => (
          <g key={t}>
            <line x1={padX} x2={W - padX} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth="1" strokeOpacity="0.5" />
            <text x={padX} y={y(t) - 3} className="fill-text-muted text-[10px]">{t}</text>
          </g>
        ))}
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill="none" stroke={p.color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        ))}
      </svg>
    </div>
  );
}
