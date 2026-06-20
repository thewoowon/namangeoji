import { getIndices } from "@/lib/api/client";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminIndicesTable } from "@/features/admin/admin-indices-table";

export default async function AdminIndicesPage() {
  const { items } = await getIndices({ limit: 100, sort: "score" });
  return (
    <div>
      <AdminPageHeader title="지수 관리" description="지수 활성/비활성을 전환합니다. 생성·수정은 백엔드 연동 시 추가됩니다." />
      <AdminIndicesTable indices={items} />
    </div>
  );
}
