"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BOTTOM_NAV } from "./nav-items";
import { NavIcon } from "./nav-icon";

export function MobileBottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border-base bg-bg-base/95 backdrop-blur md:hidden"
      aria-label="하단 내비게이션"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-7xl items-stretch">
        {BOTTOM_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className="flex min-h-14 flex-col items-center justify-center gap-1 py-2"
                style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}
              >
                <NavIcon name={item.icon} active={active} />
                <span className="text-[11px] font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
