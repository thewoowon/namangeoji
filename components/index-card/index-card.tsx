import Link from "next/link";
import type { IndexSummary } from "@/lib/types";
import { LEVEL_META } from "@/lib/levels";
import { CategoryBadge, ConfidenceBadge, DeltaBadge, StatusBadge, UpdatedAtText } from "@/components/common/badges";
import { Sparkline } from "@/components/charts/sparkline";
import { ShareButton } from "@/components/share/share-button";

export function IndexCard({ index, rank }: { index: IndexSummary; rank?: number }) {
  const meta = LEVEL_META[index.level];
  return (
    <Link
      href={`/indices/${index.slug}`}
      className="group block rounded-2xl border border-border-base bg-bg-surface p-4 transition-colors hover:border-border-strong"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {rank ? <span className="tnum text-[13px] font-bold text-text-muted">{rank}</span> : null}
          <CategoryBadge category={index.category} />
          <StatusBadge level={index.level} size="sm" />
        </div>
        <ShareButton
          title={`${index.name} ${index.score}점`}
          text={index.summary}
          path={`/indices/${index.slug}`}
        />
      </div>

      <div className="mt-2.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-bold text-text-primary">{index.name}</h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="tnum text-2xl font-black" style={{ color: meta.colorVar }}>
              {index.score}
            </span>
            <DeltaBadge delta={index.delta1d} suffix="1일" />
          </div>
        </div>
        <div className="shrink-0 pt-1">
          <Sparkline data={index.sparkline} color={meta.colorVar} />
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-text-secondary">
        {index.summary}
      </p>

      <div className="mt-2.5 flex items-center justify-between">
        <ConfidenceBadge value={index.confidence} />
        <UpdatedAtText iso={index.updatedAt} />
      </div>
    </Link>
  );
}
