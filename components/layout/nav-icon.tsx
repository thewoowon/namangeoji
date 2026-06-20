type IconName = "today" | "indices" | "compare" | "timeline" | "methodology";

const PATHS: Record<IconName, string> = {
  today: "M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4M12 8a4 4 0 100 8 4 4 0 000-8z",
  indices: "M4 19V5M4 19h16M8 19v-6M12 19v-9M16 19v-4M20 19v-11",
  compare: "M6 4v16M18 4v16M6 9h6M18 14h-6",
  timeline: "M5 4v16M5 7h6M5 12h10M5 17h7M11 7h.01M15 12h.01M12 17h.01",
  methodology: "M7 4h7l4 4v12H7zM14 4v4h4M9.5 13h5M9.5 16h3",
};

export function NavIcon({ name, active }: { name: IconName; active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.1 : 1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
