import { getAllSlugs } from "@/lib/data";
import { getIndexDetail } from "@/lib/api/client";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSignals, type SignalIndex } from "@/features/admin/admin-signals";

export default async function AdminSignalsPage() {
  const details = await Promise.all(getAllSlugs().map((s) => getIndexDetail(s)));
  const indices: SignalIndex[] = details
    .filter((d): d is NonNullable<typeof d> => !!d)
    .map((d) => ({ slug: d.slug, name: d.name, components: d.components }));

  return (
    <div>
      <AdminPageHeader title="신호 확인" description="지수별 입력 신호와 기여도를 점검합니다." />
      <AdminSignals indices={indices} />
    </div>
  );
}
