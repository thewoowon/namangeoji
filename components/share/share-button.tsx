"use client";

import { useState } from "react";

/**
 * spec §6.1.5 / §15 — 공유 CTA.
 * MVP: Web Share API 지원 시 네이티브 공유, 미지원 시 링크 복사로 폴백.
 * (이미지 카드 서버 생성은 백엔드 연동 단계에서 /api/v1/share-cards 로 대체)
 */
export function ShareButton({
  title,
  text,
  path,
  variant = "icon",
  className = "",
}: {
  title: string;
  text: string;
  path: string;
  variant?: "icon" | "full";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}${path}?utm_source=share_card`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        /* 사용자가 취소 — 폴백으로 진행 */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  }

  if (variant === "full") {
    return (
      <button
        onClick={handleShare}
        className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-bold text-black transition-opacity hover:opacity-90 ${className}`}
      >
        <ShareIcon />
        {copied ? "링크 복사됨" : "공유 카드 만들기"}
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      aria-label="공유하기"
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary ${className}`}
    >
      {copied ? <CheckIcon /> : <ShareIcon />}
    </button>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
