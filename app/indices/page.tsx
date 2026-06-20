import type { Metadata } from "next";
import { getIndices } from "@/lib/api/client";
import { PageShell } from "@/components/common/page-shell";
import { IndicesExplorer } from "@/features/indices/indices-explorer";

export const metadata: Metadata = {
  title: "전체 지수",
  description: "자산·주거·일·생활비·노후·기술 등 한국인의 생활형 포비아 12개 지수를 탐색하세요.",
};

export default async function IndicesPage() {
  const { items: indices } = await getIndices({ limit: 100 });
  return (
    <PageShell
      title="전체 지수"
      description="모든 생활형 포비아를 카테고리·정렬로 탐색하세요. 각 카드를 누르면 산식과 신호 분해를 볼 수 있습니다."
    >
      <IndicesExplorer indices={indices} />
    </PageShell>
  );
}
