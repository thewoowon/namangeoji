import type { Metadata } from "next";
import { getCategories } from "@/lib/api/client";
import { PageShell } from "@/components/common/page-shell";
import { CategoryHeatmap } from "@/components/dashboard/category-heatmap";

export const metadata: Metadata = {
  title: "카테고리",
  description: "자산·주거·일/소득·생활비·노후·기술·계층이동 — 카테고리별 생활형 불안 온도를 비교하세요.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <PageShell
      title="카테고리별 불안 온도"
      description="7개 카테고리의 평균 점수입니다. 카테고리를 누르면 해당 지수만 모아 볼 수 있습니다."
    >
      <CategoryHeatmap categories={categories} />
    </PageShell>
  );
}
