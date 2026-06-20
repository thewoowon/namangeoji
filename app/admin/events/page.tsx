import { getEvents, getIndices } from "@/lib/api/client";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEvents } from "@/features/admin/admin-events";

export default async function AdminEventsPage() {
  const [events, { items }] = await Promise.all([getEvents(), getIndices({ limit: 100 })]);
  const indexOptions = items.map((i) => ({ slug: i.slug, name: i.name }));

  return (
    <div>
      <AdminPageHeader title="이벤트 관리" description="자동 감지 이전 단계의 수동 트리거 이벤트를 등록합니다." />
      <AdminEvents initialEvents={events} indexOptions={indexOptions} />
    </div>
  );
}
