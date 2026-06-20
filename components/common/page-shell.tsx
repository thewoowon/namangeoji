import Link from "next/link";

export function PageShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-5 md:px-6 md:py-8">
      <div className="mb-5 md:mb-7">
        <h1 className="text-xl font-black tracking-tight text-text-primary md:text-2xl">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-text-secondary md:text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[15px] font-bold text-text-primary">{title}</h2>
      {action ? (
        <Link href={action.href} className="text-[12px] text-text-muted hover:text-text-secondary">
          {action.label} →
        </Link>
      ) : null}
    </div>
  );
}
