import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs } from "@/lib/data";
import { getIndexDetail } from "@/lib/api/client";
import { PageShell } from "@/components/common/page-shell";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/indices/[slug]/methodology">): Promise<Metadata> {
  const { slug } = await params;
  const idx = await getIndexDetail(slug);
  return { title: idx ? `${idx.name} 산식` : "산식" };
}

export default async function IndexMethodologyPage({ params }: PageProps<"/indices/[slug]/methodology">) {
  const { slug } = await params;
  const idx = await getIndexDetail(slug);
  if (!idx) notFound();

  return (
    <PageShell title={`${idx.name} · 산식`} description={idx.description}>
      <Link href={`/indices/${idx.slug}`} className="mb-4 inline-block text-[12px] text-text-muted hover:text-text-secondary">
        ← 지수 상세로
      </Link>

      <div className="space-y-5">
        <section className="rounded-2xl border border-border-base bg-bg-surface p-5">
          <h2 className="text-[15px] font-bold text-text-primary">신호 구성</h2>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-bg-base p-4 font-mono text-[12px] leading-relaxed text-text-secondary">
{`${idx.code} =
${idx.weights.map((w) => `  ${(w.weight).toFixed(2)} × ${w.label}`).join("\n")}`}
          </pre>
        </section>

        <section className="rounded-2xl border border-border-base bg-bg-surface p-5">
          <h2 className="text-[15px] font-bold text-text-primary">공통 산출 단계</h2>
          <ol className="mt-3 space-y-1.5 text-[13px] text-text-secondary">
            {[
              "Raw Signal 수집 (검색·뉴스·시장·공식통계·이벤트)",
              "Cleaning · Deduplication · Missing 처리",
              "Baseline 산출 후 Robust Z-score (중앙값·MAD)",
              "Component Score 0~100 변환 (sigmoid)",
              "가중 합산 (Weighted Aggregation)",
              "Smoothing (0.70 today + 0.30 yesterday)",
              "Confidence Scoring",
            ].map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="tnum text-text-muted">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-border-base bg-bg-surface p-5">
          <h2 className="text-[15px] font-bold text-text-primary">사용 데이터</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {idx.dataSources.map((src) => (
              <li key={src} className="rounded-lg bg-bg-elevated px-2.5 py-1 text-[12px] text-text-secondary">
                {src}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11.5px] text-text-muted">
            산식 버전 {idx.methodologyVersion}. 산식이 변경되면 버전을 올리고 상세 페이지에 변경 이력을 표시합니다.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
