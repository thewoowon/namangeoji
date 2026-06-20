import type { Metadata } from "next";
import Link from "next/link";
import { getIndexDetail } from "@/lib/api/client";
import { InvestmentDisclaimer } from "@/components/common/disclaimer";

/**
 * 공유 카드 랜딩 페이지 (spec §5 /share/[shareId]).
 * shareId 형식: `shr_<ts>` 또는 `shr_<ts>_<slug>` — slug가 있으면 개별 지수 카드.
 */
function parseShareId(shareId: string): { slug: string | null } {
  const m = shareId.match(/^shr_[a-z0-9]+_(.+)$/i);
  return { slug: m ? m[1] : null };
}

function ogUrl(slug: string | null): string {
  return slug ? `/api/og?type=index_detail&slug=${encodeURIComponent(slug)}` : `/api/og?type=today_summary`;
}

export async function generateMetadata({ params }: PageProps<"/share/[shareId]">): Promise<Metadata> {
  const { shareId } = await params;
  const { slug } = parseShareId(shareId);
  const idx = slug ? await getIndexDetail(slug) : null;
  const title = idx ? `${idx.name} ${idx.score}점` : "오늘의 나만거지지수";
  const description = idx?.summary ?? "오늘 한국인의 생활형 FOMO 온도를 확인하세요.";
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: ogUrl(slug), width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [ogUrl(slug)] },
  };
}

export default async function SharePage({ params }: PageProps<"/share/[shareId]">) {
  const { shareId } = await params;
  const { slug } = parseShareId(shareId);
  const idx = slug ? await getIndexDetail(slug) : null;
  const target = idx ? `/indices/${idx.slug}` : "/today";

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="overflow-hidden rounded-2xl border border-border-base bg-bg-surface">
        {/* 1200×630 비율 미리보기 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ogUrl(slug)}
          alt={idx ? `${idx.name} 공유 카드` : "오늘의 나만거지지수 공유 카드"}
          width={1200}
          height={630}
          className="h-auto w-full"
        />
      </div>

      <h1 className="mt-5 text-lg font-bold text-text-primary">
        {idx ? idx.name : "오늘의 나만거지지수"}
      </h1>
      <p className="mt-1 text-[13px] text-text-secondary">
        {idx?.summary ?? "오늘 한국인의 생활형 FOMO 온도를 데이터로 관측합니다."}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={target} className="rounded-xl bg-accent px-4 py-2.5 text-[13px] font-bold text-black hover:opacity-90">
          {idx ? "지수 자세히 보기" : "오늘의 포비아 보기"}
        </Link>
        <Link href="/today" className="rounded-xl bg-bg-elevated px-4 py-2.5 text-[13px] font-semibold text-text-primary hover:opacity-90">
          전체 대시보드
        </Link>
      </div>

      <div className="mt-6">
        <InvestmentDisclaimer />
      </div>
    </div>
  );
}
