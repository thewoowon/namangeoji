import type { Metadata } from "next";
import { getEvents } from "@/lib/api/client";
import { PageShell } from "@/components/common/page-shell";
import { TimelineFeed } from "@/features/timeline/timeline-feed";

export const metadata: Metadata = {
  title: "타임라인",
  description: "한국 사회의 생활형 불안을 움직인 트리거 이벤트를 시간 순으로 살펴보세요.",
};

export default async function TimelinePage() {
  const events = await getEvents();
  return (
    <PageShell
      title="타임라인"
      description="지수를 움직인 트리거 이벤트를 시간 순으로 모았습니다. 카테고리·영향 방향으로 필터링할 수 있습니다."
    >
      <TimelineFeed events={events} />
    </PageShell>
  );
}
