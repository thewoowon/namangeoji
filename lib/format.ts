/** delta 포맷: 양수 ▲, 음수 ▼, 0 — (spec §14.8 색상만으로 표현 금지 → 기호 동반) */
export function formatDelta(delta: number): { text: string; sign: "up" | "down" | "flat" } {
  if (delta > 0) return { text: `▲${Math.abs(delta).toFixed(0)}`, sign: "up" };
  if (delta < 0) return { text: `▼${Math.abs(delta).toFixed(0)}`, sign: "down" };
  return { text: "— 0", sign: "flat" };
}

const KST = "Asia/Seoul";

export function formatDateTimeKST(iso: string): string {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    timeZone: KST,
  }).format(d);
  const time = new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: KST,
  }).format(d);
  return `${date} ${time}`;
}

export function formatTimeKST(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: KST,
  }).format(new Date(iso));
}

export function formatDateKST(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: KST,
  })
    .format(new Date(iso))
    .replace(/\.\s*$/, "");
}
