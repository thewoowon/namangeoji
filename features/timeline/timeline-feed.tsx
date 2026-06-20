"use client";

import { useMemo, useState } from "react";
import type { ImpactDirection, TriggerEvent } from "@/lib/types";
import { TriggerEventList } from "@/components/dashboard/trigger-event-list";

const TYPE_FILTERS: { value: TriggerEvent["type"] | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "ASSET_PRICE", label: "자산가격" },
  { value: "REAL_ESTATE", label: "부동산" },
  { value: "MACRO", label: "거시경제" },
  { value: "POLICY", label: "정책" },
  { value: "NEWS", label: "뉴스" },
];

export function TimelineFeed({ events }: { events: TriggerEvent[] }) {
  const [type, setType] = useState<TriggerEvent["type"] | "ALL">("ALL");
  const [direction, setDirection] = useState<ImpactDirection | "ALL">("ALL");

  const filtered = useMemo(
    () =>
      events.filter(
        (e) => (type === "ALL" || e.type === type) && (direction === "ALL" || e.impactDirection === direction),
      ),
    [events, type, direction],
  );

  return (
    <div>
      <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setType(f.value)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${
              type === f.value
                ? "border-transparent bg-text-primary text-bg-base"
                : "border-border-base bg-bg-surface text-text-secondary hover:border-border-strong"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mb-5 flex items-center gap-2">
        <span className="text-[12px] text-text-muted">영향 방향</span>
        {(["ALL", "UP", "DOWN"] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDirection(d)}
            className={`rounded-lg px-2.5 py-1 text-[12px] font-medium transition-colors ${
              direction === d ? "bg-bg-elevated text-text-primary" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {d === "ALL" ? "전체" : d === "UP" ? "상승" : "완화"}
          </button>
        ))}
        <span className="ml-auto text-[12px] text-text-muted">{filtered.length}건</span>
      </div>

      {filtered.length ? (
        <TriggerEventList events={filtered} />
      ) : (
        <p className="rounded-xl border border-border-base bg-bg-surface px-4 py-8 text-center text-[13px] text-text-muted">
          조건에 맞는 이벤트가 없습니다.
        </p>
      )}
    </div>
  );
}
