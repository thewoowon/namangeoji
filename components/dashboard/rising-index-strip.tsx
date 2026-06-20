import Link from "next/link";
import type { IndexSummary } from "@/lib/types";
import { DeltaBadge } from "@/components/common/badges";

export function RisingIndexStrip({ indices }: { indices: IndexSummary[] }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {indices.map((idx, i) => (
        <Link
          key={idx.slug}
          href={`/indices/${idx.slug}`}
          className="flex items-center gap-3 rounded-xl border border-border-base bg-bg-surface px-3 py-2.5 transition-colors hover:border-border-strong"
        >
          <span className="tnum text-lg font-black text-text-muted">{i + 1}</span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-text-primary">{idx.shortName}</div>
            <div className="tnum text-[11px] text-text-muted">{idx.score}점</div>
          </div>
          <DeltaBadge delta={idx.delta1d} />
        </Link>
      ))}
    </div>
  );
}
