import Link from "next/link";
import { getToday } from "@/lib/api/client";
import { SectionHeader } from "@/components/common/page-shell";
import { InvestmentDisclaimer } from "@/components/common/disclaimer";
import { CompositeHeroCard } from "@/components/dashboard/composite-hero-card";
import { RisingIndexStrip } from "@/components/dashboard/rising-index-strip";
import { CategoryHeatmap } from "@/components/dashboard/category-heatmap";
import { TriggerEventList } from "@/components/dashboard/trigger-event-list";
import { IndexCard } from "@/components/index-card/index-card";
import { ShareButton } from "@/components/share/share-button";
import { DeltaBadge } from "@/components/common/badges";
import { formatDateTimeKST } from "@/lib/format";

export async function TodayDashboard() {
  const { composite, topIndices: top, risingIndices: rising, fallingIndices: falling, categories, events } =
    await getToday();

  return (
    <div className="px-4 py-5 md:px-6 md:py-8">
      <CompositeHeroCard composite={composite} />

      {/* 급등/급락 */}
      <div className="mt-6 grid gap-5 md:grid-cols-[1.4fr_1fr]">
        <section>
          <SectionHeader title="급등 포비아" />
          <RisingIndexStrip indices={rising} />
        </section>
        <section>
          <SectionHeader title="급락 포비아" />
          <div className="space-y-2">
            {falling.map((idx) => (
              <Link
                key={idx.slug}
                href={`/indices/${idx.slug}`}
                className="flex items-center gap-3 rounded-xl border border-border-base bg-bg-surface px-3 py-2.5 transition-colors hover:border-border-strong"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-text-primary">{idx.shortName}</div>
                  <div className="tnum text-[11px] text-text-muted">{idx.score}점</div>
                </div>
                <DeltaBadge delta={idx.delta1d} />
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* TOP 10 */}
      <section className="mt-8">
        <SectionHeader title="오늘의 포비아 TOP 10" action={{ label: "전체 지수", href: "/indices" }} />
        <div className="grid gap-3 sm:grid-cols-2">
          {top.map((idx, i) => (
            <IndexCard key={idx.slug} index={idx} rank={i + 1} />
          ))}
        </div>
      </section>

      {/* 카테고리 + 트리거 */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section>
          <SectionHeader title="카테고리별 지수" action={{ label: "카테고리", href: "/categories" }} />
          <CategoryHeatmap categories={categories} />
        </section>
        <section>
          <SectionHeader title="오늘의 트리거 이벤트" action={{ label: "타임라인", href: "/timeline" }} />
          <TriggerEventList events={events.slice(0, 4)} compact />
        </section>
      </div>

      {/* 공유 CTA + 고지 */}
      <section className="mt-8 grid gap-3 md:grid-cols-[1fr_2fr]">
        <div className="rounded-2xl border border-border-base bg-bg-surface p-4">
          <h3 className="text-[14px] font-bold text-text-primary">오늘의 지수, 공유하기</h3>
          <p className="mt-1 mb-3 text-[12px] text-text-secondary">
            캡처해서 단톡방·커뮤니티에 바로 올려보세요.
          </p>
          <ShareButton
            variant="full"
            title={`오늘의 나만거지지수 ${composite.score}점`}
            text={composite.summary}
            path="/today"
          />
        </div>
        <div className="flex flex-col justify-center gap-2">
          <InvestmentDisclaimer />
          <p className="px-1 text-[11px] text-text-muted">
            마지막 업데이트: {formatDateTimeKST(composite.updatedAt)} · 일부 공식 통계는 발표 주기에 따라 지연 반영됩니다 ·
            시장 데이터는 장마감 기준입니다.{" "}
            <Link href="/methodology" className="underline hover:text-text-secondary">
              방법론 보기
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
