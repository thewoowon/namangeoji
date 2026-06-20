import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/common/page-shell";
import { LEVEL_META } from "@/lib/levels";
import type { IndexLevel } from "@/lib/types";
import { InvestmentDisclaimer } from "@/components/common/disclaimer";

export const metadata: Metadata = {
  title: "방법론",
  description: "나만거지지수가 검색·뉴스·시장·공식 통계·이벤트 데이터를 어떻게 지수로 변환하는지 설명합니다.",
};

const LEVEL_ROWS: { range: string; level: IndexLevel }[] = [
  { range: "0~24", level: "STABLE" },
  { range: "25~44", level: "WATCH" },
  { range: "45~64", level: "CAUTION" },
  { range: "65~84", level: "ANXIOUS" },
  { range: "85~100", level: "OVERHEATED" },
];

export default function MethodologyPage() {
  return (
    <PageShell
      title="방법론"
      description="나만거지지수는 감이 아니라 데이터 기반 관측 도구입니다. 산식과 한계를 투명하게 공개합니다."
    >
      <div className="space-y-5">
        <section className="rounded-2xl border border-border-base bg-bg-surface p-5">
          <p className="text-[13.5px] leading-relaxed text-text-secondary">
            나만거지지수는 투자, 부동산, 고용, 노후, 물가 등 한국인의 생활형 불안 신호를 검색량, 뉴스량,
            시장 데이터, 공식 통계, 이벤트 데이터를 기반으로 정규화한 관측 지표입니다. 이 지수는 투자 조언,
            정책 판단, 의학적 진단, 여론조사 결과가 아닙니다.
          </p>
        </section>

        <section className="rounded-2xl border border-border-base bg-bg-surface p-5">
          <h2 className="text-[15px] font-bold text-text-primary">개별 지수 산식</h2>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-bg-base p-4 font-mono text-[12px] leading-relaxed text-text-secondary">
{`개별 지수 =
  검색 관심도 점수 × w1
+ 뉴스 관심도 점수 × w2
+ 시장 이벤트 점수 × w3
+ 공식 통계 변화 점수 × w4
+ 커뮤니티 언급 점수 × w5
+ 변동성/충격 점수 × w6

최종 점수는 0~100 범위로 변환됩니다.`}
          </pre>
        </section>

        <section className="rounded-2xl border border-border-base bg-bg-surface p-5">
          <h2 className="text-[15px] font-bold text-text-primary">점수 구간</h2>
          <div className="mt-3 space-y-2">
            {LEVEL_ROWS.map((row) => {
              const meta = LEVEL_META[row.level];
              return (
                <div key={row.level} className="flex items-center gap-3">
                  <span className="tnum w-16 shrink-0 text-[12px] text-text-muted">{row.range}</span>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
                    style={{ background: `color-mix(in srgb, ${meta.colorVar} 16%, transparent)`, color: meta.colorVar }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.colorVar }} aria-hidden />
                    {meta.label}
                  </span>
                  <span className="text-[12.5px] text-text-secondary">{meta.tone}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-border-base bg-bg-surface p-5">
          <h2 className="text-[15px] font-bold text-text-primary">신뢰도 산출</h2>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-bg-base p-4 font-mono text-[12px] leading-relaxed text-text-secondary">
{`confidence =
  0.30 × source_coverage
+ 0.25 × data_freshness
+ 0.20 × signal_agreement
+ 0.15 × historical_stability
+ 0.10 × anomaly_penalty_inverse`}
          </pre>
          <p className="mt-3 text-[12px] text-text-muted">
            데이터 커버리지·최근성·신호 일치도·과거 안정성·이상치 여부를 종합해 0~100으로 산출합니다.
          </p>
        </section>

        <section className="rounded-2xl border border-border-base bg-bg-surface p-5">
          <h2 className="text-[15px] font-bold text-text-primary">한계와 주의</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[12.5px] leading-relaxed text-text-secondary">
            <li>예측이 아니라 현재의 사회심리 상태를 관측하는 지표입니다.</li>
            <li>검색·커뮤니티 신호는 절대량이 아니라 상대 지표로 해석합니다.</li>
            <li>일부 공식 통계는 발표 주기에 따라 지연 반영됩니다.</li>
            <li>커뮤니티 데이터는 MVP에서 보류되어 ‘준비 중’으로 표시됩니다.</li>
          </ul>
        </section>

        <InvestmentDisclaimer />

        <p className="text-center text-[12px] text-text-muted">
          데이터 출처와 업데이트 주기는{" "}
          <Link href="/data-room" className="underline hover:text-text-secondary">데이터룸</Link>
          에서 확인할 수 있습니다.
        </p>
      </div>
    </PageShell>
  );
}
