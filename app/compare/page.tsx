import type { Metadata } from "next";
import { getIndices, getCompare } from "@/lib/api/client";
import { PageShell } from "@/components/common/page-shell";
import { CompareBoard } from "@/features/compare/compare-board";

export const metadata: Metadata = {
  title: "지수 비교",
  description: "서로 다른 생활형 포비아의 강도와 흐름을 정규화된 점수로 비교하세요.",
};

// spec §6.4.2 — MVP 기본 비교 세트
const DEFAULT_SET = [
  "semiconductor-fomo",
  "seoul-housing-lockout",
  "bitcoin-fomo",
  "salary-powerlessness",
  "ai-replacement",
];

export default async function ComparePage() {
  const { items } = await getIndices({ limit: 100 });
  const options = items.map((i) => ({ slug: i.slug, shortName: i.shortName }));
  const initialSlugs = DEFAULT_SET.filter((s) => options.some((o) => o.slug === s));
  const initialData = await getCompare(initialSlugs, "30d");

  return (
    <PageShell
      title="지수 비교"
      description="최대 5개 지수를 골라 강도와 흐름을 비교합니다. 점수는 0~100으로 정규화되며, 기간 변경 시 /api/v1/compare에서 다시 불러옵니다."
    >
      <CompareBoard options={options} initialSlugs={initialSlugs} initialData={initialData} />
    </PageShell>
  );
}
