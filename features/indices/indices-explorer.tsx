"use client";

import { useMemo, useState } from "react";
import type { CategoryCode, IndexSummary } from "@/lib/types";
import { CATEGORY_META } from "@/lib/levels";
import { IndexCard } from "@/components/index-card/index-card";

type SortKey = "score" | "delta1d" | "delta7d" | "confidence";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "score", label: "현재 점수" },
  { key: "delta1d", label: "전일 상승폭" },
  { key: "delta7d", label: "7일 상승폭" },
  { key: "confidence", label: "신뢰도" },
];

export function IndicesExplorer({ indices }: { indices: IndexSummary[] }) {
  const [category, setCategory] = useState<CategoryCode | "ALL">("ALL");
  const [sort, setSort] = useState<SortKey>("score");

  const categories = useMemo(() => {
    const present = new Set(indices.map((i) => i.category));
    return (Object.keys(CATEGORY_META) as CategoryCode[]).filter((c) => present.has(c));
  }, [indices]);

  const filtered = useMemo(() => {
    const list = category === "ALL" ? indices : indices.filter((i) => i.category === category);
    return [...list].sort((a, b) => b[sort] - a[sort]);
  }, [indices, category, sort]);

  return (
    <div>
      {/* 카테고리 필터 */}
      <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        <Chip active={category === "ALL"} onClick={() => setCategory("ALL")}>
          전체
        </Chip>
        {categories.map((cat) => (
          <Chip key={cat} active={category === cat} onClick={() => setCategory(cat)}>
            {CATEGORY_META[cat].short}
          </Chip>
        ))}
      </div>

      {/* 정렬 */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[12px] text-text-muted">정렬</span>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-[12px] font-medium transition-colors ${
                sort === s.key ? "bg-bg-elevated text-text-primary" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[12px] text-text-muted">{filtered.length}개</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((idx, i) => (
          <IndexCard key={idx.slug} index={idx} rank={sort === "score" ? i + 1 : undefined} />
        ))}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${
        active
          ? "border-transparent bg-text-primary text-bg-base"
          : "border-border-base bg-bg-surface text-text-secondary hover:border-border-strong"
      }`}
    >
      {children}
    </button>
  );
}
