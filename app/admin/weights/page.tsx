import { getCategories } from "@/lib/api/client";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminWeights } from "@/features/admin/admin-weights";

export default async function AdminWeightsPage() {
  const categories = await getCategories();
  return (
    <div>
      <AdminPageHeader title="가중치 조정" description="종합지수 산식의 카테고리 가중치를 조정하고 결과를 미리 봅니다." />
      <AdminWeights categories={categories} />
    </div>
  );
}
