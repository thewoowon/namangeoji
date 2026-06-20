import type { SeriesPoint } from "@/lib/types";

/** 의존성 없는 경량 SVG 스파크라인 (spec §14.9 번들 목표) */
export function Sparkline({
  data,
  width = 96,
  height = 28,
  color = "var(--text-secondary)",
  strokeWidth = 1.5,
}: {
  data: SeriesPoint[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}) {
  if (data.length < 2) return null;
  const scores = data.map((d) => d.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const span = max - min || 1;
  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * w;
    const y = pad + (1 - (d.score - min) / span) * h;
    return [x, y] as const;
  });

  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${height} L${pts[0][0].toFixed(1)},${height} Z`;
  const gid = `spark-${Math.round(pts[0][1] * 100)}-${data.length}-${Math.round(max)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`최근 ${data.length}일 추이`}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
