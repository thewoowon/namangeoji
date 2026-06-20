"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TOP_NAV } from "./nav-items";
import { SITE } from "@/lib/site";
import { formatDateKST } from "@/lib/format";

export function AppHeader() {
  const pathname = usePathname();
  // 관리자 화면은 자체 크롬을 사용 (spec §14.2)
  if (pathname.startsWith("/admin")) return null;
  return (
    <header className="sticky top-0 z-30 border-b border-border-base bg-bg-base/85 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <Link href="/today" className="flex items-baseline gap-2" aria-label="나만거지지수 홈">
          <span className="text-[17px] font-black tracking-tight text-text-primary">
            나만거지<span className="text-accent">지수</span>
          </span>
          <span className="hidden text-[11px] text-text-muted sm:inline">{SITE.tagline}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="주요 메뉴">
          {TOP_NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-[13px] transition-colors ${
                  active
                    ? "bg-bg-elevated font-semibold text-text-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <span className="tnum text-[12px] text-text-muted md:hidden">
          {formatDateKST(SITE.updatedAt).slice(5)}
        </span>
      </div>
    </header>
  );
}
