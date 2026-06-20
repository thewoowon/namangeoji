"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInAdmin } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // MVP 목업: 입력값 검증 없이 통과 (실제 인증은 백엔드 연동 시)
    signInAdmin();
    router.replace("/admin/dashboard");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-border-base bg-bg-surface p-6">
        <div className="mb-1 text-[18px] font-black text-text-primary">
          나만거지<span className="text-accent">지수</span>
        </div>
        <p className="mb-5 text-[12px] text-text-muted">관리자 콘솔 로그인</p>

        <label className="mb-1 block text-[12px] text-text-secondary">이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@namangeoji.kr"
          className="mb-3 w-full rounded-xl border border-border-base bg-bg-base px-3 py-2.5 text-[13px] text-text-primary outline-none focus:border-border-strong"
        />
        <label className="mb-1 block text-[12px] text-text-secondary">비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="mb-5 w-full rounded-xl border border-border-base bg-bg-base px-3 py-2.5 text-[13px] text-text-primary outline-none focus:border-border-strong"
        />
        <button
          type="submit"
          className="h-11 w-full rounded-xl bg-accent text-[13px] font-bold text-black transition-opacity hover:opacity-90"
        >
          로그인
        </button>
        <p className="mt-3 text-center text-[11px] text-text-muted">
          MVP 목업 — 아무 값이나 입력해도 진입합니다.
        </p>
      </form>
    </div>
  );
}
