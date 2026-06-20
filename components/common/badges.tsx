import { CATEGORY_META, LEVEL_META, confidenceLabel } from "@/lib/levels";
import { formatDelta, formatTimeKST } from "@/lib/format";
import type { CategoryCode, IndexLevel } from "@/lib/types";

export function StatusBadge({ level, size = "md" }: { level: IndexLevel; size?: "sm" | "md" }) {
  const meta = LEVEL_META[level];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
      style={{ background: `color-mix(in srgb, ${meta.colorVar} 18%, transparent)`, color: meta.colorVar }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.colorVar }} aria-hidden />
      {meta.label}
    </span>
  );
}

export function DeltaBadge({ delta, suffix }: { delta: number; suffix?: string }) {
  const { text, sign } = formatDelta(delta);
  const color =
    sign === "up" ? "var(--delta-up)" : sign === "down" ? "var(--delta-down)" : "var(--text-muted)";
  return (
    <span className="tnum inline-flex items-center text-sm font-semibold" style={{ color }}>
      {text}
      {suffix ? <span className="ml-0.5 text-[11px] font-normal opacity-70">{suffix}</span> : null}
    </span>
  );
}

export function ConfidenceBadge({ value }: { value: number }) {
  const { label, colorVar } = confidenceLabel(value);
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: colorVar }} aria-hidden />
      {label}
    </span>
  );
}

export function CategoryBadge({ category }: { category: CategoryCode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-bg-elevated px-1.5 py-0.5 text-[11px] font-medium text-text-secondary">
      {CATEGORY_META[category].short}
    </span>
  );
}

export function UpdatedAtText({ iso }: { iso: string }) {
  return (
    <span className="text-[11px] text-text-muted">
      {formatTimeKST(iso)} 업데이트
    </span>
  );
}
