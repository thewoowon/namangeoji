import { LEVEL_META, scoreToLevel } from "@/lib/levels";

/** 반원 아크 게이지 — 점수 시각화 (색상 + 숫자 + 레벨 라벨 동반, spec §14.8) */
export function ScoreGauge({ score, size = 200 }: { score: number; size?: number }) {
  const level = scoreToLevel(score);
  const meta = LEVEL_META[level];
  const r = size / 2 - 14;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = Math.PI * r; // 반원

  const arc = (color: string, value: number, opacity = 1) => (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="none"
      stroke={color}
      strokeOpacity={opacity}
      strokeWidth={14}
      strokeLinecap="round"
      strokeDasharray={`${(value / 100) * circumference} ${circumference * 2}`}
      transform={`rotate(180 ${cx} ${cy})`}
    />
  );

  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + 16} viewBox={`0 0 ${size} ${size / 2 + 16}`} aria-hidden>
        {arc("var(--border-strong)", 100, 0.5)}
        {arc(meta.colorVar, score)}
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <div className="flex items-baseline gap-1">
          <span className="tnum text-5xl font-black leading-none" style={{ color: meta.colorVar }}>
            {score}
          </span>
          <span className="text-base font-medium text-text-muted">/ 100</span>
        </div>
        <span className="mt-1 text-sm font-bold" style={{ color: meta.colorVar }}>
          {meta.label}
        </span>
      </div>
    </div>
  );
}
