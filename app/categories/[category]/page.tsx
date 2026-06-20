import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getIndices } from "@/lib/api/client";
import { CATEGORY_META } from "@/lib/levels";
import { CATEGORY_SLUG, SLUG_TO_CATEGORY } from "@/lib/categories";
import { PageShell } from "@/components/common/page-shell";
import { IndexCard } from "@/components/index-card/index-card";

export function generateStaticParams() {
  return Object.values(CATEGORY_SLUG).map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps<"/categories/[category]">): Promise<Metadata> {
  const { category } = await params;
  const code = SLUG_TO_CATEGORY[category];
  return { title: code ? CATEGORY_META[code].name : "카테고리" };
}

export default async function CategoryPage({ params }: PageProps<"/categories/[category]">) {
  const { category } = await params;
  const code = SLUG_TO_CATEGORY[category];
  if (!code) notFound();

  const { items: indices } = await getIndices({ category: code, limit: 100 });
  const meta = CATEGORY_META[code];

  return (
    <PageShell title={meta.name} description={`${meta.name} 관련 생활형 포비아 지수 ${indices.length}개입니다.`}>
      {indices.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {indices.map((idx, i) => (
            <IndexCard key={idx.slug} index={idx} rank={i + 1} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-border-base bg-bg-surface px-4 py-6 text-center text-[13px] text-text-muted">
          이 카테고리의 지수는 MVP에서 간접 반영되며, 곧 추가될 예정입니다.
        </p>
      )}
    </PageShell>
  );
}
