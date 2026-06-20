import Link from "next/link";
import type { TriggerEvent } from "@/lib/types";
import { formatTimeKST } from "@/lib/format";

const EVENT_TYPE_LABEL: Record<TriggerEvent["type"], string> = {
  ASSET_PRICE: "자산가격",
  POLICY: "정책",
  NEWS: "뉴스",
  SEARCH_SPIKE: "검색급등",
  DISCLOSURE: "공시",
  REAL_ESTATE: "부동산",
  MACRO: "거시경제",
};

export function TriggerEventList({ events, compact = false }: { events: TriggerEvent[]; compact?: boolean }) {
  return (
    <ul className="space-y-2">
      {events.map((e) => {
        const up = e.impactDirection === "UP";
        return (
          <li
            key={e.id}
            className="rounded-xl border border-border-base bg-bg-surface px-3.5 py-3"
          >
            <div className="flex items-center gap-2">
              <span className="tnum text-[11px] text-text-muted">{formatTimeKST(e.occurredAt)}</span>
              <span className="rounded bg-bg-elevated px-1.5 py-0.5 text-[10.5px] font-medium text-text-secondary">
                {EVENT_TYPE_LABEL[e.type]}
              </span>
              <span
                className="ml-auto text-[11px] font-semibold"
                style={{ color: up ? "var(--delta-up)" : "var(--delta-down)" }}
              >
                {up ? "▲ 상승 압력" : "▼ 완화"}
              </span>
            </div>
            <p className="mt-1.5 text-[13px] font-semibold text-text-primary">{e.title}</p>
            {!compact ? (
              <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">{e.description}</p>
            ) : null}
            {!compact && e.relatedIndexSlugs.length ? (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {e.relatedIndexSlugs.map((slug) => (
                  <Link
                    key={slug}
                    href={`/indices/${slug}`}
                    className="rounded-md bg-bg-elevated px-1.5 py-0.5 text-[11px] text-text-secondary hover:text-text-primary"
                  >
                    #{slug}
                  </Link>
                ))}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
