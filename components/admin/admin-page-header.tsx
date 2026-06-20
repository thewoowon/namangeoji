export function AdminPageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5">
      <h1 className="text-xl font-black tracking-tight text-text-primary">{title}</h1>
      {description ? <p className="mt-1 text-[13px] text-text-secondary">{description}</p> : null}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border-base bg-bg-surface p-4">
      <div className="text-[12px] text-text-muted">{label}</div>
      <div className="tnum mt-1 text-2xl font-black text-text-primary">{value}</div>
      {hint ? <div className="mt-0.5 text-[11px] text-text-muted">{hint}</div> : null}
    </div>
  );
}
