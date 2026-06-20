"use client";

/**
 * MVP 관리자 게이트 — 실제 인증은 백엔드 연동 시 교체.
 * 현재는 localStorage 플래그만 사용하는 목업이다(보호 데이터 없음).
 */
const KEY = "nmgr_admin";

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}

export function signInAdmin() {
  window.localStorage.setItem(KEY, "1");
}

export function signOutAdmin() {
  window.localStorage.removeItem(KEY);
}
