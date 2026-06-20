"use client";

import { useState } from "react";
import Link from "next/link";
import type { IndexSummary } from "@/lib/types";
import { CATEGORY_META, LEVEL_META } from "@/lib/levels";

export function AdminIndicesTable({ indices }: { indices: IndexSummary[] }) {
  // 로컬 활성/비활성 상태 (MVP — 저장은 백엔드 연동 시)
  const [inactive, setInactive] = useState<Set<string>>(new Set());

  function toggle(slug: string) {
    setInactive((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border-base">
      <table className="w-full min-w-[640px] text-left text-[12.5px]">
        <thead>
          <tr className="bg-bg-elevated text-text-muted">
            <th className="px-3 py-2.5 font-medium">지수</th>
            <th className="px-3 py-2.5 font-medium">코드</th>
            <th className="px-3 py-2.5 font-medium">카테고리</th>
            <th className="px-3 py-2.5 text-right font-medium">점수</th>
            <th className="px-3 py-2.5 text-center font-medium">활성</th>
            <th className="px-3 py-2.5 text-right font-medium">관리</th>
          </tr>
        </thead>
        <tbody>
          {indices.map((idx) => {
            const active = !inactive.has(idx.slug);
            return (
              <tr key={idx.slug} className="border-t border-border-base">
                <td className="px-3 py-2.5">
                  <span className={active ? "text-text-primary" : "text-text-muted line-through"}>{idx.name}</span>
                </td>
                <td className="px-3 py-2.5 font-mono text-[11px] text-text-secondary">{idx.code}</td>
                <td className="px-3 py-2.5 text-text-secondary">{CATEGORY_META[idx.category].short}</td>
                <td className="tnum px-3 py-2.5 text-right font-semibold" style={{ color: LEVEL_META[idx.level].colorVar }}>
                  {idx.score}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <button
                    onClick={() => toggle(idx.slug)}
                    role="switch"
                    aria-checked={active}
                    aria-label={`${idx.name} 활성 토글`}
                    className="inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors"
                    style={{ background: active ? "var(--status-stable)" : "var(--border-strong)" }}
                  >
                    <span
                      className="h-4 w-4 rounded-full bg-white transition-transform"
                      style={{ transform: active ? "translateX(16px)" : "translateX(0)" }}
                    />
                  </button>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <Link href={`/indices/${idx.slug}`} className="text-[12px] text-text-muted hover:text-text-secondary">
                    보기 →
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
