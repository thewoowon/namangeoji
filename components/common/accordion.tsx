"use client";

import { useState } from "react";

/** spec §14.6 — 데이터 설명은 처음부터 길게 노출하지 않고 accordion으로 접는다 */
export function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-border-base bg-bg-surface">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="text-[14px] font-bold text-text-primary">{title}</span>
        <span
          className="text-text-muted transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
          aria-hidden
        >
          ▾
        </span>
      </button>
      {open ? <div className="border-t border-border-base px-4 py-4">{children}</div> : null}
    </div>
  );
}
