"use client";

import { useState } from "react";
import type { SignalComponent } from "@/lib/types";
import { SignalContributionTable } from "@/components/index-card/signal-contribution-table";

export interface SignalIndex {
  slug: string;
  name: string;
  components: SignalComponent[];
}

export function AdminSignals({ indices }: { indices: SignalIndex[] }) {
  const [slug, setSlug] = useState(indices[0]?.slug ?? "");
  const current = indices.find((i) => i.slug === slug) ?? indices[0];

  return (
    <div>
      <label className="mb-1.5 block text-[12px] text-text-secondary">지수 선택</label>
      <select
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="mb-5 w-full max-w-sm rounded-xl border border-border-base bg-bg-base px-3 py-2.5 text-[13px] text-text-primary outline-none focus:border-border-strong"
      >
        {indices.map((i) => (
          <option key={i.slug} value={i.slug}>
            {i.name}
          </option>
        ))}
      </select>

      {current ? (
        <>
          <h2 className="mb-3 text-[15px] font-bold text-text-primary">{current.name} · 신호 분해</h2>
          <SignalContributionTable components={current.components} />
          <p className="mt-2 text-[11px] text-text-muted">
            ‘준비 중’ 신호는 점수 산출에서 제외됩니다. 가중치 조정은 가중치 메뉴에서 합니다.
          </p>
        </>
      ) : null}
    </div>
  );
}
