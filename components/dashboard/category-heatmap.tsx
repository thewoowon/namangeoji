import Link from "next/link";
import type { CategoryScore } from "@/lib/types";
import { scoreToLevel, LEVEL_META } from "@/lib/levels";
import { CATEGORY_SLUG } from "@/lib/categories";
import { DeltaBadge } from "@/components/common/badges";

export function CategoryHeatmap({ categories }: { categories: CategoryScore[] }) {
  return (
    <div className="space-y-2">
      {categories.map((cat) => {
        const meta = LEVEL_META[scoreToLevel(cat.score)];
        const slug = CATEGORY_SLUG[cat.code as keyof typeof CATEGORY_SLUG];
        return (
          <Link
            key={cat.code}
            href={`/categories/${slug}`}
            className="flex items-center gap-3 rounded-xl border border-border-base bg-bg-surface px-3 py-2.5 transition-colors hover:border-border-strong"
          >
            <span className="w-16 shrink-0 text-[13px] font-semibold text-text-secondary">{cat.name}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-bg-elevated" role="img" aria-label={`${cat.name} ${cat.score}점`}>
              <div className="h-full rounded-full" style={{ width: `${cat.score}%`, background: meta.colorVar }} />
            </div>
            <span className="tnum w-7 shrink-0 text-right text-[13px] font-bold" style={{ color: meta.colorVar }}>
              {cat.score}
            </span>
            <span className="w-10 shrink-0 text-right">
              <DeltaBadge delta={cat.delta1d} />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
