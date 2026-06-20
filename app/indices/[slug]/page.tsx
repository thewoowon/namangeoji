import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs } from "@/lib/data";
import { getIndexDetail } from "@/lib/api/client";
import { CATEGORY_META, LEVEL_META, confidenceLabel } from "@/lib/levels";
import { ScoreGauge } from "@/components/charts/score-gauge";
import { LineChartWithEvents } from "@/components/charts/line-chart";
import { SignalContributionTable } from "@/components/index-card/signal-contribution-table";
import { TriggerEventList } from "@/components/dashboard/trigger-event-list";
import { IndexCard } from "@/components/index-card/index-card";
import { Accordion } from "@/components/common/accordion";
import { InvestmentDisclaimer } from "@/components/common/disclaimer";
import { CategoryBadge, ConfidenceBadge, DeltaBadge } from "@/components/common/badges";
import { ShareButton } from "@/components/share/share-button";
import { SectionHeader } from "@/components/common/page-shell";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/indices/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const idx = await getIndexDetail(slug);
  if (!idx) return { title: "지수를 찾을 수 없습니다" };
  return {
    title: idx.name,
    description: idx.summary,
    openGraph: {
      title: `${idx.name} ${idx.score}점`,
      description: idx.summary,
      images: [{ url: `/api/og?type=index_detail&slug=${idx.slug}`, width: 1200, height: 630 }],
    },
  };
}

export default async function IndexDetailPage({ params }: PageProps<"/indices/[slug]">) {
  const { slug } = await params;
  const idx = await getIndexDetail(slug);
  if (!idx) notFound();

  const meta = LEVEL_META[idx.level];
  const conf = confidenceLabel(idx.confidence);
  const related = (await Promise.all(idx.relatedSlugs.map((s) => getIndexDetail(s)))).filter(
    (x): x is NonNullable<typeof x> => !!x,
  );
  const lowConfidence = idx.confidence < 60;

  return (
    <div className="px-4 py-5 md:px-6 md:py-8">
      <Link href="/indices" className="mb-3 inline-block text-[12px] text-text-muted hover:text-text-secondary">
        ← 전체 지수
      </Link>

      {/* 헤더 */}
      <header className="grid gap-5 rounded-3xl border border-border-base bg-bg-surface p-5 md:grid-cols-[auto_1fr] md:p-7">
        <div className="flex justify-center md:block">
          <ScoreGauge score={idx.score} size={176} />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={idx.category} />
            <span className="text-[12px] text-text-muted">{CATEGORY_META[idx.category].name}</span>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-text-primary">{idx.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <DeltaBadge delta={idx.delta1d} suffix="1일" />
            <DeltaBadge delta={idx.delta7d} suffix="7일" />
            <DeltaBadge delta={idx.delta30d} suffix="30일" />
            <ConfidenceBadge value={idx.confidence} />
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-text-primary">{idx.headline}</p>
          <p className="mt-1 text-[12.5px] text-text-secondary">{meta.tone}</p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {idx.keywords.map((kw) => (
              <span key={kw} className="rounded-md bg-bg-elevated px-2 py-0.5 text-[11px] text-text-secondary">
                {kw}
              </span>
            ))}
          </div>
        </div>
      </header>

      {lowConfidence ? (
        <p className="mt-3 rounded-xl border px-3.5 py-2.5 text-[12px]" style={{ borderColor: conf.colorVar, color: "var(--text-secondary)" }}>
          ⚠ 이 지수는 현재 {conf.label} 상태입니다. 일부 데이터 소스가 지연되어 최신 점수의 신뢰도가 낮을 수 있습니다.
        </p>
      ) : null}

      {/* 차트 */}
      <section className="mt-6 rounded-2xl border border-border-base bg-bg-surface p-4 md:p-5">
        <SectionHeader title="점수 추이" />
        <LineChartWithEvents series={idx.series30d} events={idx.events} color={meta.colorVar} />
      </section>

      {/* 신호 분해 + 트리거 */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section>
          <SectionHeader title="데이터 신호 분해" />
          <SignalContributionTable components={idx.components} />
          <p className="mt-2 px-1 text-[11px] text-text-muted">
            기준선 대비 σ는 최근 윈도우의 중앙값·MAD 기반 robust z-score입니다. ‘준비 중’ 신호는 점수 산출에서 제외됩니다.
          </p>
        </section>
        <section>
          <SectionHeader title="관련 트리거 이벤트" action={{ label: "타임라인", href: "/timeline" }} />
          {idx.events.length ? (
            <TriggerEventList events={idx.events} />
          ) : (
            <p className="rounded-xl border border-border-base bg-bg-surface px-3.5 py-4 text-[12.5px] text-text-muted">
              최근 등록된 트리거 이벤트가 없습니다.
            </p>
          )}
        </section>
      </div>

      {/* 산식 / 방법론 */}
      <section className="mt-6 space-y-3">
        <Accordion title="이 점수는 어떻게 산출되나요?">
          <div className="space-y-3">
            <p className="text-[12.5px] leading-relaxed text-text-secondary">{idx.description}</p>
            <div className="space-y-1.5">
              {idx.weights.map((w) => (
                <div key={w.label} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-[12px] text-text-secondary">{w.label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-elevated">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${w.weight * 100 * 3}%`, maxWidth: "100%" }} />
                  </div>
                  <span className="tnum w-10 text-right text-[12px] font-semibold text-text-primary">
                    {(w.weight * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-border-base pt-2 text-[11px] text-text-muted">
              <span>산식 버전 {idx.methodologyVersion}</span>
              <Link href={`/indices/${idx.slug}/methodology`} className="underline hover:text-text-secondary">
                자세한 방법론 →
              </Link>
            </div>
          </div>
        </Accordion>

        <Accordion title="사용 데이터 · 주의사항">
          <p className="text-[12.5px] text-text-secondary">
            사용 데이터: {idx.dataSources.join(", ")}
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-text-muted">
            이 지수는 가격 전망이나 정책 판단 지표가 아닙니다. 관련 정보량과 검색·뉴스 신호의 급증을 나타내는 사회심리 보조 지표입니다.
          </p>
        </Accordion>
      </section>

      {/* 관련 지수 */}
      {related.length ? (
        <section className="mt-8">
          <SectionHeader title="비슷한 지수" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <IndexCard key={r.slug} index={r} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-6">
        <InvestmentDisclaimer />
      </div>

      {/* 모바일 sticky 공유 CTA (spec §14.6) */}
      <div
        className="fixed inset-x-0 bottom-14 z-20 border-t border-border-base bg-bg-base/95 p-3 backdrop-blur md:hidden"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
      >
        <ShareButton variant="full" title={`${idx.name} ${idx.score}점`} text={idx.summary} path={`/indices/${idx.slug}`} />
      </div>
    </div>
  );
}
