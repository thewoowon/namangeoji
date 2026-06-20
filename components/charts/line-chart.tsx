"use client";

import { useMemo, useState } from "react";
import type { SeriesPoint, TriggerEvent } from "@/lib/types";
import { formatDateKST } from "@/lib/format";

type Range = "7D" | "30D";

/** 이벤트 마커가 찍힌 라인 차트. 모바일 tap / 데스크탑 hover 툴팁 (spec §6.3.6) */
export function LineChartWithEvents({
  series,
  events,
  color,
}: {
  series: SeriesPoint[];
  events: TriggerEvent[];
  color: string;
}) {
  const [range, setRange] = useState<Range>("30D");
  const [active, setActive] = useState<number | null>(null);

  const data = useMemo(
    () => (range === "7D" ? series.slice(-7) : series),
    [series, range],
  );

  const W = 720;
  const H = 240;
  const padX = 12;
  const padTop = 20;
  const padBottom = 28;

  const scores = data.map((d) => d.score);
  const min = Math.max(0, Math.min(...scores) - 6);
  const max = Math.min(100, Math.max(...scores) + 6);
  const span = max - min || 1;

  const x = (i: number) => padX + (i / (data.length - 1)) * (W - padX * 2);
  const y = (s: number) => padTop + (1 - (s - min) / span) * (H - padTop - padBottom);

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.score).toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${x(data.length - 1).toFixed(1)},${H - padBottom} L${x(0).toFixed(1)},${H - padBottom} Z`;

  // 이벤트를 가장 가까운 날짜 인덱스에 매핑
  const eventMarkers = events
    .map((e) => {
      const t = new Date(e.occurredAt).getTime();
      let best = -1;
      let bestDiff = Infinity;
      data.forEach((d, i) => {
        const diff = Math.abs(new Date(d.observedAt).getTime() - t);
        if (diff < bestDiff) {
          bestDiff = diff;
          best = i;
        }
      });
      return { event: e, index: best };
    })
    .filter((m) => m.index >= 0);

  function handleMove(clientX: number, target: SVGSVGElement) {
    const rect = target.getBoundingClientRect();
    const rel = ((clientX - rect.left) / rect.width) * W;
    const i = Math.round(((rel - padX) / (W - padX * 2)) * (data.length - 1));
    setActive(Math.max(0, Math.min(data.length - 1, i)));
  }

  const activePoint = active !== null ? data[active] : null;
  const gid = `line-${color.replace(/[^a-z0-9]/gi, "")}-${range}`;

  return (
    <div>
      <div className="mb-3 flex gap-1.5">
        {(["7D", "30D"] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => {
              setRange(r);
              setActive(null);
            }}
            className={`rounded-lg px-3 py-1 text-[12px] font-semibold transition-colors ${
              range === r ? "bg-bg-elevated text-text-primary" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {r}
          </button>
        ))}
        <span className="ml-auto self-center text-[11px] text-text-muted">90D · 1Y는 데이터 연동 후 제공</span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none"
        onMouseMove={(e) => handleMove(e.clientX, e.currentTarget)}
        onMouseLeave={() => setActive(null)}
        onTouchStart={(e) => handleMove(e.touches[0].clientX, e.currentTarget)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX, e.currentTarget)}
        role="img"
        aria-label={`${range} 추이 차트`}
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 가로 기준선 */}
        {[0, 0.5, 1].map((t) => {
          const gy = padTop + t * (H - padTop - padBottom);
          return <line key={t} x1={padX} x2={W - padX} y1={gy} y2={gy} stroke="var(--border)" strokeWidth="1" strokeOpacity="0.6" />;
        })}

        <path d={areaPath} fill={`url(#${gid})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />

        {/* 이벤트 마커 */}
        {eventMarkers.map((m) => (
          <g key={m.event.id}>
            <line x1={x(m.index)} x2={x(m.index)} y1={padTop} y2={H - padBottom} stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
            <circle cx={x(m.index)} cy={H - padBottom} r="4" fill="var(--accent)" />
          </g>
        ))}

        {/* 활성 지점 */}
        {activePoint && active !== null ? (
          <g>
            <line x1={x(active)} x2={x(active)} y1={padTop} y2={H - padBottom} stroke={color} strokeWidth="1" strokeOpacity="0.5" />
            <circle cx={x(active)} cy={y(activePoint.score)} r="5" fill={color} stroke="var(--bg-base)" strokeWidth="2" />
          </g>
        ) : null}
      </svg>

      <div className="mt-2 min-h-[40px] rounded-lg bg-bg-elevated px-3 py-2 text-[12px]">
        {activePoint ? (
          <span className="text-text-secondary">
            <span className="text-text-muted">{formatDateKST(activePoint.observedAt)}</span>{" "}
            · 점수 <span className="tnum font-bold text-text-primary">{activePoint.score}</span>
          </span>
        ) : (
          <span className="text-text-muted">
            차트를 누르거나 마우스를 올리면 해당 시점의 점수가 표시됩니다. ◆ 표시는 트리거 이벤트입니다.
          </span>
        )}
      </div>
    </div>
  );
}
