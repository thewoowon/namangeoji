"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAdminAuthed, signOutAdmin } from "@/lib/admin-auth";

/** localStorage 인증 플래그를 외부 스토어로 구독 (effect-setState 없이 SSR 안전) */
function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}
function useAdminAuthed(): boolean {
  return useSyncExternalStore(subscribe, () => isAdminAuthed(), () => false);
}

const MENU = [
  { label: "대시보드", href: "/admin/dashboard" },
  { label: "지수", href: "/admin/indices" },
  { label: "신호", href: "/admin/signals" },
  { label: "이벤트", href: "/admin/events" },
  { label: "가중치", href: "/admin/weights" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";
  const authed = useAdminAuthed();
  // 마운트 후에만 리다이렉트(서버 스냅샷 false로 인한 오리다이렉트 방지)
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
  }, []);
  useEffect(() => {
    if (mounted.current && !authed && !isLogin) router.replace("/admin/login");
  }, [authed, isLogin, router]);

  // 로그인 페이지는 크롬 없이 그대로
  if (isLogin) return <div className="min-h-dvh bg-bg-base">{children}</div>;

  if (!authed) {
    return <div className="flex min-h-dvh items-center justify-center text-text-muted">로그인이 필요합니다…</div>;
  }

  return (
    <div className="min-h-dvh bg-bg-base md:flex">
      {/* 사이드바 (데스크탑) */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border-base bg-bg-surface p-4 md:flex">
        <div className="mb-6 px-2">
          <div className="text-[15px] font-black text-text-primary">
            나만거지<span className="text-accent">지수</span>
          </div>
          <div className="text-[11px] text-text-muted">관리자 콘솔</div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {MENU.map((m) => {
            const active = pathname === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`rounded-lg px-3 py-2 text-[13px] transition-colors ${
                  active ? "bg-bg-elevated font-semibold text-text-primary" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {m.label}
              </Link>
            );
          })}
        </nav>
        <AdminFooter router={router} />
      </aside>

      {/* 모바일 상단 탭 */}
      <div className="border-b border-border-base bg-bg-surface md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-[14px] font-bold text-text-primary">관리자 콘솔</span>
          <button
            onClick={() => {
              signOutAdmin();
              router.replace("/admin/login");
            }}
            className="text-[12px] text-text-muted"
          >
            로그아웃
          </button>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2">
          {MENU.map((m) => {
            const active = pathname === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[12.5px] ${
                  active ? "bg-bg-elevated font-semibold text-text-primary" : "text-text-secondary"
                }`}
              >
                {m.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}

function AdminFooter({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <div className="mt-4 border-t border-border-base pt-3">
      <Link href="/today" className="block px-3 py-1.5 text-[12px] text-text-muted hover:text-text-secondary">
        ← 서비스로
      </Link>
      <button
        onClick={() => {
          signOutAdmin();
          router.replace("/admin/login");
        }}
        className="px-3 py-1.5 text-[12px] text-text-muted hover:text-text-secondary"
      >
        로그아웃
      </button>
    </div>
  );
}
