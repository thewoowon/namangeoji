"use client";

import { useMemo, useState } from "react";
import type { CategoryCode, CategoryScore } from "@/lib/types";
import { CATEGORY_META, LEVEL_META, scoreToLevel } from "@/lib/levels";

// spec §7.1.2 초기 가중치
const INITIAL: Record<CategoryCode, number> = {
  ASSET: 0.3,
  HOUSING: 0.22,
  LIVING_COST: 0.14,
  WORK_INCOME: 0.12,
  RETIREMENT: 0.1,
  TECHNOLOGY: 0.07,
  SOCIAL_MOBILITY: 0.05,
};

export function AdminWeights({ categories }: { categories: CategoryScore[] }) {
  const [weights, setWeights] = useState<Record<CategoryCode, number>>(INITIAL);

  const scoreByCat = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.code, c.score])) as Record<CategoryCode, number>,
    [categories],
  );

  const codes = Object.keys(INITIAL) as CategoryCode[];
  const sum = codes.reduce((a, c) => a + weights[c], 0);

  // 가중 종합지수 미리보기 (가중치 합으로 정규화)
  const preview = useMemo(() => {
    let acc = 0;
    let w = 0;
    for (const code of codes) {
      const s = scoreByCat[code];
      if (s != null && s > 0) {
        acc += s * weights[code];
        w += weights[code];
      }
    }
    return Math.round(w > 0 ? acc / w : 0);
  }, [weights, scoreByCat, codes]);

  const previewLevel = scoreToLevel(preview);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-4 rounded-2xl border border-border-base bg-bg-surface p-5">
        {codes.map((code) => (
          <div key={code}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[13px] font-medium text-text-secondary">
                {CATEGORY_META[code].name}
                <span className="ml-2 text-[11px] text-text-muted">현재 {scoreByCat[code] ?? "—"}점</span>
              </span>
              <span className="tnum text-[13px] font-bold text-text-primary">{(weights[code] * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              value={Math.round(weights[code] * 100)}
              onChange={(e) =>
                setWeights((prev) => ({ ...prev, [code]: Number(e.target.value) / 100 }))
              }
              className="w-full accent-[color:var(--accent)]"
              aria-label={`${CATEGORY_META[code].name} 가중치`}
            />
          </div>
        ))}

        <div className="flex items-center justify-between border-t border-border-base pt-3">
          <span className="text-[12px] text-text-muted">가중치 합</span>
          <span className="tnum text-[13px] font-semibold" style={{ color: Math.abs(sum - 1) < 0.001 ? "var(--status-stable)" : "var(--status-caution)" }}>
            {(sum * 100).toFixed(0)}%
          </span>
        </div>
        <button
          onClick={() => setWeights(INITIAL)}
          className="text-[12px] text-text-muted hover:text-text-secondary"
        >
          기본값으로 초기화
        </button>
      </div>

      {/* 미리보기 */}
      <div className="rounded-2xl border border-border-base bg-bg-surface p-5 text-center">
        <div className="text-[12px] text-text-muted">예상 종합지수</div>
        <div className="tnum mt-2 text-6xl font-black" style={{ color: LEVEL_META[previewLevel].colorVar }}>
          {preview}
        </div>
        <div className="mt-1 text-[13px] font-bold" style={{ color: LEVEL_META[previewLevel].colorVar }}>
          {LEVEL_META[previewLevel].label}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-text-muted">
          가중치는 합으로 정규화되어 계산됩니다. 실제 반영은 백엔드 저장 후 methodology version을 올립니다.
        </p>
      </div>
    </div>
  );
}
