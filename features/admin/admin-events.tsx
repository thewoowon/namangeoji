"use client";

import { useState } from "react";
import type { EventType, ImpactDirection, TriggerEvent } from "@/lib/types";
import { formatDateTimeKST } from "@/lib/format";

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "ASSET_PRICE", label: "자산가격" },
  { value: "REAL_ESTATE", label: "부동산" },
  { value: "MACRO", label: "거시경제" },
  { value: "POLICY", label: "정책" },
  { value: "NEWS", label: "뉴스" },
  { value: "DISCLOSURE", label: "공시" },
  { value: "SEARCH_SPIKE", label: "검색급등" },
];

export function AdminEvents({
  initialEvents,
  indexOptions,
}: {
  initialEvents: TriggerEvent[];
  indexOptions: { slug: string; name: string }[];
}) {
  const [events, setEvents] = useState<TriggerEvent[]>(initialEvents);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<EventType>("NEWS");
  const [direction, setDirection] = useState<ImpactDirection>("UP");
  const [relatedSlug, setRelatedSlug] = useState(indexOptions[0]?.slug ?? "");

  function addEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const newEvent: TriggerEvent = {
      id: `evt-local-${Date.now()}`,
      type,
      title: title.trim(),
      description: description.trim(),
      occurredAt: new Date().toISOString(),
      impactDirection: direction,
      relatedIndexSlugs: relatedSlug ? [relatedSlug] : [],
      confidence: 60,
    };
    setEvents((prev) => [newEvent, ...prev]);
    setTitle("");
    setDescription("");
  }

  const inputCls =
    "w-full rounded-xl border border-border-base bg-bg-base px-3 py-2.5 text-[13px] text-text-primary outline-none focus:border-border-strong";

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      {/* 등록 폼 (spec §16.4) */}
      <form onSubmit={addEvent} className="space-y-3 rounded-2xl border border-border-base bg-bg-surface p-4">
        <h2 className="text-[14px] font-bold text-text-primary">트리거 이벤트 등록</h2>
        <div>
          <label className="mb-1 block text-[12px] text-text-secondary">제목</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="예: SK하이닉스 장중 신고가" />
        </div>
        <div>
          <label className="mb-1 block text-[12px] text-text-secondary">설명</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[12px] text-text-secondary">이벤트 타입</label>
            <select value={type} onChange={(e) => setType(e.target.value as EventType)} className={inputCls}>
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[12px] text-text-secondary">영향 방향</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value as ImpactDirection)} className={inputCls}>
              <option value="UP">상승</option>
              <option value="DOWN">완화</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[12px] text-text-secondary">관련 지수</label>
          <select value={relatedSlug} onChange={(e) => setRelatedSlug(e.target.value)} className={inputCls}>
            {indexOptions.map((o) => (
              <option key={o.slug} value={o.slug}>{o.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="h-10 w-full rounded-xl bg-accent text-[13px] font-bold text-black hover:opacity-90">
          등록 (로컬)
        </button>
        <p className="text-[11px] text-text-muted">MVP 목업 — 저장은 백엔드 연동 시. 새로고침하면 초기화됩니다.</p>
      </form>

      {/* 목록 */}
      <div className="space-y-2">
        {events.map((ev) => (
          <div key={ev.id} className="rounded-xl border border-border-base bg-bg-surface px-3.5 py-3">
            <div className="flex items-center gap-2">
              <span className="rounded bg-bg-elevated px-1.5 py-0.5 text-[10.5px] text-text-secondary">
                {EVENT_TYPES.find((t) => t.value === ev.type)?.label ?? ev.type}
              </span>
              <span
                className="text-[11px] font-semibold"
                style={{ color: ev.impactDirection === "UP" ? "var(--delta-up)" : "var(--delta-down)" }}
              >
                {ev.impactDirection === "UP" ? "▲ 상승" : "▼ 완화"}
              </span>
              <span className="tnum ml-auto text-[11px] text-text-muted">{formatDateTimeKST(ev.occurredAt)}</span>
            </div>
            <p className="mt-1.5 text-[13px] font-semibold text-text-primary">{ev.title}</p>
            {ev.description ? <p className="mt-0.5 text-[12px] text-text-secondary">{ev.description}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
